import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { useAccountSession } from '../../contexts/AccountSessionContext.jsx'
import { exchangeHandoff } from '../../lib/accountApi'
import { captureHandoff, handoffDestination, loginURL } from '../../lib/accountNavigation'
import { accountCopy } from './accountCopy'
import AccountChoice from './AccountChoice'
import styles from './Account.module.css'

// Replace, not push: Back must not return to a spent one-time link.
const replaceLocation = (url) => window.location.replace(url)

export default function HandoffPage({ exchange = exchangeHandoff, navigate = replaceLocation, capture = captureHandoff }) {
  const { lang } = useI18n()
  const { refresh } = useAccountSession()
  const c = accountCopy(lang)
  const [grant] = useState(() => capture())
  const [state, setState] = useState({ view: grant.code ? 'opening' : 'expired', result: null, busy: false, failed: false })
  const started = useRef(null)
  // The exchange runs once per code; later renders must not restart it, even if
  // a caller passes new function identities.
  const latest = useRef({ exchange, navigate, lang })
  useEffect(() => { latest.current = { exchange, navigate, lang } })

  useEffect(() => {
    if (!grant.code) return undefined
    let alive = true
    // StrictMode replays effects; reuse the single exchange instead of racing a second one.
    started.current ||= latest.current.exchange(grant.code)
    started.current.then((result) => {
      if (!alive) return
      if (result.status === 'mismatch') setState({ view: 'mismatch', result, busy: false, failed: false })
      else latest.current.navigate(handoffDestination(latest.current.lang, result.target))
    }).catch((error) => {
      if (!alive) return
      setState({ view: error?.code === 'AUTH_HANDOFF_INVALID' ? 'expired' : 'failed', result: null, busy: false, failed: false })
    })
    return () => { alive = false }
  }, [grant.code])

  const choose = async (replace) => {
    const target = state.result.target
    if (!replace) {
      navigate(handoffDestination(lang, target))
      return
    }
    setState((s) => ({ ...s, busy: true, failed: false }))
    try {
      const result = await exchange(grant.code, { replace: true })
      await refresh()
      navigate(handoffDestination(lang, result.target))
    } catch (error) {
      setState((s) => ({ ...s, busy: false, failed: true, view: error?.code === 'AUTH_HANDOFF_INVALID' ? 'expired' : s.view }))
    }
  }

  const signIn = loginURL(lang, handoffDestination(lang, grant.target).split('?')[0])

  return <main className={styles.page}>
    <div className="container"><div className={styles.state}>
      {state.view === 'opening' && <div role="status"><div className={styles.spinner} /><h1>{c.handoff.opening}</h1></div>}
      {state.view === 'expired' && <>
        <h1>{c.handoff.expiredTitle}</h1>
        <p>{c.handoff.expiredSub}</p>
        <a className={styles.button} href={signIn}>{c.handoff.signIn}</a>
      </>}
      {state.view === 'failed' && <>
        <h1>{c.handoff.failed}</h1>
        <p />
        <a className={styles.button} href={signIn}>{c.handoff.signIn}</a>
      </>}
      {state.view === 'mismatch' && <AccountChoice lang={lang} c={c} result={state.result} busy={state.busy} failed={state.failed} onChoose={choose} />}
    </div></div>
  </main>
}
