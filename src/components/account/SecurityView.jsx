import { useCallback, useEffect, useRef, useState } from 'react'
import { localizedPath } from '../../lib/localePath'
import { confirmWithPassword, deleteAccount, parseSecurityReturn, startProviderFlow, unlinkProvider } from '../../lib/accountApi'
import { accountText } from './accountCopy'
import { needsConfirmation, signInState } from './accountModel'
import { isSessionExpired } from './useAccountData'
import styles from './Account.module.css'

const NAMES = { google: 'Google', github: 'GitHub', apple: 'Apple' }
const ICONS = { google: '/auth/google.png', github: '/auth/github.svg', apple: '/auth/apple.svg' }

export default function SecurityView({ c, lang, session, navigate, onDeleted, location = window.location, history = window.history }) {
  const t = (key, values) => accountText(lang, `security.${key}`, values)
  const errorText = (code) => c.security.errors[code] || c.security.errors.generic
  const here = localizedPath(lang, '/account/security')
  const [notice, setNotice] = useState(() => {
    const result = parseSecurityReturn(location.search)
    if (!result) return null
    if (result.type === 'linked') return { tone: 'good', text: t('linkedOk', { provider: NAMES[result.provider] }) }
    if (result.type === 'reauth') return { tone: 'good', text: t('reauthOk') }
    return { tone: 'error', text: errorText(result.code) }
  })
  const [dialog, setDialog] = useState(null)
  const [pending, setPending] = useState(null)
  const [busy, setBusy] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const state = signInState(session)
  const { refresh, expire } = session

  useEffect(() => {
    // The provider outcome is shown once; reloads must not repeat it.
    if (location.search) history.replaceState(history.state, '', location.pathname)
  }, [history, location])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const fail = useCallback((error) => {
    if (isSessionExpired(error) && error?.code !== 'AUTH_INVALID_CREDENTIALS') {
      expire()
      return
    }
    setNotice({ tone: 'error', text: c.security.errors[error?.code] || c.security.errors.generic })
  }, [c, expire])

  const perform = useCallback(async (action) => {
    if (action.type === 'delete') {
      setDialog('delete')
      return
    }
    setBusy(action.type + action.provider)
    try {
      if (action.type === 'link') {
        navigate(await startProviderFlow(session.csrf, 'link', action.provider, here))
        return
      }
      await unlinkProvider(session.csrf, action.provider)
      await refresh()
      setNotice({ tone: 'good', text: accountText(lang, 'security.unlinkedOk', { provider: NAMES[action.provider] }) })
    } catch (error) {
      if (error?.code === 'AUTH_REAUTH_REQUIRED') {
        setPending(action)
        setDialog('confirm')
      } else {
        fail(error)
      }
    } finally {
      setBusy('')
    }
  }, [fail, here, lang, navigate, refresh, session.csrf])

  const request = (action) => {
    setNotice(null)
    if (needsConfirmation(action, session, now)) {
      setPending(action)
      setDialog('confirm')
    } else {
      void perform(action)
    }
  }

  const confirmed = session.reauthUntil * 1000 > now
  const time = confirmed ? new Intl.DateTimeFormat(lang, { hour: '2-digit', minute: '2-digit' }).format(session.reauthUntil * 1000) : ''

  return <>
    <header className={styles.head}><div><h1>{c.security.title}</h1><p>{c.security.subtitle}</p></div></header>
    {notice && <div className={`${styles.banner} ${notice.tone === 'good' ? styles.good : styles.crit}`} role={notice.tone === 'good' ? 'status' : 'alert'}>{notice.text}</div>}
    {confirmed && <p className={styles.note} role="status">{t('confirmedUntil', { time })}</p>}

    <div className={styles.card}>
      <div className={styles.cardHead}><div><h2>{c.security.methodsTitle}</h2><p>{c.security.methodsSub}</p></div></div>
      <div className={styles.method}>
        <span className={styles.methodIcon} aria-hidden="true">@</span>
        <div className={styles.methodText}><strong>{c.security.password}</strong><span>{state.hasPassword ? c.security.passwordOn : c.security.passwordOff}</span></div>
      </div>
      {state.providers.map((p) => {
        const isLinked = state.linked.includes(p)
        const last = isLinked && state.methods <= 1
        return <div key={p} className={styles.method}>
          <span className={styles.methodIcon} aria-hidden="true"><img src={ICONS[p]} alt="" /></span>
          <div className={styles.methodText}><strong>{NAMES[p]}</strong><span>{last ? c.security.lastMethod : isLinked ? c.security.linked : c.security.notLinked}</span></div>
          <div className={styles.cardHeadEnd}>
            {isLinked
              ? <button type="button" className={styles.buttonGhost} disabled={last || Boolean(busy)} aria-busy={busy === 'unlink' + p}
                onClick={() => request({ type: 'unlink', provider: p })}>{c.security.unlink}</button>
              : state.linkable.includes(p) && <button type="button" className={styles.button} disabled={Boolean(busy)} aria-busy={busy === 'link' + p}
                onClick={() => request({ type: 'link', provider: p })}>{c.security.link}</button>}
          </div>
        </div>
      })}
    </div>

    <div className={`${styles.card} ${styles.danger}`}>
      <div className={styles.cardHead}><div><h2>{c.security.deleteTitle}</h2><p>{c.security.deleteSub}</p></div></div>
      <button type="button" className={styles.buttonDanger} onClick={() => request({ type: 'delete' })}>{c.security.deleteAction}</button>
    </div>

    {dialog === 'confirm' && <ConfirmDialog c={c} lang={lang} session={session} state={state} here={here} action={pending}
      onClose={() => setDialog(null)} navigate={navigate} onError={fail}
      onConfirmed={async () => {
        await refresh()
        setDialog(null)
        if (pending) await perform(pending)
      }} />}
    {dialog === 'delete' && <DeleteDialog c={c} lang={lang} session={session} onClose={() => setDialog(null)} onError={(error) => {
      if (['AUTH_REAUTH_REQUIRED', 'APPLE_REAUTH_REQUIRED', 'APPLE_REVOKE_FAILED'].includes(error?.code)) {
        // The confirmation was used up or is no longer enough; ask again.
        setNotice({ tone: 'error', text: c.security.errors[error.code] })
        setPending({ type: 'delete' })
        setDialog('confirm')
        void refresh()
        return
      }
      setDialog(null)
      fail(error)
    }} onDeleted={onDeleted} />}
  </>
}

function Dialog({ title, children, onClose }) {
  const box = useRef(null)
  useEffect(() => {
    box.current?.querySelector('input, button')?.focus()
    const escape = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])
  return <div className={styles.scrim} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="account-dialog-title" ref={box}>
      <h2 id="account-dialog-title">{title}</h2>
      {children}
    </div>
  </div>
}

function ConfirmDialog({ c, lang, session, state, here, action, onClose, onConfirmed, navigate, onError }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const appleOnly = action?.type === 'delete' && state.linked.includes('apple')
  const providers = state.linked.filter((p) => state.linkable.includes(p) && (!appleOnly || p === 'apple'))

  const withPassword = async (event) => {
    event.preventDefault()
    if (!password || busy) return
    setBusy('password')
    setError('')
    try {
      await confirmWithPassword(session.csrf, password)
      await onConfirmed()
    } catch (failure) {
      if (failure?.code === 'AUTH_INVALID_CREDENTIALS' || failure?.code === 'RATE_LIMITED') setError(c.security.errors[failure.code])
      else onError(failure)
    } finally {
      setBusy('')
      setPassword('')
    }
  }
  const withProvider = async (provider) => {
    setBusy(provider)
    try {
      navigate(await startProviderFlow(session.csrf, 'reauth', provider, here))
    } catch (failure) {
      setBusy('')
      onError(failure)
    }
  }

  return <Dialog title={c.security.confirmTitle} onClose={onClose}>
    <p>{appleOnly ? c.security.confirmApple : c.security.confirmSub}</p>
    {state.hasPassword && !appleOnly && <form onSubmit={withPassword} className={styles.dialogForm}>
      <label>{c.security.passwordLabel}
        <input type="password" autoComplete="current-password" value={password} maxLength={128} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} />
      </label>
      {error && <p className={styles.alert} role="alert">{error}</p>}
      <button type="submit" className={styles.button} disabled={!password || Boolean(busy)} aria-busy={busy === 'password'}>{c.security.confirm}</button>
    </form>}
    {state.hasPassword && !appleOnly && providers.length > 0 && <p className={styles.separator}>{c.security.separator}</p>}
    {providers.map((p) => <button key={p} type="button" className={styles.pick} disabled={Boolean(busy)} aria-busy={busy === p} onClick={() => withProvider(p)}>
      <img src={ICONS[p]} alt="" width="20" height="20" />
      <span className={styles.pickText}>{accountText(lang, 'security.withProvider', { provider: NAMES[p] })}</span>
    </button>)}
    {appleOnly && providers.length === 0 && <p className={styles.alert} role="alert">{c.security.errors.APPLE_REAUTH_REQUIRED}</p>}
    <div className={styles.dialogActions}><button type="button" className={styles.buttonGhost} onClick={onClose}>{c.security.cancel}</button></div>
  </Dialog>
}

function DeleteDialog({ c, lang, session, onClose, onError, onDeleted }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const target = session.user.email
  const matches = email.trim().toLowerCase() === target.toLowerCase()
  const submit = async (event) => {
    event.preventDefault()
    if (!matches || busy) return
    setBusy(true)
    try {
      await deleteAccount(session.csrf, email.trim())
      onDeleted()
    } catch (failure) {
      setBusy(false)
      onError(failure)
    }
  }
  return <Dialog title={c.security.deleteDialogTitle} onClose={busy ? () => {} : onClose}>
    <p>{c.security.deleteSub}</p>
    <form onSubmit={submit} className={styles.dialogForm}>
      <label>{accountText(lang, 'security.deleteDialogSub', { email: target })}
        <input type="email" autoComplete="off" value={email} placeholder={target} onChange={(event) => setEmail(event.target.value)} disabled={busy} />
      </label>
      <div className={styles.dialogActions}>
        <button type="button" className={styles.buttonGhost} onClick={onClose} disabled={busy}>{c.security.cancel}</button>
        <button type="submit" className={styles.buttonDanger} disabled={!matches || busy} aria-busy={busy}>{busy ? c.security.deleting : c.security.deleteConfirm}</button>
      </div>
    </form>
  </Dialog>
}
