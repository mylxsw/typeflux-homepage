import { useCallback, useEffect, useRef, useState } from 'react'
import { errorKey } from './authCopy'

export function useAuthFlow({ transaction, api, enabled, navigate }) {
  const [state, setState] = useState({ view: !enabled ? 'disabled' : transaction ? 'loading' : 'direct', session: null,
    message: '', busy: '', handoff: null, cooldowns: {}, now: Date.now(), redirecting: '' })
  const update = useCallback(patch => setState(previous => ({ ...previous, ...patch })), [])
  const active = useRef(false)
  const working = useRef(false)
  const completed = useRef(false)
  const initial = useRef(null)
  const controller = useRef(null)
  const redirectTimer = useRef(null)

  const applySession = useCallback(session => {
    const view = { pending: 'entry', link_required: 'link', authenticated: 'confirm', code_issued: 'restart', consumed: 'consumed', revoked: 'restart' }[session.status]
    update({ session, view, message: session.error_code ? errorKey({ code: session.error_code }) : '' })
  }, [update])

  const recover = useCallback(async error => {
    if (!active.current || error.name === 'AbortError') return
    if (['AUTH_TRANSACTION_INVALID', 'AUTH_GRANT_INVALID', 'AUTH_BROWSER_MISMATCH'].includes(error.code)) {
      update({ view: 'restart', session: null, handoff: null, message: error.code === 'AUTH_BROWSER_MISMATCH' ? 'browser' : 'expired' })
    } else if (['AUTH_CSRF_INVALID', 'AUTH_TRANSACTION_STATE', 'AUTH_ACCOUNT_LINK_REQUIRED'].includes(error.code)) {
      try {
        const session = await api.session(transaction)
        if (!active.current) return
        applySession(session)
        if (error.code === 'AUTH_CSRF_INVALID') update({ message: 'csrf' })
      } catch (failure) {
        if (active.current) update({ view: 'restart', message: failure.code === 'AUTH_BROWSER_MISMATCH' ? 'browser' : 'expired', session: null })
      }
    } else {
      update({ message: errorKey(error) })
    }
  }, [api, transaction, update, applySession])

  useEffect(() => {
    active.current = true
    let alive = true
    if (enabled && transaction) {
      // Reuse the same first GET during StrictMode's effect replay: two parallel
      // initial binds could race before the HttpOnly cookie has arrived.
      initial.current ||= api.session(transaction)
      initial.current.then(session => { if (alive) applySession(session) }).catch(error => {
        if (!alive) return
        update({ view: 'load-error' })
        void recover(error)
      })
    }
    return () => {
      alive = false
      active.current = false
      controller.current?.abort()
      clearTimeout(redirectTimer.current)
    }
  }, [api, transaction, enabled, applySession, recover, update])

  useEffect(() => {
    const timer = setInterval(() => update({ now: Date.now() }), 1000)
    const offline = () => update({ message: 'network' })
    window.addEventListener('offline', offline)
    return () => { clearInterval(timer); window.removeEventListener('offline', offline) }
  }, [update])

  useEffect(() => {
    if (state.view !== 'handoff') return
    let cancelled = false
    let reading = false
    const timer = setInterval(async () => {
      if (document.visibilityState === 'hidden' || reading || Date.now() >= state.handoff.expires_at * 1000) return
      reading = true
      try {
        const session = await api.session(transaction)
        if (!cancelled && ['consumed', 'revoked'].includes(session.status)) {
          applySession(session)
          update({ handoff: null })
        }
      } catch (error) {
        if (!cancelled && error.code === 'AUTH_TRANSACTION_INVALID') update({ view: 'restart', handoff: null, message: 'expired' })
      } finally { reading = false }
    }, 2000)
    return () => { cancelled = true; clearInterval(timer) }
  }, [state.view, state.handoff, api, transaction, applySession, update])

  const run = async (scope, work) => {
    if (working.current || state.redirecting || state.cooldowns[scope] > Date.now()) return
    if (state.session && state.session.expires_at * 1000 <= Date.now()) {
      update({ view: 'restart', message: 'expired', handoff: null })
      return
    }
    working.current = true
    controller.current = new AbortController()
    update({ busy: scope, message: '' })
    try { await work(controller.current.signal); return { ok: true } }
    catch (error) {
      if (error.retryAfter && active.current) setState(previous => ({ ...previous, cooldowns: { ...previous.cooldowns, [scope]: Date.now() + error.retryAfter * 1000 } }))
      await recover(error)
      return { ok: false, code: error.code }
    } finally {
      working.current = false
      if (active.current) update({ busy: '' })
    }
  }

  const enter = email => run('enter', async signal => {
    const next = await api.enterEmail(email, signal)
    if (active.current) update({ view: next })
  })

  const email = (action, fields) => run('email', async signal => {
    let next
    try { next = await api.email(action, fields, state.session, signal) }
    catch (error) {
      if (error.code === 'AUTH_USER_NOT_ACTIVE' && action === 'login') {
        // Resending requires proof of the password, which stays in this call.
        update({ view: 'activate' })
        await api.email('resend-activation', fields, state.session, signal)
        if (active.current) update({ message: 'sent' })
        return
      }
      throw error
    }
    if (!active.current) return
    if (next === 'complete') {
      const session = await api.session(transaction, signal)
      if (active.current) applySession(session)
    } else {
      update({ view: next, message: action === 'activate' ? 'activated' : action === 'reset-password' ? 'updated' : action === 'resend-activation' ? 'sent' : '' })
    }
  })

  const provider = name => run(name, async signal => {
    const url = await api.provider(name, state.session, signal)
    if (!active.current) return
    update({ redirecting: name })
    redirectTimer.current = setTimeout(() => update({ redirecting: '', message: 'redirectFailed' }), 8000)
    navigate(url)
  })

  const complete = link => run('complete', async signal => {
    if (completed.current) return
    completed.current = true
    try {
      const handoff = await api.complete(state.session, link, signal)
      if (!active.current) return
      update({ view: 'handoff', handoff: { ...handoff, openedAt: Date.now() } })
      // Browser rejection is not an authentication failure; the manual button
      // retains the exact same URL in memory. Never repeat /complete.
      try { navigate(handoff.redirect_url) } catch { /* Manual retry remains. */ }
    } catch {
      if (active.current) update({ view: 'restart', handoff: null, message: 'uncertain' })
    }
  })

  const reload = () => run('session', async signal => {
    const session = await api.session(transaction, signal)
    if (active.current) applySession(session)
  })
  const restart = () => update({ view: 'restart', session: null, handoff: null, message: '' })
  const step = view => update({ view, message: '' })
  const remaining = state.handoff ? Math.max(0, Math.ceil(state.handoff.expires_at - state.now / 1000)) : 0
  const expired = state.session && state.session.expires_at * 1000 <= state.now && !['consumed', 'restart'].includes(state.view)
  const handoffExpired = state.view === 'handoff' && remaining === 0
  return { ...state, view: expired || handoffExpired ? 'restart' : state.view,
    message: expired || handoffExpired ? 'expired' : state.message, remaining,
    enter, email, provider, complete, reload, restart, step, update }
}
