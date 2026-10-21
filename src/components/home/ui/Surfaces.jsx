// Code-drawn recreations of the agent workspace, clipboard, capture tools and
// recording editor, with invented data.
import Icon from '../Icon'
import { CLIPBOARD_CARDS } from '../homeModel'
import { AppIcon } from './Launcher'
import styles from './AppUI.module.css'

// Conversations per day group (today, yesterday, earlier) and where each starts.
const GROUP_SIZES = [3, 3, 2]
const GROUP_STARTS = GROUP_SIZES.map((_, i) => GROUP_SIZES.slice(0, i).reduce((sum, n) => sum + n, 0))
const SCOPE_ICONS = [null, 'cloud', 'lock']

export function ChatWorkspace({ ui, demo }) {
  const chat = ui.chat
  return (
    <div className={styles.workspace} role="img" aria-label={demo.agentLabel}>
      <aside className={styles.wsSide}>
        <div className={styles.wsSideTop}>
          <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>
          <span className={styles.wsSideButtons}><Icon name="compose" size={14} /><Icon name="sidebar" size={14} /></span>
        </div>
        <span className={styles.wsSearch}><Icon name="search" size={13} />{chat.search}<kbd>⌘K</kbd></span>
        <span className={styles.wsScopes}>
          {chat.scopes.map((scope, i) => (
            <span key={scope}>{SCOPE_ICONS[i] ? <Icon name={SCOPE_ICONS[i]} size={11} /> : null}{scope}</span>
          ))}
        </span>
        {chat.groups.map((group, g) => {
          const items = chat.conversations.slice(GROUP_STARTS[g], GROUP_STARTS[g] + GROUP_SIZES[g])
          return (
            <div key={group}>
              <p className={styles.wsGroup}>⌄ {group}</p>
              {items.map(([title, time], i) => (
                <p key={title} className={`${styles.wsConv} ${g === 0 && i === 0 ? styles.wsConvOn : ''}`}>
                  <span>{title}</span>
                  <span><Icon name="lock" size={10} />{time}</span>
                </p>
              ))}
            </div>
          )
        })}
        <div className={styles.wsUser}>
          <span className={styles.avatar}>AL</span>
          <span>{chat.user}</span>
          <Icon name="gear" size={14} className={styles.wsGear} />
        </div>
      </aside>
      <div className={styles.wsMain}>
        <div className={styles.wsMainTop}>
          <span className={styles.pill}>{chat.newChat}</span>
          <Icon name="sidebar" size={16} />
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
          <span className={styles.replyName}><span className={styles.replyOrb} />{demo.agentLabel}</span>
          {demo.answer}
        </div>
        <div className={styles.composer}>
          <p>{chat.composer}</p>
          <div className={styles.composerTools} aria-hidden="true">
            <Icon name="plus" size={16} strokeWidth={1.8} />
            <Icon name="cloud" size={15} />
            <Icon name="shield" size={15} className={styles.blue} />
            <i className={styles.toolDivider} />
            <Icon name="scanText" size={15} />
            <Icon name="sparkles" size={15} className={styles.blue} />
            <span className={styles.modelChip}><Icon name="grid" size={12} strokeWidth={2.2} />Typeflux Cloud</span>
            <Icon name="mic" size={15} />
            <span className={styles.send}><svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" /></svg></span>
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
        <Icon name="search" size={20} strokeWidth={1.8} />
        <span className={styles.clipSearch}><i className={styles.caret} />{search}</span>
        <span className={styles.clipTabs}>{c.tabs.map((tab) => <span key={tab}>{tab}</span>)}</span>
        <Icon name="more" size={18} strokeWidth={2.6} />
      </div>
      <ul className={styles.clipItems}>
        {c.items.map(([title, meta], i) => (
          <li key={title} className={i === 0 ? styles.rowActive : ''}>
            <AppIcon index={[1, 0, 6, 0][i]} size={34} />
            <span>
              {i === 2 ? <span className={styles.thumb} /> : <strong>{title}</strong>}
              <small>{i === 2 ? `${title} · ${meta}` : meta}</small>
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.clipFoot}>
        <span>{c.count}</span>
        <span>
          {c.actions.map(([label, key], i) => (
            <span key={label} className={i === c.actions.length - 1 ? styles.clipPrimary : ''}>{label}<kbd className={styles.keycap}>{key}</kbd></span>
          ))}
        </span>
      </div>
    </div>
  )
}

const CARD_TONES = { amber: '#9a6a1c', blue: '#2f5bd3', teal: '#3f4a5a', violet: '#555a85', rose: '#2f8f4e' }
const CARD_APPS = { text: 1, link: 0, code: 5, image: 4, note: 0 }

export function ClipboardShelf({ ui, cards, search }) {
  return (
    <div className={styles.shelf}>
      <div className={styles.shelfTop}>
        <span className={styles.shelfSearch}><Icon name="search" size={12} />{search}</span>
        <span className={styles.clipTabs}>{ui.clipboard.tabs.map((tab) => <span key={tab}>{tab}</span>)}</span>
        <span className={styles.shelfApps} aria-hidden="true">{[0, 1, 2, 4, 5, 6].map((i) => <AppIcon key={i} index={i} size={16} />)}</span>
        <span className={styles.shelfTools} aria-hidden="true"><Icon name="more" size={15} strokeWidth={2.6} /><Icon name="gear" size={14} /></span>
      </div>
      <ul className={styles.shelfCards}>
        {CLIPBOARD_CARDS.map(({ id, tone }, i) => (
          <li key={id} className={`${styles.card} ${i === 0 ? styles.cardOn : ''}`}>
            <span className={styles.cardHead} style={{ '--tone': CARD_TONES[tone] }}>
              <span><strong>{cards[id].kind}</strong>{cards[id].time}</span>
              <AppIcon index={CARD_APPS[id]} size={22} />
            </span>
            <span className={`${styles.cardBody} ${id === 'code' ? styles.cardCode : ''}`}>
              {id === 'image' ? <span className={styles.cardImage} /> : cards[id].body}
            </span>
            <span className={styles.cardFoot}>{id === 'image' ? cards[id].body : `⌘${i + 1}`}</span>
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

// The annotation toolbar in the app's order: frame, record | shapes and
// markup | undo, redo | beautify, adjust | OCR, translate, ask AI | pin,
// save | more | cancel, done.
const ANNOTATE_TOOLS = [
  'crop', 'record', '|', 'rect', 'circle', 'line', 'arrowUpRight', 'pen', 'highlighter', 'textT', 'counter', 'callout', 'mosaic', '|',
  'undo:dim', 'redo:dim', '|', 'wand', 'sliders', '|', 'scanText', 'translate', 'sparkles:ai', '|', 'pin', 'download', '|', 'more', '|',
  'cancel', 'ok',
]

function ToolButton({ tool }) {
  if (tool === '|') return <i />
  const [name, kind] = tool.split(':')
  if (name === 'cancel') return <span className={styles.toolCancel}><svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" /></svg></span>
  if (name === 'ok') return <span className={styles.toolOk}><svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" /></svg></span>
  const className = { dim: styles.toolDim, ai: styles.toolAi }[kind] || ''
  return <span className={className}><Icon name={name} size={16} strokeWidth={1.6} /></span>
}

// One capture mode drawn as the real overlay: selection, toolbar or recorder.
export function CaptureScene({ mode, ui }) {
  const c = ui.capture
  if (mode === 'region') {
    return (
      <div className={styles.captureStage}>
        <span className={styles.desktopWindow}><span className={styles.lights}><i /><i /><i /></span></span>
        <Selection style={{ left: '52%', top: '18%', width: '34%', height: '40%' }} label={c.size} />
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
        <span className={styles.desktopWindow}><span className={styles.lights}><i /><i /><i /></span></span>
        <Selection style={{ left: '30%', top: '14%', width: '40%', height: '40%' }} label="640 × 360 pt" blue />
        <div className={styles.recordBar}>
          <span className={styles.toolbar}>
            <span className={styles.toolDim}>≡</span>
            <i />
            {c.sources.map((source, i) => (
              <span key={source} className={`${styles.labelled} ${i === 0 ? styles.toolOn : ''}`}>
                <Icon name={['crop', 'windowFrame', 'display'][i]} size={14} />{source}
              </span>
            ))}
            <i />
            <span className={`${styles.labelled} ${styles.toolOn}`}><Icon name="film" size={14} />MP4</span>
            <span className={styles.labelled}><Icon name="image" size={14} />GIF</span>
            <i />
            <Icon name="speaker" size={15} /><Icon name="mic" size={15} /><Icon name="video" size={15} />
            <i />
            <span className={styles.labelled}><Icon name="sliders" size={14} />{c.options}</span>
            <span className={styles.labelled}><Icon name="refresh" size={14} />{c.recover}</span>
            <i />
            <span className={styles.toolDim}>✕</span>
            <span className={styles.recordStart}><i />{c.start}</span>
          </span>
          <span className={styles.recordInfo}><span>{c.recordInfo}</span><span>{c.recordHints}</span></span>
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
        <span className={styles.editorSource}><Icon name="crop" size={12} />{c.sources[0]} · 1280 × 720</span>
        <span className={styles.editorIcons} aria-hidden="true"><Icon name="keyboard" size={15} /><Icon name="more" size={15} strokeWidth={2.6} className={styles.blue} /></span>
      </div>
      <div className={styles.preview}><span /></div>
      <div className={styles.timeline}>
        <Icon name="play" size={13} />
        <span>00:00.0 / 00:06.0</span>
        <span className={styles.timelineRight}><span className={styles.speedPill}><Icon name="timer" size={12} />1×</span></span>
      </div>
      <div className={styles.frames} aria-hidden="true">
        <span className={styles.playhead} />
        {Array.from({ length: 10 }, (_, i) => <i key={i} />)}
      </div>
      <div className={styles.trim}>
        <span>{c.trimStart} <b>00:00.0</b> <em>{c.setCurrent}</em></span>
        <span>{c.trimEnd} <b>00:06.0</b> <em>{c.setCurrent}</em></span>
        <span><b>{c.keep}</b></span>
      </div>
      <div className={styles.editorFoot}>
        <Icon name="trash" size={16} className={styles.red} />
        <span className={styles.formatToggle}>
          <span className={format === 'mp4' ? styles.formatOn : ''}>MP4</span>
          <span className={format === 'gif' ? styles.formatOn : ''}>GIF</span>
        </span>
        <span className={styles.editorMeta}><b>{c.meta}</b>{c.metaSub}</span>
        <span className={styles.editorButtons}>
          <span><Icon name="folder" size={13} />{c.saveTo} ⌄</span>
          <span><Icon name="copy" size={13} />{c.copy}</span>
          <span>✓ {format === 'gif' ? c.saveGif : c.saveMp4}</span>
        </span>
      </div>
    </div>
  )
}
