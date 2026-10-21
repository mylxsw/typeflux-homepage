import { useRef, useState } from 'react'
import Heading, { Reveal } from './Heading'
import { CaptureScene } from './ui/Surfaces'
import { CAPTURE_MODES, tabKeyIndex } from './homeModel'
import styles from './Showcase.module.css'

// Default screenshot shortcut in the app (HotkeyBinding.defaultScreenshot).
const CAPTURE_KEYS = { keys: ['⌥', '⌘', 'A'] }

export default function CaptureShowcase({ copy, ui }) {
  const [index, setIndex] = useState(0)
  const tabRefs = useRef([])
  const mode = CAPTURE_MODES[index]

  const handleKeyDown = (event) => {
    const next = tabKeyIndex(event.key, index, CAPTURE_MODES.length)
    if (next === null) return
    event.preventDefault()
    setIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={styles.section} id="capture" data-accent="voice">
      <div className="container">
        <Heading badge={copy.badge} keys={CAPTURE_KEYS} title={copy.title} subtitle={copy.subtitle} />
        <Reveal className={styles.captureLayout}>
          <div className={styles.modeList} role="tablist" aria-orientation="vertical" aria-label={copy.badge}>
            {CAPTURE_MODES.map((id, i) => (
              <button
                key={id}
                ref={(node) => { tabRefs.current[i] = node }}
                type="button"
                role="tab"
                id={`capture-tab-${id}`}
                aria-selected={i === index}
                aria-controls="capture-panel"
                tabIndex={i === index ? 0 : -1}
                className={`${styles.modeItem} ${i === index ? styles.modeItemActive : ''}`}
                onClick={() => setIndex(i)}
                onKeyDown={handleKeyDown}
              >
                <strong>{copy.modes[id].name}</strong>
                <span>{copy.modes[id].desc}</span>
              </button>
            ))}
          </div>
          <div className={styles.captureStage} id="capture-panel" role="tabpanel" aria-labelledby={`capture-tab-${mode}`} data-mode={mode}>
            <div key={mode} className={styles.demoSwap} role="img" aria-label={copy.modes[mode].name}>
              <CaptureScene mode={mode} ui={ui} />
            </div>
          </div>
        </Reveal>
        <Reveal className={styles.toolsRow}>
          <span className={styles.toolsTitle}>{copy.toolsTitle}</span>
          <ul className={styles.chips}>
            {copy.tools.map((tool) => <li key={tool}>{tool}</li>)}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
