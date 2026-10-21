import { useState } from 'react'
import Heading, { Reveal } from './Heading'
import Icon from './Icon'
import { AGENT_CAPABILITIES, AGENT_MODES, ENTRANCES } from './homeModel'
import { ChatWorkspace } from './ui/Surfaces'
import styles from './Showcase.module.css'

const agentEntrance = ENTRANCES.find((entrance) => entrance.id === 'agent')

export default function AgentShowcase({ copy, ui }) {
  const [mode, setMode] = useState('standard')

  return (
    <section className={styles.section} id="agent" data-accent="agent">
      <div className="container">
        <Heading badge={copy.badge} keys={agentEntrance} title={copy.title} subtitle={copy.subtitle} />
        <Reveal className={styles.wide}>
          <ChatWorkspace ui={ui} demo={copy.demo} />
        </Reveal>
        <ul className={styles.capabilityGrid}>
          {AGENT_CAPABILITIES.map(({ id, icon }) => (
            <li key={id} className={styles.capability}>
              <span className={styles.capabilityIcon}><Icon name={icon} size={20} /></span>
              <strong>{copy.capabilities[id].title}</strong>
              <p>{copy.capabilities[id].desc}</p>
            </li>
          ))}
        </ul>
        <div className={styles.twoUp}>
          <Reveal className={styles.card}>
            <h3 className={styles.cardTitle}>{copy.examplesTitle}</h3>
            <ul className={styles.promptList}>
              {copy.examples.map((example) => (
                <li key={example}><Icon name="sparkles" size={14} />{example}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className={styles.card}>
            <h3 className={styles.cardTitle} id="agent-modes-title">{copy.modesTitle}</h3>
            <div className={styles.modes} role="radiogroup" aria-labelledby="agent-modes-title">
              {AGENT_MODES.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={mode === id}
                  className={`${styles.mode} ${mode === id ? styles.modeActive : ''}`}
                  onClick={() => setMode(id)}
                >
                  <strong>{copy.modes[id].name}</strong>
                  <span>{copy.modes[id].desc}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
