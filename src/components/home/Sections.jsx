import { useRef, useState } from 'react'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { trackedRedirect } from '../../lib/analytics'
import { apiURL } from '../../lib/api'
import { localizedPath } from '../../lib/localePath'
import Icon, { Keys } from './Icon'
import { ENTRANCES, PRIVACY_ICONS, SCENARIO_TABS, TOOLBOX, tabKeyIndex } from './homeModel'
import styles from './Sections.module.css'

function Reveal({ className = '', children, ...rest }) {
  const [ref, visible] = useScrollAnimation()
  return (
    <div ref={ref} className={`${className} animate-hidden ${visible ? 'animate-visible' : ''}`} {...rest}>
      {children}
    </div>
  )
}

function SectionHeading({ title, subtitle }) {
  return (
    <Reveal className={styles.heading}>
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
    </Reveal>
  )
}

export function Entrances({ copy }) {
  return (
    <section className={styles.section} id="features">
      <div className="container">
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />
        <div className={styles.entranceGrid}>
          {ENTRANCES.map((entrance) => {
            const item = copy.items[entrance.id]
            return (
              <a key={entrance.id} href={`#${entrance.id}`} className={styles.entranceCard} data-accent={entrance.id}>
                <span className={styles.entranceIcon}><Icon name={entrance.icon} size={22} /></span>
                <span className={styles.entranceName}>{item.name}</span>
                <span className={styles.entranceAction}>{item.action}</span>
                <Keys keys={entrance.keys} then={entrance.then} className={styles.entranceKeys} />
                <span className={styles.entranceDesc}>{item.desc}</span>
                <span className={styles.entranceMore}>
                  {copy.more}
                  <Icon name="arrowRight" size={16} />
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function Toolbox({ copy }) {
  return (
    <section className={styles.section} id="toolbox">
      <div className="container">
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />
        <ul className={styles.toolGrid}>
          {TOOLBOX.map((tool) => (
            <li key={tool.id} className={styles.toolCard}>
              <span className={styles.toolIcon}><Icon name={tool.icon} size={22} /></span>
              <h3>{copy.items[tool.id].name}</h3>
              <p>{copy.items[tool.id].desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Scenarios({ copy }) {
  const [index, setIndex] = useState(0)
  const tabRefs = useRef([])
  const active = SCENARIO_TABS[index]

  const handleKeyDown = (event) => {
    const next = tabKeyIndex(event.key, index, SCENARIO_TABS.length)
    if (next === null) return
    event.preventDefault()
    setIndex(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={`${styles.section} ${styles.tinted}`} id="scenarios">
      <div className="container">
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />
        <Reveal className={styles.scenarios}>
          <div className={styles.scenarioTabs} role="tablist" aria-label={copy.title}>
            {SCENARIO_TABS.map((tab, i) => (
              <button
                key={tab}
                ref={(node) => { tabRefs.current[i] = node }}
                type="button"
                role="tab"
                id={`scenario-tab-${tab}`}
                aria-selected={i === index}
                aria-controls="scenario-panel"
                tabIndex={i === index ? 0 : -1}
                className={`${styles.scenarioTab} ${i === index ? styles.scenarioTabActive : ''}`}
                onClick={() => setIndex(i)}
                onKeyDown={handleKeyDown}
              >
                {copy.tabs[tab].name}
              </button>
            ))}
          </div>
          <ol
            className={styles.scenarioSteps}
            id="scenario-panel"
            role="tabpanel"
            aria-labelledby={`scenario-tab-${active}`}
          >
            {copy.tabs[active].steps.map((step, i) => (
              <li key={step} data-accent={ENTRANCES[i % ENTRANCES.length].id}>
                <span className={styles.stepNumber}>{i + 1}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}

export function PrivacySection({ copy }) {
  return (
    <section className={styles.section} id="privacy">
      <div className="container">
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />
        <ul className={styles.privacyGrid}>
          {copy.items.map((item, i) => (
            <li key={item.title} className={styles.privacyItem}>
              <span className={styles.privacyIcon}><Icon name={PRIVACY_ICONS[i] || 'check'} size={22} /></span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Plans({ copy, lang }) {
  return (
    <section className={`${styles.section} ${styles.tinted}`} id="pricing">
      <div className="container">
        <SectionHeading title={copy.title} subtitle={copy.subtitle} />
        <div className={styles.planGrid}>
          <article className={styles.planCard}>
            <h3>{copy.free.name}</h3>
            <p className={styles.planPrice}>{copy.free.price}</p>
            <p className={styles.planTagline}>{copy.free.tagline}</p>
            <PlanPoints points={copy.free.points} />
            <a href={localizedPath(lang, '/releases')} className={`btn btn-primary ${styles.planCta}`}>{copy.free.cta}</a>
          </article>
          <article className={`${styles.planCard} ${styles.planPro}`}>
            <h3>{copy.pro.name}</h3>
            <p className={styles.planTagline}>{copy.pro.tagline}</p>
            <PlanPoints points={copy.pro.points} />
            <p className={styles.planNote}>{copy.pro.note}</p>
          </article>
        </div>
      </div>
    </section>
  )
}

function PlanPoints({ points }) {
  return (
    <ul className={styles.planPoints}>
      {points.map((point) => (
        <li key={point}><Icon name="checkSmall" size={18} />{point}</li>
      ))}
    </ul>
  )
}

export function Closing({ copy, iosCopy, lang }) {
  return (
    <section className={styles.closing}>
      <div className="container">
        <Reveal className={styles.iosBand} id="ios">
          <span className={styles.iosIcon}><Icon name="phone" size={26} /></span>
          <div>
            <span className={styles.iosBadge}>{iosCopy.badge}</span>
            <h2 className={styles.iosTitle}>{iosCopy.title}</h2>
            <p>{iosCopy.desc}</p>
          </div>
        </Reveal>
        <Reveal className={styles.cta}>
          <h2 className={styles.ctaTitle}>{copy.title}</h2>
          <p className={styles.ctaSubtitle}>{copy.subtitle}</p>
          <div className={styles.ctaActions}>
            <a href={localizedPath(lang, '/releases')} className="btn btn-primary btn-xl">{copy.download}</a>
            <a
              href={apiURL('/go/github/repository?placement=homepage_closing')}
              target="_blank"
              rel="noopener"
              onClick={(event) => trackedRedirect(event, 'github_click', '/go/github/repository', 'homepage_closing', { asset_key: 'repository' })}
              className="btn btn-secondary btn-xl"
            >
              {copy.github}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
