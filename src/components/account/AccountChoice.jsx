import { accountText } from './accountCopy'
import styles from './Account.module.css'

// AccountChoice asks which account to use when the App's account differs from
// the one already signed in to this browser. Nothing changes until a choice.
export default function AccountChoice({ lang, c, result, busy, failed, onChoose }) {
  return <>
    <h1>{c.handoff.mismatchTitle}</h1>
    <p>{c.handoff.mismatchSub}</p>
    <button type="button" className={styles.pick} disabled={busy} aria-busy={busy} onClick={() => onChoose(true)}>
      <span className={styles.avatar} aria-hidden="true">{result.email.slice(0, 1)}</span>
      <span className={styles.pickText}><strong>{result.email}</strong><span className={styles.sub}>{c.handoff.appAccount}</span></span>
      <span className={styles.chip}>{c.handoff.recommended}</span>
    </button>
    <button type="button" className={styles.pick} disabled={busy} onClick={() => onChoose(false)}>
      <span className={styles.avatar} aria-hidden="true" style={{ background: 'var(--color-text-tertiary)' }}>{result.currentEmail.slice(0, 1)}</span>
      <span className={styles.pickText}><strong>{result.currentEmail}</strong><span className={styles.sub}>{c.handoff.browserAccount}</span></span>
    </button>
    <p className={styles.note}>{accountText(lang, 'handoff.switchNote', { email: result.currentEmail })}</p>
    {failed && <p className={styles.alert} role="alert">{c.handoff.failed}</p>}
  </>
}
