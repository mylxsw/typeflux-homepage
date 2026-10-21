import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { Keys } from './Icon'
import styles from './FeatureSection.module.css'

// Splits a title on "\n" into lines without injecting markup.
export function MultilineTitle({ text }) {
  const lines = text.split('\n')
  return lines.map((line, i) => (
    <span key={line} className={styles.titleLine}>
      {line}
      {i < lines.length - 1 ? <br /> : null}
    </span>
  ))
}

// One entry-point section: badge with its shortcut, title, points and a
// visual. `reverse` puts the visual on the left on wide screens; `tinted`
// gives the section the surface background.
export default function FeatureSection({ id, entrance, copy, reverse = false, tinted = false, children }) {
  const [contentRef, contentVisible] = useScrollAnimation()
  const [visualRef, visualVisible] = useScrollAnimation()

  return (
    <section className={`${styles.section} ${tinted ? styles.tinted : ''}`} id={id} data-accent={id}>
      <div className="container">
        <div className={`${styles.layout} ${reverse ? styles.reverse : ''}`}>
          <div
            ref={contentRef}
            className={`${styles.content} animate-hidden ${contentVisible ? 'animate-visible' : ''}`}
          >
            <div className={styles.badgeRow}>
              <span className={styles.badge}>{copy.badge}</span>
              <Keys keys={entrance.keys} then={entrance.then} className={styles.keys} />
            </div>
            <h2 className="section-title">{copy.title}</h2>
            <p className="section-subtitle">{copy.subtitle}</p>
            {copy.points?.length ? (
              <ul className={styles.points}>
                {copy.points.map((point) => (
                  <li key={point.title}>
                    <strong>{point.title}</strong>
                    <p>{point.desc}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div
            ref={visualRef}
            className={`${styles.visual} animate-hidden ${visualVisible ? 'animate-visible' : ''}`}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}
