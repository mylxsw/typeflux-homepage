import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAccountSession } from '../../contexts/AccountSessionContext.jsx'
import { exchangeHandoff } from '../../lib/accountApi'
import { clearBillingPageToken, resolveBillingPageToken, sessionCredential } from '../../lib/billingApi'

// parseBillingHandoff reads the one-time website sign-in code the API appends
// to App billing links (#t=<page token>&h=<code>).
export function parseBillingHandoff(hash = '') {
  const code = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash).get('h') || ''
  return /^[A-Za-z0-9_-]{43}$/.test(code) ? code : ''
}

// readFragment has no side effects beyond persisting the page token, so React
// may call it more than once (StrictMode); the URL is cleaned up in an effect.
function readFragment(location) {
  const legacy = resolveBillingPageToken(location.hash)
  const handoff = parseBillingHandoff(location.hash)
  // Keep the historical rule (strip only a persisted page token so a reload still
  // works) but always strip a handoff code: it is single use and must not linger.
  return { legacy: legacy.token, handoff, strip: (legacy.fromHash && legacy.persisted) || Boolean(handoff) }
}

// useBillingAccess decides which credential the billing page uses:
// 1. An App handoff code signs this browser in (asking first if another account
//    is signed in), then the page uses the website session.
// 2. Otherwise an App billing-page token, when present, is used as before.
// 3. Otherwise an existing website session is used.
// status: resolving | mismatch | ready (token may be '' when nothing is available).
export function useBillingAccess({ exchange = exchangeHandoff, location = window.location } = {}) {
  const session = useAccountSession()
  const [fragment] = useState(() => readFragment(location))
  const enabled = session.status !== 'disabled'
  const [handoff, setHandoff] = useState(() => ({ phase: fragment.handoff && enabled ? 'pending' : 'none', result: null, busy: false, failed: false }))
  const started = useRef(null)
  const { refresh } = session

  useEffect(() => {
    if (fragment.strip) clearBillingPageToken()
  }, [fragment.strip])

  useEffect(() => {
    if (handoff.phase !== 'pending') return undefined
    let alive = true
    started.current ||= exchange(fragment.handoff)
    started.current.then(async (result) => {
      if (result.status === 'mismatch') {
        if (alive) setHandoff({ phase: 'mismatch', result, busy: false, failed: false })
        return
      }
      await refresh()
      if (alive) setHandoff({ phase: 'done', result, busy: false, failed: false })
    }).catch(() => {
      // An expired or used code falls back to the page token or existing session.
      if (alive) setHandoff({ phase: 'failed', result: null, busy: false, failed: false })
    })
    return () => { alive = false }
  }, [exchange, fragment.handoff, handoff.phase, refresh])

  const choose = useCallback(async (replace) => {
    if (!replace) {
      setHandoff((h) => ({ ...h, phase: 'done' }))
      return
    }
    setHandoff((h) => ({ ...h, busy: true, failed: false }))
    try {
      await exchange(fragment.handoff, { replace: true })
      await refresh()
      setHandoff((h) => ({ ...h, phase: 'done', busy: false }))
    } catch {
      setHandoff((h) => ({ ...h, busy: false, failed: true }))
    }
  }, [exchange, fragment.handoff, refresh])

  const credential = useMemo(() => (session.status === 'signedIn' ? sessionCredential(session.csrf) : null), [session.status, session.csrf])

  if (handoff.phase === 'pending') return { status: 'resolving', token: '', source: '' }
  if (handoff.phase === 'mismatch') return { status: 'mismatch', token: '', source: '', mismatch: handoff, choose }
  const viaHandoff = handoff.phase === 'done'
  if (!viaHandoff && fragment.legacy) return { status: 'ready', token: fragment.legacy, source: 'page' }
  if (session.status === 'loading') return { status: 'resolving', token: '', source: '' }
  if (credential) return { status: 'ready', token: credential, source: 'session' }
  return { status: 'ready', token: fragment.legacy, source: fragment.legacy ? 'page' : '' }
}
