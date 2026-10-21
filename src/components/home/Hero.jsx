import { useRef, useState } from 'react'
import { trackedRedirect } from '../../lib/analytics'
import { apiURL } from '../../lib/api'
import { localizedPath } from '../../lib/localePath'
import { Keys } from './Icon'
import { RingDial } from './RingDemo'
import ScaledDesktop from './ui/ScaledDesktop'
import { ChatScene, DocumentWindow } from './ui/Scenes'
import VoiceCapsule from './ui/Voice'
import { ENTRANCES, HERO_SCENES, tabKeyIndex } from './homeModel'
import { useAutoCycle, usePrefersReducedMotion, useTypewriter } from './homeHooks'
import { MultilineTitle } from './FeatureSection'
import styles from './Hero.module.css'

const SCENE_INTERVAL = 6000

export default function Hero({ copy, ringCopy, ui, demo, placeholder, lang }) {
  const reduced = usePrefersReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [index, select] = useAutoCycle(HERO_SCENES.length, { interval: SCENE_INTERVAL, paused: reduced || hovered })
  const tabRefs = useRef([])
  const scene = HERO_SCENES[index]

  const handleTabKey = (event) => {
    const next = tabKeyIndex(event.key, index, HERO_SCENES.length)
    if (next === null) return
    event.preventDefault()
    select(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.content}>
          <span className={styles.eyebrow}>{copy.eyebrow}</span>
          <h1 className={styles.title}><MultilineTitle text={copy.title} /></h1>
          <p className={styles.subtitle}>{copy.subtitle}</p>
          <div className={styles.actions}>
            <a href={localizedPath(lang, '/releases')} className="btn btn-primary btn-lg">
              <DownloadIcon />
              {copy.download}
            </a>
            <a
              href={apiURL('/go/github/repository?placement=homepage_hero')}
              target="_blank"
              rel="noopener"
              onClick={(event) => trackedRedirect(event, 'github_click', '/go/github/repository', 'homepage_hero', { asset_key: 'repository' })}
              className="btn btn-secondary btn-lg"
            >
              <GitHubIcon />
              {copy.source}
            </a>
          </div>
          <p className={styles.requirement}>{copy.requirement}</p>
        </div>

        <div
          className={styles.visual}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
        >
          <div className={styles.tabs} role="tablist" aria-label={copy.demoLabel}>
            {ENTRANCES.map((entrance, i) => (
              <button
                key={entrance.id}
                ref={(node) => { tabRefs.current[i] = node }}
                type="button"
                role="tab"
                id={`hero-tab-${entrance.id}`}
                aria-selected={i === index}
                aria-controls="hero-scene"
                tabIndex={i === index ? 0 : -1}
                className={`${styles.tab} ${i === index ? styles.tabActive : ''}`}
                data-accent={entrance.id}
                onClick={() => select(i)}
                onKeyDown={handleTabKey}
              >
                <span className={styles.tabLabel}>{copy.scenes[entrance.id].label}</span>
                <Keys keys={entrance.keys} then={entrance.then} className={styles.tabKeys} />
              </button>
            ))}
          </div>
          <div
            className={styles.stage}
            id="hero-scene"
            role="tabpanel"
            aria-labelledby={`hero-tab-${scene}`}
            data-scene={scene}
          >
            <ScaledDesktop
              desktop={ui.desktop}
              app={scene === 'voice' ? ui.voice.app : 'Typeflux'}
              width={1000}
              height={600}
              initialScale={1.04}
            >
              <div key={scene} className={styles.sceneLayer}>
                <HeroScene scene={scene} copy={{ ...copy.scenes[scene], placeholder }} ringCopy={ringCopy} ui={ui} demo={demo} animate={!reduced} />
              </div>
            </ScaledDesktop>
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroScene({ scene, copy, ringCopy, ui, demo, animate }) {
  if (scene === 'agent') return <ChatScene variant="workspace" ui={ui} demo={demo} placeholder={copy.placeholder} />
  if (scene === 'launcher') return <ChatScene variant="launcher" ui={ui} placeholder={copy.placeholder} />
  if (scene === 'voice') return <VoiceScene copy={copy} ui={ui} animate={animate} />
  return (
    <>
      <DocumentWindow title={ui.voice.app} className={styles.dimmedDoc}><span className={styles.ghostText} /></DocumentWindow>
      <div className={styles.ringSpot}>
        <RingDial labels={ringCopy.actions} centerTitle={ringCopy.centerTitle} centerSub={ui.ring.actionsCount} selected={4} aria-hidden="true" />
        <svg className={styles.pointer} viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3l14 8-6.2 1.6L10 19z" /></svg>
      </div>
      <p className={styles.sceneHint}>{copy.hint}</p>
    </>
  )
}

function VoiceScene({ copy, ui, animate }) {
  const { shown } = useTypewriter(copy.text, animate)
  return (
    <>
      <DocumentWindow title={ui.voice.app}>
        <p className={styles.typed}>
          {shown}
          <span className={styles.caret} aria-hidden="true" />
        </p>
      </DocumentWindow>
      <span className={styles.cornerCapsule}><VoiceCapsule variant="corner" voice={ui.voice} time="0:03" /></span>
    </>
  )
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 1v10m0 0l-3.5-3.5M8 11l3.5-3.5M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  )
}
