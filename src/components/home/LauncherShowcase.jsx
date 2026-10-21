import { useRef, useState } from 'react'
import Heading, { Reveal } from './Heading'
import Icon from './Icon'
import { ENTRANCES, LAUNCHER_CAPABILITIES, LAUNCHER_DEMOS, tabKeyIndex } from './homeModel'
import { useAutoCycle, usePrefersReducedMotion, useTypewriter } from './homeHooks'
import styles from './Showcase.module.css'

const launcherEntrance = ENTRANCES.find((entrance) => entrance.id === 'launcher')
const DEMO_INTERVAL = 4500

function LauncherWindow({ demo, placeholder, animate }) {
  const { shown } = useTypewriter(demo.query, animate, { msPerChar: 55 })
  return (
    <div className={styles.launcher}>
      <div className={styles.launcherInput}>
        <Icon name="search" size={18} />
        <span className={styles.launcherQuery}>{shown || <span className={styles.placeholder}>{placeholder}</span>}</span>
        <span className={styles.launcherMic} aria-hidden="true"><Icon name="mic" size={16} /></span>
      </div>
      <ul className={styles.launcherResults} aria-live="polite">
        {demo.results.map((result, i) => (
          <li key={result.title} className={i === 0 ? styles.launcherResultActive : ''}>
            <span className={styles.launcherResultTitle}>{result.title}</span>
            <span className={styles.launcherResultMeta}>{result.meta}</span>
          </li>
        ))}
      </ul>
      <div className={styles.launcherFooter} aria-hidden="true">
        <span>↩</span><span>⌘↩</span><span>esc</span>
      </div>
    </div>
  )
}

export default function LauncherShowcase({ copy }) {
  const reduced = usePrefersReducedMotion()
  const [held, setHeld] = useState(false)
  const [index, select] = useAutoCycle(LAUNCHER_DEMOS.length, { interval: DEMO_INTERVAL, paused: reduced || held })
  const tabRefs = useRef([])
  const active = LAUNCHER_DEMOS[index]

  const handleKeyDown = (event) => {
    const next = tabKeyIndex(event.key, index, LAUNCHER_DEMOS.length)
    if (next === null) return
    event.preventDefault()
    select(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={`${styles.section} ${styles.tinted}`} id="launcher" data-accent="launcher">
      <div className="container">
        <Heading badge={copy.badge} keys={launcherEntrance} title={copy.title} subtitle={copy.subtitle} />
        <Reveal
          className={styles.launcherStage}
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={() => setHeld(false)}
        >
          <div className={styles.demoTabs} role="tablist" aria-label={copy.demosTitle}>
            {LAUNCHER_DEMOS.map((id, i) => (
              <button
                key={id}
                ref={(node) => { tabRefs.current[i] = node }}
                type="button"
                role="tab"
                id={`launcher-tab-${id}`}
                aria-selected={i === index}
                aria-controls="launcher-demo"
                tabIndex={i === index ? 0 : -1}
                className={`${styles.demoTab} ${i === index ? styles.demoTabActive : ''}`}
                onClick={() => select(i)}
                onKeyDown={handleKeyDown}
              >
                {copy.demos[id].label}
              </button>
            ))}
          </div>
          <div id="launcher-demo" role="tabpanel" aria-labelledby={`launcher-tab-${active}`} data-demo={active}>
            <LauncherWindow key={active} demo={copy.demos[active]} placeholder={copy.placeholder} animate={!reduced} />
          </div>
        </Reveal>
        <ul className={styles.featureGrid}>
          {LAUNCHER_CAPABILITIES.map(({ id, icon }) => (
            <li key={id} className={styles.capability}>
              <span className={styles.capabilityIcon}><Icon name={icon} size={20} /></span>
              <strong>{copy.capabilities[id].title}</strong>
              <p>{copy.capabilities[id].desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
