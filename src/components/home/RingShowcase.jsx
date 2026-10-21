import Heading, { Reveal } from './Heading'
import RingStage from './RingStage'
import { ENTRANCES } from './homeModel'
import styles from './Showcase.module.css'

// No space before CJK text or punctuation (Chinese and Japanese run on).
const joiner = (rest) => (/^[\u2E80-\uFFFF(（]/.test(rest) ? '' : ' ')

const ringEntrance = ENTRANCES.find((entrance) => entrance.id === 'ring')

export default function RingShowcase({ copy, ui }) {
  return (
    <section className={styles.section} id="ring" data-accent="ring">
      <div className="container">
        <Heading badge={copy.badge} keys={ringEntrance} title={copy.title} subtitle={copy.subtitle} />
        <Reveal className={styles.ringStage}>
          <p className={styles.ringTry}>{copy.tryTitle}</p>
          <RingStage copy={copy} ui={ui} />
        </Reveal>
        <ol className={styles.gestures}>
          {copy.steps.map(([verb, rest], i) => (
            <li key={verb}>
              <span className={styles.gestureNo}>{i + 1}</span>
              <p><strong>{verb}</strong>{joiner(rest)}{rest}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
