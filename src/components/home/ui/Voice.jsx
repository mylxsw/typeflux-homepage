// The four voice capsule styles, drawn in em units so they scale from the
// full-size hero down to the small desktop illustrations.
import styles from './Voice.module.css'

function Orb({ small = false }) {
  return <span className={`${styles.orb} ${small ? styles.orbSmall : ''}`} aria-hidden="true" />
}

function Dots({ count = 9 }) {
  return <span className={styles.dots} aria-hidden="true">{Array.from({ length: count }, (_, i) => <i key={i} />)}</span>
}

export default function VoiceCapsule({ variant, voice, time = '0:04' }) {
  switch (variant) {
    case 'notch':
      // Grows out of the camera notch: the top row sits on either side of it.
      return (
        <div className={`${styles.capsule} ${styles.notch}`}>
          <div className={styles.notchRow}>
            <span className={styles.notchLeft}><Orb small /><span>{time}</span></span>
            <Dots />
          </div>
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
        <div className={`${styles.capsule} ${styles.pill}`}>
          <Orb />
          <span className={`${styles.timer} ${styles.timerLarge}`}>{time}</span>
        </div>
      )
    default:
      return (
        <div className={`${styles.capsule} ${styles.pill} ${styles.confirm}`}>
          <span className={styles.round} aria-hidden="true">
            <svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </span>
          <Dots />
          <span className={`${styles.round} ${styles.roundOk}`} aria-hidden="true">
            <svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg>
          </span>
        </div>
      )
  }
}
