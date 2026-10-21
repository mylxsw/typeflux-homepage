import Icon from './Icon'
import styles from './Mockups.module.css'

function Window({ title, children, className = '' }) {
  return (
    <div className={`${styles.window} ${className}`}>
      <div className={styles.titlebar} aria-hidden="true">
        <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
        {title ? <span className={styles.windowTitle}>{title}</span> : null}
      </div>
      <div className={styles.windowBody}>{children}</div>
    </div>
  )
}

export function VoiceVisual({ copy }) {
  return (
    <div className={styles.stack}>
      <Window title={copy.demo.app}>
        <div className={styles.mailLines} aria-hidden="true"><span /><span /></div>
        <p className={styles.draft}>{copy.demo.draft}</p>
        <div className={styles.voiceBar}>
          <span className={styles.voicePill}>
            <Icon name="mic" size={16} />
            {copy.demo.status}
          </span>
          <span className={styles.personaChip}>{copy.demo.persona}</span>
        </div>
      </Window>
      <dl className={styles.stats}>
        {copy.stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
