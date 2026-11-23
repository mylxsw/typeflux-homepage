import { useRef, useState } from 'react'
import Heading, { Reveal } from './Heading'
import Icon from './Icon'
import { ENTRANCES, LAUNCHER_CAPABILITIES, LAUNCHER_DEMOS, tabKeyIndex } from './homeModel'
import { useAutoCycle, usePrefersReducedMotion } from './homeHooks'
import { LauncherDemo } from './ui/Launcher'
import styles from './Showcase.module.css'

const launcherEntrance = ENTRANCES.find((entrance) => entrance.id === 'launcher')
const DEMO_INTERVAL = 5500

export default function LauncherShowcase({ copy, ui, lang }) {
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
                {copy.demos[id]}
              </button>
            ))}
          </div>
          <div id="launcher-demo" role="tabpanel" aria-labelledby={`launcher-tab-${active}`} data-demo={active}>
            <div key={active} className={styles.demoSwap}>
              <LauncherDemo id={active} ui={ui} placeholder={copy.placeholder} showLunar={lang.startsWith('zh')} />
            </div>
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
