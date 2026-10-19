import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { useAccountSession } from '../../contexts/AccountSessionContext.jsx'
import { localizedPath } from '../../lib/localePath'
import { loginURL } from '../../lib/accountNavigation'
import { accountCopy } from './accountCopy'
import styles from './AccountMenu.module.css'

const LINKS = [['dashboard', '/account'], ['usage', '/account/usage'], ['billing', '/account/billing']]

// AccountMenu is the header's sign-in link or signed-in avatar menu. While the
// session is loading (and during prerendering) it renders nothing, so the
// static markup and the first client render always match.
export default function AccountMenu({ variant = 'header', onNavigate }) {
  const { lang } = useI18n()
  const session = useAccountSession()
  const c = accountCopy(lang)
  const [open, setOpen] = useState(false)
  const root = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const close = (event) => { if (!root.current?.contains(event.target)) setOpen(false) }
    const escape = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  if (!['signedIn', 'signedOut', 'error'].includes(session.status)) return null
  const label = (key) => (key === 'dashboard' ? c.menu.dashboard : c.nav[key])
  const signOut = async () => {
    setOpen(false)
    onNavigate?.()
    await session.signOut()
  }

  if (session.status !== 'signedIn') {
    return <a className={variant === 'mobile' ? styles.mobileLink : styles.signIn} href={loginURL(lang, localizedPath(lang, '/account'))} onClick={onNavigate}>{c.menu.signIn}</a>
  }

  const { email } = session.user
  if (variant === 'mobile') {
    return <div className={styles.mobile}>
      <div className={styles.mobileWho}>{c.menu.signedInAs} <b>{email}</b></div>
      {LINKS.map(([key, path]) => <a key={key} className={styles.mobileLink} href={localizedPath(lang, path)} onClick={onNavigate}>{label(key)}</a>)}
      <button type="button" className={styles.mobileLink} onClick={signOut}>{c.menu.signOut}</button>
    </div>
  }

  return <div className={styles.root} ref={root}>
    <button type="button" className={styles.trigger} aria-haspopup="menu" aria-expanded={open} aria-label={`${c.menu.label}: ${email}`} onClick={() => setOpen(!open)}>
      <span className={styles.avatar} aria-hidden="true">{email.slice(0, 1)}</span>
    </button>
    {open && <div className={styles.menu} role="menu">
      <div className={styles.who}><span>{c.menu.signedInAs}</span><b>{email}</b></div>
      {LINKS.map(([key, path]) => <a key={key} role="menuitem" href={localizedPath(lang, path)} onClick={() => setOpen(false)}>{label(key)}</a>)}
      <hr />
      <button type="button" role="menuitem" onClick={signOut}>{c.menu.signOut}</button>
    </div>}
  </div>
}
