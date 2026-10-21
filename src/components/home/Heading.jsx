import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { Keys } from './Icon'
import styles from './Showcase.module.css'

// Fades its children in when they scroll into view.
export function Reveal({ className = '', children, ...rest }) {
  const [ref, visible] = useScrollAnimation()
  return (
    <div ref={ref} className={`${className} animate-hidden ${visible ? 'animate-visible' : ''}`} {...rest}>
      {children}
    </div>
  )
}

// Centered section heading: optional badge and shortcut, title, subtitle.
export default function Heading({ badge, keys, title, subtitle }) {
  return (
    <Reveal className={styles.heading}>
      {badge ? (
        <div className={styles.badgeRow}>
          <span className={styles.badge}>{badge}</span>
          {keys ? <Keys keys={keys.keys} then={keys.then} className={styles.keys} /> : null}
        </div>
      ) : null}
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className={`section-subtitle ${styles.subtitle}`}>{subtitle}</p> : null}
    </Reveal>
  )
}
