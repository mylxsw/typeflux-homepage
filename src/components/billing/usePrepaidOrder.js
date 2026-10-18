import { useCallback, useEffect, useRef, useState } from 'react'
import {
  closePrepaidOrder,
  createPrepaidOrder,
  createRequestId,
  fetchPrepaidOrder,
  fetchPrepaidOrders,
} from '../../lib/billingApi'
import { isPrepaidMethod } from './checkoutModel'

export const PREPAID_INTENT_STORAGE_KEY = 'typeflux.prepaidIntent'

export function isWaiting(order) {
  return Boolean(order && order.status !== 'closed' && order.fulfillment === 'pending')
}

export function isUnresolved(order) {
  return isWaiting(order) || order?.fulfillment === 'review'
}

// The purchase intent is saved before the create request so a lost response
// retries with the same request ID instead of creating a second order.
export function readIntent(storage) {
  try {
    const item = JSON.parse(resolveStorage(storage)?.getItem(PREPAID_INTENT_STORAGE_KEY) || 'null')
    if (!item || typeof item.request_id !== 'string' || !item.request_id || !isPrepaidMethod(item.channel)) return null
    const pack = typeof item.pack_code === 'string' && item.pack_code
    const plan = typeof item.plan_code === 'string' && item.plan_code && ['month', 'quarter', 'year'].includes(item.billing_interval)
    return pack || plan ? item : null
  } catch {
    return null
  }
}

export function writeIntent(intent, storage) {
  try {
    const target = resolveStorage(storage)
    if (intent) target?.setItem(PREPAID_INTENT_STORAGE_KEY, JSON.stringify(intent))
    else target?.removeItem(PREPAID_INTENT_STORAGE_KEY)
  } catch {
    // Server-side recovery of unresolved orders also works without storage.
  }
}

export function sameSelection(intent, selection) {
  if (!intent || !selection || intent.channel !== selection.channel) return false
  if (selection.pack_code) return intent.pack_code === selection.pack_code
  return intent.plan_code === selection.plan_code && intent.billing_interval === selection.billing_interval
}

function intentFromOrder(order) {
  return {
    request_id: order.id,
    order_id: order.id,
    channel: order.channel,
    ...(order.kind === 'credit_pack'
      ? { pack_code: order.pack_code }
      : { plan_code: order.plan_code, billing_interval: order.billing_interval }),
  }
}

// Owns the account's single Alipay/WeChat order: recovery after reloads,
// creation with a stable request ID, status polling, and cancellation.
export function usePrepaidOrder({
  token,
  createOrder = createPrepaidOrder,
  getOrder = fetchPrepaidOrder,
  listOrders = fetchPrepaidOrders,
  closeOrder = closePrepaidOrder,
  newRequestId = createRequestId,
  pollInterval = 2000,
  maxPolls = 90,
  storage,
  onGranted,
  onExpired,
  onRecovered,
}) {
  const [intent, setIntent] = useState(() => (token ? readIntent(storage) : null))
  const [order, setOrder] = useState(null)
  const [recovering, setRecovering] = useState(Boolean(token))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [pollPaused, setPollPaused] = useState(false)
  const [pollKey, setPollKey] = useState(0)
  const [recoverKey, setRecoverKey] = useState(0)
  const operation = useRef(null)
  const callbacks = useRef({ onGranted, onExpired, onRecovered })
  const notified = useRef('')

  useEffect(() => {
    callbacks.current = { onGranted, onExpired, onRecovered }
  }, [onGranted, onExpired, onRecovered])

  const handleFailure = useCallback((failure, kind = 'failed') => {
    if (failure?.name === 'AbortError') return
    if (failure?.kind === 'expired_token') {
      callbacks.current.onExpired?.()
      return
    }
    setError(kind)
  }, [])

  useEffect(() => {
    if (!token) return undefined
    const controller = new AbortController()
    const { signal } = controller
    const recover = async () => {
      setRecovering(true)
      setError('')
      setOrder(null)
      try {
        const saved = readIntent(storage)
        let next = null
        if (saved) {
          next = await getOrder(token, saved.order_id || saved.request_id, { signal })
          if (signal.aborted) return
          const confirmed = { ...saved, order_id: next.id }
          writeIntent(confirmed, storage)
          setIntent(confirmed)
        } else {
          const orders = await listOrders(token, { signal })
          if (signal.aborted) return
          const pending = (orders || []).find(isUnresolved)
          if (pending) {
            next = await getOrder(token, pending.id, { signal })
            if (signal.aborted) return
            const recovered = intentFromOrder(next)
            writeIntent(recovered, storage)
            setIntent(recovered)
          } else {
            setIntent(null)
          }
        }
        if (next && !isUnresolved(next) && next.fulfillment !== 'granted') {
          // A closed or refunded order needs no attention after a reload.
          writeIntent(null, storage)
          setIntent(null)
          next = null
        }
        setOrder(next)
        if (next) callbacks.current.onRecovered?.(next)
      } catch (failure) {
        if (signal.aborted) return
        if (failure?.status === 404) {
          // The saved request never reached the server; nothing can be charged.
          writeIntent(null, storage)
          setIntent(null)
        } else {
          handleFailure(failure, 'recovery')
        }
      } finally {
        if (!signal.aborted) setRecovering(false)
      }
    }
    recover()
    return () => {
      controller.abort()
      operation.current?.abort()
      operation.current = null
    }
  }, [getOrder, handleFailure, listOrders, recoverKey, storage, token])

  const waiting = isWaiting(order)
  useEffect(() => {
    if (!waiting || pollPaused || !token) return undefined
    const controller = new AbortController()
    let timer
    let count = 0
    const poll = async () => {
      try {
        const next = await getOrder(token, order.id, { signal: controller.signal })
        if (controller.signal.aborted) return
        setOrder(next)
        if (!isWaiting(next)) return
      } catch (failure) {
        if (controller.signal.aborted) return
        if (failure?.kind === 'expired_token') {
          callbacks.current.onExpired?.()
          return
        }
      }
      count += 1
      if (count >= maxPolls) setPollPaused(true)
      else timer = setTimeout(poll, pollInterval)
    }
    timer = setTimeout(poll, pollInterval)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
    // Polling follows the order identity and state, not every response object.
  }, [order?.id, order?.status, order?.fulfillment, waiting, pollPaused, pollKey, token, getOrder, maxPolls, pollInterval])

  useEffect(() => {
    if (order?.fulfillment === 'granted' && notified.current !== order.id) {
      notified.current = order.id
      callbacks.current.onGranted?.(order)
    }
  }, [order])

  const run = useCallback(async (action) => {
    if (operation.current) return null
    const controller = new AbortController()
    operation.current = controller
    setBusy(true)
    setError('')
    try {
      return await action(controller.signal)
    } catch (failure) {
      if (!controller.signal.aborted) handleFailure(failure)
      return null
    } finally {
      if (operation.current === controller) {
        operation.current = null
        setBusy(false)
      }
    }
  }, [handleFailure])

  const start = useCallback((selection) => {
    if (!token || isUnresolved(order) || recovering) return Promise.resolve(null)
    return run(async (signal) => {
      // Retrying an unconfirmed purchase keeps its request ID; any other
      // selection, or one whose order already ended, is a new purchase.
      const reuse = !order && sameSelection(intent, selection)
      const nextIntent = reuse ? intent : { request_id: newRequestId(), ...selection }
      writeIntent(nextIntent, storage)
      setIntent(nextIntent)
      setOrder(null)
      setPollPaused(false)
      const next = await createOrder(token, nextIntent, { signal })
      if (signal.aborted) return null
      const confirmed = { ...nextIntent, order_id: next.id }
      writeIntent(confirmed, storage)
      setIntent(confirmed)
      setOrder(next)
      return next
    })
  }, [createOrder, intent, newRequestId, order, recovering, run, storage, token])

  const check = useCallback(() => {
    if (!order) return Promise.resolve(null)
    return run(async (signal) => {
      const next = await getOrder(token, order.id, { signal })
      if (signal.aborted) return null
      setOrder(next)
      setPollPaused(false)
      setPollKey((key) => key + 1)
      return next
    })
  }, [getOrder, order, run, token])

  const cancel = useCallback(() => {
    if (!order || order.status === 'paid') return Promise.resolve(null)
    return run(async (signal) => {
      const next = await closeOrder(token, order.id, { signal })
      if (signal.aborted) return null
      setOrder(next)
      return next
    })
  }, [closeOrder, order, run, token])

  // Forgets a finished order so the next purchase starts fresh. Unresolved
  // orders are kept: they must be paid, closed or reviewed first.
  const clear = useCallback(() => {
    if (isUnresolved(order)) return
    writeIntent(null, storage)
    setIntent(null)
    setOrder(null)
    setError('')
    setPollPaused(false)
  }, [order, storage])

  const retryRecovery = useCallback(() => setRecoverKey((key) => key + 1), [])

  const unconfirmed = Boolean(intent && !order && !recovering)
  return {
    intent,
    order,
    busy,
    recovering,
    error,
    pollPaused,
    waiting,
    unconfirmed,
    // Any state in which a different purchase must not start.
    locked: recovering || busy || isUnresolved(order) || unconfirmed || error === 'recovery',
    start,
    check,
    cancel,
    clear,
    retryRecovery,
  }
}

function resolveStorage(storage) {
  if (storage !== undefined) return storage
  try {
    return globalThis.sessionStorage
  } catch {
    return null
  }
}
