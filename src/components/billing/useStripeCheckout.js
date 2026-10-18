import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createBillingCheckoutSession,
  createCreditPackCheckoutSession,
  createRequestId,
} from '../../lib/billingApi'

export const CREDIT_PACK_SELECTION_STORAGE_KEY = 'typeflux.creditPackSelection'
// Backoff for BILLING_CHECKOUT_PENDING: the server is still resolving an
// earlier checkout for this account, so the same selection is retried.
export const CHECKOUT_PENDING_RETRY_DELAYS_MS = [2000, 5000, 10000]

export function waitFor(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

// Maps a Stripe checkout failure to the message key shown in the order panel.
export function stripeErrorKey(error, kind = 'membership') {
  if (error?.kind === 'conflict') return 'conflict'
  if (error?.kind === 'checkout_pending') return 'pending'
  if (error?.kind === 'reconciliation_required') return 'reconciliation'
  if (error?.kind === 'rate_limited' && kind === 'credits') return 'rateLimited'
  if (error?.code === 'CREDIT_PACK_REQUEST_EXPIRED') return 'requestExpired'
  if (error?.kind === 'billing_disabled') return 'billingDisabled'
  return 'failed'
}

function isTransient(error) {
  return error?.kind === 'network' || error?.kind === 'unavailable'
}

// Opens Stripe Checkout for a subscription or a credit pack. Only the
// current operation may navigate; leaving the page or changing token aborts.
export function useStripeCheckout({
  token,
  createMembershipCheckout = createBillingCheckoutSession,
  createPackCheckout = createCreditPackCheckoutSession,
  redirect = (url) => window.location.assign(url),
  newRequestId = createRequestId,
  pendingRetryDelays = CHECKOUT_PENDING_RETRY_DELAYS_MS,
  wait = waitFor,
  storage,
  onExpired,
  onConflict,
}) {
  const [busyKey, setBusyKey] = useState('')
  const [error, setError] = useState('')
  const operation = useRef(null)
  // The request ID of a pack purchase whose checkout call failed transiently.
  // Retrying the same pack reuses it so a lost response cannot charge twice.
  const pendingPack = useRef(null)
  const callbacks = useRef({ onExpired, onConflict })
  useEffect(() => {
    callbacks.current = { onExpired, onConflict }
  }, [onExpired, onConflict])

  useEffect(() => {
    pendingPack.current = null
    return () => {
      operation.current?.abort()
      operation.current = null
    }
  }, [token])

  // Returning with the browser's Back button restores the page from the
  // back/forward cache; release the in-flight state.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        operation.current = null
        setBusyKey('')
      }
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

  const begin = useCallback(async (key, kind, request) => {
    if (!token || operation.current) return
    const controller = new AbortController()
    operation.current = controller
    const { signal } = controller
    const isCurrent = () => !signal.aborted && operation.current === controller
    setBusyKey(key)
    setError('')
    let created = false
    try {
      const url = await request(signal, () => { created = true })
      if (!isCurrent()) return
      redirect(url)
      if (kind === 'credits') pendingPack.current = null
      operation.current = null
    } catch (failure) {
      if (failure?.name === 'AbortError' || !isCurrent()) return
      operation.current = null
      setBusyKey('')
      if (failure?.kind === 'expired_token') {
        pendingPack.current = null
        callbacks.current.onExpired?.()
        return
      }
      // A created session or uncertain transport failure keeps the pack
      // request ID; definite rejections start over with a new one.
      if (kind === 'credits' && !created && !isTransient(failure) && failure?.kind !== 'reconciliation_required') {
        pendingPack.current = null
      }
      setError(stripeErrorKey(failure, kind))
      if (failure?.kind === 'conflict') callbacks.current.onConflict?.()
    }
  }, [redirect, token])

  const subscribe = useCallback((planCode, interval) => begin(`plan:${planCode}:${interval}`, 'membership', async (signal) => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await createMembershipCheckout(token, planCode, interval, { signal })
      } catch (failure) {
        if (signal.aborted) throw failure
        if (failure?.kind !== 'checkout_pending' || attempt >= pendingRetryDelays.length) throw failure
        await wait(pendingRetryDelays[attempt], signal)
      }
    }
  }), [begin, createMembershipCheckout, pendingRetryDelays, token, wait])

  const buyPack = useCallback((packCode) => begin(`pack:${packCode}`, 'credits', async (signal, markCreated) => {
    const requestId = pendingPack.current?.packCode === packCode ? pendingPack.current.requestId : newRequestId()
    pendingPack.current = { packCode, requestId }
    const session = await createPackCheckout(token, packCode, requestId, { signal })
    markCreated()
    writePackSelection(packCode, storage)
    return session.url
  }), [begin, createPackCheckout, newRequestId, storage, token])

  const clearError = useCallback(() => setError(''), [])

  return { busyKey, busy: Boolean(busyKey), error, subscribe, buyPack, clearError }
}

export function readPackSelection(storage) {
  try {
    return resolveStorage(storage)?.getItem(CREDIT_PACK_SELECTION_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function writePackSelection(code, storage) {
  try {
    if (code) resolveStorage(storage)?.setItem(CREDIT_PACK_SELECTION_STORAGE_KEY, code)
    else resolveStorage(storage)?.removeItem(CREDIT_PACK_SELECTION_STORAGE_KEY)
  } catch {
    // Restoring the selection after a canceled checkout is best effort.
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
