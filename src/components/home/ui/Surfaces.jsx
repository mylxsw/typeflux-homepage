// Code-drawn recreations of the agent workspace, clipboard, capture tools and
// recording editor, with invented data.
import Icon from '../Icon'
import { CLIPBOARD_CARDS } from '../homeModel'
import { AppIcon } from './Launcher'
import styles from './AppUI.module.css'

// Conversations per day group (today, yesterday, earlier) and where each starts.
const GROUP_SIZES = [3, 3, 2]
const GROUP_STARTS = GROUP_SIZES.map((_, i) => GROUP_SIZES.slice(0, i).reduce((sum, n) => sum + n, 0))

export function ChatWorkspace({ ui, demo }) {
  const chat = ui.chat
  return (
    <div className={styles.workspace} role="img" aria-label={demo.agentLabel}>
      <aside className={styles.wsSide}>
        <div className={styles.wsSideTop}>
          <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>
          <Icon name="chat" size={15} />
        </div>
        <span className={styles.wsSearch}><Icon name="search" size={13} />{chat.search}<kbd>⌘K</kbd></span>
        <span className={styles.wsScopes}>{chat.scopes.map((scope) => <span key={scope}>{scope}</span>)}</span>
        {chat.groups.map((group, g) => {
          const items = chat.conversations.slice(GROUP_STARTS[g], GROUP_STARTS[g] + GROUP_SIZES[g])
          return (
            <div key={group}>
              <p className={styles.wsGroup}>⌄ {group}</p>
              {items.map(([title, time], i) => (
                <p key={title} className={`${styles.wsConv} ${g === 0 && i === 0 ? styles.wsConvOn : ''}`}>
                  <span>{title}</span><span>{time}</span>
                </p>
              ))}
            </div>
          )
        })}
        <div className={styles.wsUser}><span className={styles.avatar}>AL</span>{chat.user}</div>
      </aside>
      <div className={styles.wsMain}>
        <div className={styles.wsMainTop}>
          <span className={styles.pill}>{chat.newChat}</span>
          <Icon name="browser" size={16} />
        </div>
        <p className={styles.bubbleUser}>{demo.user}</p>
        <ul className={styles.steps}>
          {demo.steps.map((step) => (
            <li key={step.label} className={step.state === 'approve' ? styles.stepWait : ''}>
              <Icon name={step.state === 'done' ? 'checkSmall' : 'terminal'} size={15} />
              <span>{step.label}</span>
              {step.state === 'approve' ? <span className={styles.allow}>{demo.approve}</span> : null}
            </li>
          ))}
        </ul>
        <div className={styles.reply}>
          <span className={styles.replyName}><Icon name="sparkles" size={13} />{demo.agentLabel}</span>
          {demo.answer}
        </div>
        <div className={styles.composer}>
          <p>{chat.composer}</p>
          <div className={styles.composerTools} aria-hidden="true">
            <span>+</span><Icon name="globe" size={14} /><Icon name="check" size={14} /><Icon name="scanText" size={14} />
            <span className={styles.modelChip}><Icon name="sparkles" size={12} />Typeflux Cloud</span>
            <Icon name="mic" size={15} />
            <span className={styles.send}><Icon name="arrowRight" size={14} strokeWidth={2.4} /></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ClipboardList({ ui, search }) {
  const c = ui.clipboard
  return (
    <div className={styles.clipList}>
      <div className={styles.clipHead}>
        <Icon name="search" size={18} />
        <span>{search}</span>
        <span className={styles.clipTabs}>{c.tabs.map((tab) => <span key={tab}>{tab}</span>)}</span>
        <span>···</span>
      </div>
      <ul className={styles.clipItems}>
        {c.items.map(([title, meta], i) => (
          <li key={title} className={i === 0 ? styles.rowActive : ''}>
            <AppIcon index={[1, 0, 6, 0][i]} size={30} />
            <span>
              {i === 2 ? <span className={styles.thumb} /> : <strong>{title}</strong>}
              <small>{i === 2 ? title : meta}</small>
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.clipFoot}>
        <span>{c.count}</span>
        <span>{c.actions.map(([label, key]) => <span key={label}><b>{label}</b> {key}</span>)}</span>
      </div>
    </div>
  )
}

const CARD_TONES = { amber: '#b7791f', blue: '#2563eb', teal: '#0f766e', violet: '#7c3aed', rose: '#16a34a' }

export function ClipboardShelf({ ui, cards, search }) {
  return (
    <div className={styles.shelf}>
      <div className={styles.shelfTop}>
        <span className={styles.shelfSearch}><Icon name="search" size={12} />{search}</span>
        <span className={styles.clipTabs}>{ui.clipboard.tabs.map((tab) => <span key={tab}>{tab}</span>)}</span>
        <span className={styles.shelfApps} aria-hidden="true">{[0, 1, 4, 6].map((i) => <AppIcon key={i} index={i} size={18} />)}</span>
      </div>
      <ul className={styles.shelfCards}>
        {CLIPBOARD_CARDS.map(({ id, tone }) => (
          <li key={id} className={styles.card}>
            <span className={styles.cardHead} style={{ '--tone': CARD_TONES[tone] }}>
              <span><strong>{cards[id].kind}</strong>{cards[id].time}</span>
            </span>
            <span className={`${styles.cardBody} ${id === 'code' ? styles.cardCode : ''}`}>
              {id === 'image' ? <span className={styles.cardImage} /> : null}
              {cards[id].body}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.shelfHints}>{ui.clipboard.shelfHints}</p>
    </div>
  )
}

const HANDLES = [[0, 0], [50, 0], [100, 0], [0, 50], [100, 50], [0, 100], [50, 100], [100, 100]]

function Selection({ style, label, blue }) {
  return (
    <span className={`${styles.selection} ${blue ? styles.selectionBlue : ''}`} style={style}>
      <span className={styles.sizeTag}>{label}</span>
      {HANDLES.map(([x, y]) => <i key={`${x}-${y}`} style={{ left: `${x}%`, top: `${y}%` }} />)}
    </span>
  )
}

const ANNOTATE_TOOLS = [
  ['scanText', 'on'], ['|'], ['grid'], ['ring'], ['arrowRight'], ['cursor'], ['Aa'], ['①'], ['chat'], ['▦'], ['|'],
  ['scanText'], ['translate'], ['sparkles', 'ai'], ['|'], ['download'], ['×', 'cancel'], ['✓', 'ok'],
]

function ToolButton({ tool }) {
  const [name, kind] = tool
  if (name === '|') return <i />
  const className = { on: styles.toolOn, ai: styles.toolAi, cancel: styles.toolCancel, ok: styles.toolOk }[kind] || ''
  const glyph = ['Aa', '①', '▦', '×', '✓'].includes(name) ? name : <Icon name={name} size={15} />
  return <span className={className}>{glyph}</span>
}

// One capture mode drawn as the real overlay: selection, toolbar or recorder.
export function CaptureScene({ mode, ui }) {
  const c = ui.capture
  if (mode === 'region') {
    return (
      <div className={styles.captureStage}>
        <span className={styles.captureDim} />
        <Selection style={{ left: '34%', top: '18%', width: '38%', height: '42%' }} label={c.size} />
        <span className={styles.toolbar} aria-hidden="true">{ANNOTATE_TOOLS.map((tool, i) => <ToolButton key={i} tool={tool} />)}</span>
      </div>
    )
  }
  if (mode === 'fullScreen') {
    return (
      <div className={styles.captureStage}>
        <span className={styles.desktopWindow}><span className={styles.lights}><i /><i /><i /></span></span>
        <span className={styles.flash} />
        <span className={styles.floatThumb} />
      </div>
    )
  }
  if (mode === 'scrolling') {
    return (
      <div className={styles.captureStage}>
        <span className={styles.desktopWindow} />
        <span className={styles.longPage}>{Array.from({ length: 16 }, (_, i) => <i key={i} />)}</span>
        <span className={styles.statusPill}>{c.scrolling} · {c.stitched}</span>
      </div>
    )
  }
  if (mode === 'recording') {
    return (
      <div className={styles.captureStage}>
        <span className={styles.captureDim} />
        <Selection style={{ left: '30%', top: '18%', width: '40%', height: '38%' }} label={c.size} blue />
        <div className={styles.recordBar}>
          <span className={styles.toolbar}>
            {c.sources.map((source, i) => <span key={source} className={i === 0 ? styles.toolOn : ''}>{source}</span>)}
            <i />
            <span className={styles.toolOn}>MP4</span><span>GIF</span>
            <i />
            <Icon name="mic" size={15} /><Icon name="video" size={15} />
            <i />
            <span>{c.options}</span>
            <span className={styles.recordStart}>● {c.start}</span>
          </span>
          <span className={styles.recordInfo}>{c.recordInfo} · {c.recordHints}</span>
        </div>
      </div>
    )
  }
  return <RecordingEditor ui={ui} format="gif" />
}

export function RecordingEditor({ ui, format = 'mp4' }) {
  const c = ui.capture
  return (
    <div className={styles.editor}>
      <div className={styles.editorBar}>
        <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>
        <strong>{c.editorTitle}</strong><span>.{format}</span>
      </div>
      <div className={styles.preview} />
      <div className={styles.timeline}><Icon name="play" size={13} />00:00.0 / 00:06.0</div>
      <div className={styles.frames} aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} />)}</div>
      <div className={styles.trim}>
        <span>{c.trimStart} <b>00:00.0</b></span>
        <span>{c.trimEnd} <b>00:06.0</b></span>
        <span><b>{c.keep}</b></span>
      </div>
      <div className={styles.editorFoot}>
        <span className={styles.formatToggle}>
          <span className={format === 'mp4' ? styles.formatOn : ''}>MP4</span>
          <span className={format === 'gif' ? styles.formatOn : ''}>GIF</span>
        </span>
        <span className={styles.editorMeta}><b>{c.meta}</b>{c.metaSub}</span>
        <span className={styles.editorButtons}>
          <span>{c.saveTo}</span><span>{c.copy}</span>
          <span>✓ {format === 'gif' ? c.saveGif : c.saveMp4}</span>
        </span>
      </div>
    </div>
  )
}
