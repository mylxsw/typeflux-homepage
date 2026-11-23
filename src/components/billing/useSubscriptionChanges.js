import { useCallback, useEffect, useRef, useState } from 'react'
import { previewSubscriptionChange, confirmSubscriptionChange, fetchSubscriptionChange, cancelSubscriptionChange } from '../../lib/billingApi'

export function useSubscriptionChanges({ token, enabled, onComplete, onExpired, redirect = (url) => window.location.assign(url),
  previewChange = previewSubscriptionChange, confirmChange = confirmSubscriptionChange, fetchChange = fetchSubscriptionChange, cancelChange = cancelSubscriptionChange }) {
  const [quote, setQuote] = useState(null)
  const [order, setOrder] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [owner, setOwner] = useState(token)
  const operation = useRef(null)
  const callbacks = useRef({ onComplete, onExpired })
  callbacks.current = { onComplete, onExpired }
  const completed = useRef('')
  const polling = useRef(null)
  const [revision, setRevision] = useState(0)
  const orderID = owner === token ? order?.id || '' : ''

  useEffect(() => {
    setOwner(token); setQuote(null); setOrder(null); setError(false); setBusy(false); completed.current = ''
    return () => { operation.current?.abort(); operation.current = null }
  }, [enabled, token])

  useEffect(() => {
    if (!enabled || !token) return undefined
    const controller = new AbortController()
    polling.current = controller
    let timer
    const returned = new URLSearchParams(window.location.search).get('change_order')
    let id = orderID || 'current'
    const poll = async () => {
      try {
        let current = await fetchChange(token, id, { signal: controller.signal })
        if (!current && id === 'current' && returned && !controller.signal.aborted) current = await fetchChange(token, returned, { signal: controller.signal })
        if (controller.signal.aborted) return
        setError(false)
        setOrder(current || null)
        if (current && ['creating', 'open', 'paid', 'scheduled'].includes(current.status)) setQuote(null)
        if (current?.id) id = current.id
        if (current?.status === 'applied' && completed.current !== current.id) {
          completed.current = current.id; callbacks.current.onComplete?.()
        }
        if (current && ['creating', 'open', 'paid'].includes(current.status)) timer = setTimeout(poll, 3000)
      } catch (failure) {
        if (controller.signal.aborted) return
        if (failure?.kind === 'expired_token') callbacks.current.onExpired?.()
        else { setError(true); timer = setTimeout(poll, 5000) }
      }
    }
    poll()
    return () => { controller.abort(); clearTimeout(timer); if (polling.current === controller) polling.current = null }
  }, [enabled, token, fetchChange, orderID, revision])

  const perform = useCallback(async (work) => {
    if (operation.current || !enabled || !token) return
    polling.current?.abort()
    const controller = new AbortController(); operation.current = controller; setBusy(true); setError(false)
    try { await work(controller.signal) } catch (failure) {
      if (!controller.signal.aborted) {
        if (failure?.kind === 'expired_token') callbacks.current.onExpired?.()
        else setError(true)
      }
    } finally { if (operation.current === controller) { operation.current = null; setBusy(false); setRevision((value) => value + 1) } }
  }, [enabled, token])

  const preview = useCallback((plan, interval) => perform(async (signal) => {
    const result = await previewChange(token, plan, interval, { signal })
    if (!signal.aborted) setQuote(result)
  }), [perform, previewChange, token])

  const confirm = useCallback(() => perform(async (signal) => {
    if (!quote) return
    const result = await confirmChange(token, quote, { signal })
    if (signal.aborted) return
    setOrder(result); setQuote(null)
    if (result?.url && result.status === 'open') redirect(result.url)
    else callbacks.current.onComplete?.()
  }), [confirmChange, perform, quote, redirect, token])

  const cancel = useCallback(() => perform(async (signal) => {
    if (!order) return
    const result = await cancelChange(token, order.id, { signal })
    if (signal.aborted) return
    setOrder(result); callbacks.current.onComplete?.()
  }), [cancelChange, order, perform, token])

  const current = enabled && owner === token
  return { quote: current ? quote : null, order: current ? order : null, busy: current && busy, error: current && error, preview, confirm, cancel, dismiss: () => { if (!busy) setQuote(null) }, resume: () => { if (current && order?.url) redirect(order.url) } }
}
