// The four voice capsule styles, drawn in em units so they scale from the
// full-size hero down to the small desktop illustrations.
import styles from './Voice.module.css'

function Orb() {
  return <span className={styles.orb} aria-hidden="true" />
}

function Dots() {
  return <span className={styles.dots} aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</span>
}

export default function VoiceCapsule({ variant, voice, time = '0:04' }) {
  switch (variant) {
    case 'notch':
      return (
        <div className={`${styles.capsule} ${styles.notch}`}>
          <p className={styles.notchTop}><Orb /><span>{time}</span><Dots /></p>
          <p className={styles.notchText}>{voice.transcript}</p>
          <p className={styles.notchActions}><span>{voice.cancel}</span><span className={styles.primary}>{voice.done}</span></p>
        </div>
      )
    case 'corner':
      return (
        <div className={`${styles.capsule} ${styles.corner}`}>
          <Orb />
          <span className={styles.cornerText}><strong>Typeflux</strong><span>{voice.listening} · {voice.app}</span></span>
          <span className={styles.timer}>{time}</span>
        </div>
      )
    case 'orb':
      return (
        <div className={`${styles.capsule} ${styles.orbPill}`}>
          <Orb />
          <span className={styles.timer}>{time}</span>
        </div>
      )
    default:
      return (
        <div className={`${styles.capsule} ${styles.bottom}`}>
          <span className={styles.round} aria-hidden="true">✕</span>
          <Dots />
          <span className={`${styles.round} ${styles.roundOk}`} aria-hidden="true">✓</span>
        </div>
      )
  }
}
