import { useRef, useState } from 'react'
import Heading, { Reveal } from './Heading'
import MiniScreen from './MiniScreen'
import { FORMS, tabKeyIndex } from './homeModel'
import styles from './Showcase.module.css'

const GROUPS = Object.keys(FORMS)

// Illustrates where the voice capsule appears and the shapes the chat takes.
export default function FormsGallery({ copy }) {
  const [index, setIndex] = useState(0)
  const tabRefs = useRef([])
  const group = GROUPS[index]

  const handleKeyDown = (event) => {
    const next = tabKeyIndex(event.key, index, GROUPS.length)
    if (next === null) return
    event.preventDefault()
    setIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={styles.section} id="forms">
      <div className="container">
        <Heading badge={copy.badge} title={copy.title} subtitle={copy.subtitle} />
        <div className={styles.segmented} role="tablist" aria-label={copy.title}>
          {GROUPS.map((id, i) => (
            <button
              key={id}
              ref={(node) => { tabRefs.current[i] = node }}
              type="button"
              role="tab"
              id={`forms-tab-${id}`}
              aria-selected={i === index}
              aria-controls="forms-panel"
              tabIndex={i === index ? 0 : -1}
              className={`${styles.segment} ${i === index ? styles.segmentActive : ''}`}
              onClick={() => setIndex(i)}
              onKeyDown={handleKeyDown}
            >
              {copy.tabs[id]}
            </button>
          ))}
        </div>
        <Reveal>
          <ul className={styles.formsGrid} id="forms-panel" role="tabpanel" aria-labelledby={`forms-tab-${group}`} data-group={group}>
            {FORMS[group].map((variant) => {
              const item = copy[group][variant]
              return (
                <li key={variant} className={styles.formCard}>
                  <MiniScreen variant={variant} sample={copy.sample} label={item.name} />
                  <strong>{item.name}</strong>
                  <p>{item.desc}</p>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
