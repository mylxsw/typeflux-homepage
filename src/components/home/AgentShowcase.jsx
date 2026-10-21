import { useState } from 'react'
import Heading, { Reveal } from './Heading'
import Icon from './Icon'
import { AGENT_CAPABILITIES, AGENT_MODES, ENTRANCES } from './homeModel'
import styles from './Showcase.module.css'

const agentEntrance = ENTRANCES.find((entrance) => entrance.id === 'agent')

function Workspace({ demo }) {
  return (
    <div className={styles.workspace} role="img" aria-label={demo.agentLabel}>
      <div className={styles.titlebar} aria-hidden="true"><i /><i /><i /></div>
      <div className={styles.wsGrid}>
        <aside className={styles.wsSidebar}>
          <span className={styles.wsSearch}><Icon name="search" size={13} /></span>
          {demo.conversations.map((title, i) => (
            <span key={title} className={`${styles.wsConversation} ${i === 0 ? styles.wsConversationActive : ''}`}>{title}</span>
          ))}
        </aside>
        <div className={styles.wsChat}>
          <p className={styles.wsUser}>{demo.user}</p>
          <ul className={styles.wsSteps}>
            {demo.steps.map((step) => (
              <li key={step.label} className={step.state === 'approve' ? styles.wsStepPending : ''}>
                <Icon name={step.state === 'done' ? 'checkSmall' : 'terminal'} size={15} />
                <span>{step.label}</span>
                {step.state === 'approve' ? <span className={styles.wsApprove}>{demo.approve}</span> : null}
              </li>
            ))}
          </ul>
          <div className={styles.wsAnswer}>
            <span className={styles.wsAgentName}><Icon name="sparkles" size={13} />{demo.agentLabel}</span>
            <p>{demo.answer}</p>
          </div>
          <span className={styles.wsComposer} aria-hidden="true"><Icon name="mic" size={14} /></span>
        </div>
        <aside className={styles.wsPanel}>
          <span className={styles.wsPanelTitle}><Icon name="folder" size={14} />{demo.panelTitle}</span>
          {demo.panelItems.map((item) => (
            <span key={item} className={styles.wsPanelItem}><Icon name="folder" size={13} />{item}</span>
          ))}
        </aside>
      </div>
    </div>
  )
}

export default function AgentShowcase({ copy }) {
  const [mode, setMode] = useState('standard')

  return (
    <section className={styles.section} id="agent" data-accent="agent">
      <div className="container">
        <Heading badge={copy.badge} keys={agentEntrance} title={copy.title} subtitle={copy.subtitle} />
        <Reveal className={styles.wide}>
          <Workspace demo={copy.demo} />
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
