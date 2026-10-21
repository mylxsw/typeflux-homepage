import ScaledDesktop from './ui/ScaledDesktop'
import { DocumentWindow } from './ui/Scenes'
import VoiceCapsule from './ui/Voice'
import styles from './Mockups.module.css'

// Dictating into Mail: the draft being written at the caret, the persona in
// use, and the bottom capsule the app shows while listening.
export function VoiceVisual({ copy, ui }) {
  const { demo } = copy
  return (
    <div className={styles.stack}>
      <div className={styles.screen} role="img" aria-label={`${demo.app} · ${demo.status} ${demo.draft}`}>
        <ScaledDesktop desktop={ui.desktop} app={demo.app} width={760} height={500} initialScale={0.74}>
          <div className={styles.scene}>
            <DocumentWindow title={demo.app} className={styles.mail}>
              <span className={styles.mailLines} aria-hidden="true"><span /><span /></span>
              <p className={styles.draft}>
                {demo.draft}
                <span className={styles.caret} aria-hidden="true" />
              </p>
              <span className={styles.persona}>{demo.persona}</span>
            </DocumentWindow>
            <span className={styles.capsule}><VoiceCapsule variant="bottom" voice={ui.voice} /></span>
          </div>
        </ScaledDesktop>
      </div>
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
