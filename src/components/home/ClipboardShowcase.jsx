import FeatureSection from './FeatureSection'
import Icon from './Icon'
import { CLIPBOARD_CARDS } from './homeModel'
import styles from './Showcase.module.css'

// Default clipboard shortcut in the app (the clipboard shelf design).
const CLIPBOARD_KEYS = { keys: ['⇧', '⌘', 'V'] }

export default function ClipboardShowcase({ copy }) {
  return (
    <FeatureSection id="clipboard" entrance={CLIPBOARD_KEYS} copy={copy} accent="launcher" tinted>
      <div className={styles.clipboardVisual}>
        <div className={styles.shelf}>
          <div className={styles.shelfBar}>
            <span className={styles.shelfSearch}><Icon name="search" size={13} />{copy.search}</span>
          </div>
          <ul className={styles.shelfCards}>
            {CLIPBOARD_CARDS.map(({ id, tone }, i) => (
              <li key={id} className={styles.clipCard} data-tone={tone}>
                <span className={styles.clipHead}>
                  <strong>{copy.cards[id].kind}</strong>
                  <span>{copy.cards[id].time}</span>
                </span>
                <span className={`${styles.clipBody} ${id === 'code' ? styles.clipCode : ''}`}>
                  {id === 'image' ? <span className={styles.clipImage} /> : null}
                  {copy.cards[id].body}
                </span>
                <span className={styles.clipIndex}>⌘{i + 1}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.retention}>
          <span className={styles.retentionTitle}>{copy.retentionTitle}</span>
          <ul className={styles.retentionOptions}>
            {copy.retention.map((option, i) => (
              <li key={option} className={i === copy.retention.length - 1 ? styles.retentionActive : ''}>{option}</li>
            ))}
          </ul>
        </div>
      </div>
    </FeatureSection>
  )
}
