import { useState } from 'react'
import Icon from './Icon'
import { LAUNCHER_KEYWORDS } from './homeModel'
import styles from './Mockups.module.css'

function Window({ title, children, className = '' }) {
  return (
    <div className={`${styles.window} ${className}`}>
      <div className={styles.titlebar} aria-hidden="true">
        <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
        {title ? <span className={styles.windowTitle}>{title}</span> : null}
      </div>
      <div className={styles.windowBody}>{children}</div>
    </div>
  )
}

export function VoiceVisual({ copy }) {
  return (
    <div className={styles.stack}>
      <Window title={copy.demo.app}>
        <div className={styles.mailLines} aria-hidden="true"><span /><span /></div>
        <p className={styles.draft}>{copy.demo.draft}</p>
        <div className={styles.voiceBar}>
          <span className={styles.voicePill}>
            <Icon name="mic" size={16} />
            {copy.demo.status}
          </span>
          <span className={styles.personaChip}>{copy.demo.persona}</span>
        </div>
      </Window>
      <dl className={styles.stats}>
        {copy.stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function AgentVisual({ copy }) {
  const { demo } = copy
  return (
    <Window title={demo.agentLabel} className={styles.agentWindow}>
      <p className={styles.userBubble}>{demo.user}</p>
      <ul className={styles.toolSteps}>
        {demo.steps.map((step) => (
          <li key={step.label} className={step.state === 'approve' ? styles.stepPending : ''}>
            <Icon name={step.state === 'done' ? 'checkSmall' : 'folder'} size={16} />
            <span>{step.label}</span>
            {step.state === 'approve' ? <span className={styles.approve}>{demo.approve}</span> : null}
          </li>
        ))}
      </ul>
      <div className={styles.agentReply}>
        <span className={styles.agentName}><Icon name="sparkles" size={14} />{demo.agentLabel}</span>
        <p>{demo.answer}</p>
      </div>
    </Window>
  )
}

// A launcher mock whose keyword chips can be clicked to preview what each
// built-in keyword does.
export function LauncherVisual({ copy }) {
  const [active, setActive] = useState(LAUNCHER_KEYWORDS[0])

  return (
    <div className={styles.stack}>
      <Window className={styles.launcherWindow}>
        <div className={styles.launcherInput}>
          <Icon name="search" size={18} />
          <span className={styles.launcherKeyword}>{active}</span>
          <span className={styles.launcherPlaceholder}>{copy.placeholder}</span>
        </div>
        <p className={styles.launcherResult} aria-live="polite">
          <Icon name="arrowRight" size={16} />
          {copy.keywords[active]}
        </p>
      </Window>
      <div className={styles.keywordBlock}>
        <p className={styles.keywordTitle} id="launcher-keywords-title">{copy.keywordsTitle}</p>
        <div className={styles.keywords} role="group" aria-labelledby="launcher-keywords-title">
          {LAUNCHER_KEYWORDS.map((keyword) => (
            <button
              key={keyword}
              type="button"
              className={`${styles.keywordChip} ${keyword === active ? styles.keywordActive : ''}`}
              aria-pressed={keyword === active}
              title={copy.keywords[keyword]}
              onClick={() => setActive(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
