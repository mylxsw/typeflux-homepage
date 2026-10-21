// Code-drawn recreations of the launcher and its built-in panels. They follow
// the app's real layout but carry invented data, so nothing private ships and
// the page can follow the app as it changes.
import Icon from '../Icon'
import {
  APP_ICONS,
  CALENDAR_TODAY,
  CN_HOLIDAY,
  MONITOR,
  TERMINAL_LINES,
  octoberGrid,
  sparkline,
} from '../homeModel'
import styles from './AppUI.module.css'

const GRID = octoberGrid()

export function AppIcon({ index, size = 28 }) {
  const icon = APP_ICONS[index % APP_ICONS.length]
  return (
    <span className={styles.appIcon} style={{ '--tone': icon.tone, width: size, height: size }}>
      <Icon name={icon.glyph} size={Math.round(size * 0.58)} strokeWidth={2} />
    </span>
  )
}

function Chip({ icon, children }) {
  return <span className={styles.chip}><Icon name={icon} size={14} strokeWidth={2} />{children}</span>
}

// The launcher frame: header input, a body, and a footer with model chips and
// hints. `footer` is 'model' (chips and hints), 'none' (hints only) or 'hidden'.
export function LauncherFrame({ chip, chipIcon = 'sparkles', query, placeholder, hints, footer = 'model', ui, children, className = '' }) {
  return (
    <div className={`${styles.launcher} ${className}`}>
      <div className={styles.launcherHeader}>
        {chip ? <Chip icon={chipIcon}>{chip}</Chip> : null}
        <span className={styles.query}>
          {query ? <span>{query}</span> : <span className={styles.placeholder}>{placeholder}</span>}
          <span className={styles.caret} aria-hidden="true" />
        </span>
        <span className={styles.headerIcons} aria-hidden="true">
          <Icon name="mic" size={17} />
          {chip ? <Icon name="browser" size={17} /> : null}
          <span className={styles.returnKey}>↩</span>
        </span>
      </div>
      <div className={styles.launcherBody}>{children}</div>
      {footer === 'hidden' ? null : <div className={styles.launcherFooter}>
        {footer === 'model' ? (
          <span className={styles.footerTools} aria-hidden="true">
            <span>+</span><Icon name="lock" size={13} />
            <span className={styles.modelChip}><Icon name="sparkles" size={12} />Typeflux Cloud</span>
            <Icon name="scanText" size={14} />
          </span>
        ) : <span />}
        <span className={styles.hints}>{hints || ui.launcher.hints.join(' · ')}</span>
      </div>}
    </div>
  )
}

export function AppsPanel({ ui, placeholder, rows = 7 }) {
  return (
    <LauncherFrame ui={ui} placeholder={placeholder}>
      <p className={styles.group}>{ui.launcher.appsGroup}</p>
      <ul className={styles.list}>
        {ui.apps.items.slice(0, rows).map((name, i) => (
          <li key={name} className={i === 0 ? styles.rowActive : ''}>
            <AppIcon index={i} />
            <span className={styles.rowTitle}>{name}</span>
            {i === 0 ? <span className={styles.rowMeta}>{ui.launcher.open} ↩</span> : null}
          </li>
        ))}
      </ul>
    </LauncherFrame>
  )
}

export function FilesPanel({ ui }) {
  const { files } = ui
  return (
    <LauncherFrame ui={ui} query={files.query}>
      <p className={styles.group}>{ui.launcher.aiGroup}</p>
      <ul className={styles.list}>
        <li><span className={styles.aiIcon}><Icon name="sparkles" size={15} /></span><span className={styles.rowTitle}>{ui.launcher.askAi} “{files.query}”</span><span className={styles.rowMeta}>⌘↩</span></li>
      </ul>
      <p className={styles.group}>{ui.launcher.filesGroup}</p>
      <ul className={styles.list}>
        {files.items.map(([name, path], i) => (
          <li key={name} className={i === 0 ? styles.rowActive : ''}>
            <span className={styles.fileIcon}><Icon name="notebook" size={15} /></span>
            <span className={styles.rowTitle}><Highlight text={name} term={files.query} /></span>
            <span className={styles.rowPath}>{path}</span>
          </li>
        ))}
      </ul>
      <p className={styles.group}>{files.contentGroup}</p>
      <ul className={styles.list}>
        <li>
          <span className={styles.fileIcon}><Icon name="scanText" size={15} /></span>
          <span className={styles.rowStack}>
            <span className={styles.rowTitle}>{files.contentItem[0]}</span>
            <span className={styles.rowPath}>{files.contentItem[1]}</span>
          </span>
        </li>
      </ul>
    </LauncherFrame>
  )
}

function Highlight({ text, term }) {
  const at = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1
  if (at < 0) return text
  return <>{text.slice(0, at)}<mark className={styles.mark}>{text.slice(at, at + term.length)}</mark>{text.slice(at + term.length)}</>
}

export function MonitorPanel({ ui }) {
  const m = ui.monitor
  return (
    <LauncherFrame ui={ui} chip={m.chip} chipIcon="activity" placeholder={m.placeholder} hints={m.hints} footer="none">
      <div className={styles.monitorMeta}>
        <span><i className={styles.liveDot} />{m.live}</span>
        <span>{m.uptime}</span>
      </div>
      <div className={styles.metricGrid}>
        {MONITOR.cards.map((card) => (
          <div key={card.id} className={styles.metric} style={{ '--tone': card.tone }}>
            <span className={styles.metricHead}><span>{m.cards[card.id][0]}</span><kbd>{card.key}</kbd></span>
            <span className={styles.metricValue}>{card.value}<small>{card.unit}</small></span>
            <span className={styles.metricSub}>{m.cards[card.id][1]}</span>
            <svg className={styles.spark} viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
              <polyline points={sparkline(card.points)} />
            </svg>
          </div>
        ))}
      </div>
      <div className={styles.tableHead}>
        <span>{m.processes}</span>
        <span className={styles.segmented}>{m.sorts.map((sort, i) => <span key={sort} className={i === 0 ? styles.segmentOn : ''}>{sort}</span>)}</span>
      </div>
      <table className={styles.table}>
        <thead><tr>{m.cols.map((col) => <th key={col}>{col}</th>)}</tr></thead>
        <tbody>
          {MONITOR.processes.map((row, i) => (
            <tr key={row[0]} className={i === 0 ? styles.rowActive : ''}>
              <td><span className={styles.procIcon} />{row[0]}</td>
              {row.slice(1).map((cell, j) => <td key={j}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </LauncherFrame>
  )
}

export function CalendarPanel({ ui, showLunar }) {
  const c = ui.calendar
  const marks = Object.fromEntries(c.marks)
  return (
    <LauncherFrame ui={ui} chip={c.chip} chipIcon="calendar" placeholder={c.placeholder} hints={c.hints} footer="none">
      <div className={styles.calendar}>
        <div>
          <div className={styles.calHead}>
            <strong>{c.month}</strong><span>{c.monthSub}</span>
            <span className={styles.calNav}><span>{c.todayButton}</span><span>‹</span><span>›</span></span>
          </div>
          <div className={styles.calGrid}>
            {c.weekdays.map((d, i) => <span key={`${d}-${i}`} className={styles.weekday}>{d}</span>)}
            {GRID.map((cell) => {
              const off = c.holidayPlan && cell.inMonth && CN_HOLIDAY.off.includes(cell.day)
              const work = c.holidayPlan && cell.inMonth && CN_HOLIDAY.work.includes(cell.day)
              const mark = cell.inMonth ? marks[cell.day] : undefined
              const sub = mark || (showLunar ? cell.lunar : '')
              const className = [
                styles.day,
                cell.inMonth ? '' : styles.dayOut,
                off ? styles.dayOff : '',
                work ? styles.dayWork : '',
                cell.inMonth && cell.day === CALENDAR_TODAY ? styles.dayToday : '',
                mark ? styles.dayMark : '',
              ].join(' ')
              return (
                <span key={`${cell.month}-${cell.day}`} className={className}>
                  <b>{cell.day}</b>
                  {sub ? <small>{sub}</small> : null}
                </span>
              )
            })}
          </div>
          {c.holidayPlan ? (
            <div className={styles.legend}><span className={styles.legendOff}>{c.legend[0]}</span><span className={styles.legendWork}>{c.legend[1]}</span></div>
          ) : null}
        </div>
        <aside className={styles.calDay}>
          <p className={styles.calDayTitle}>{c.dayTitle} <span>{c.dayWeek}</span> <em>{c.today}</em></p>
          <p className={styles.calDayMeta}>{c.dayMeta}</p>
          <p className={styles.calEventsTitle}>{c.eventsTitle}</p>
          <ul className={styles.events}>
            {c.events.map(([time, title]) => <li key={time}><span>{time}</span>{title}</li>)}
          </ul>
          <p className={styles.calNew}>{c.newEvent}</p>
        </aside>
      </div>
    </LauncherFrame>
  )
}

const SYSTEM_TONES = ['#3b82f6', '#3b82f6', '#a78bfa', '#14b8a6', '#ef4444', '#22c55e', '#f59e0b', '#9ca3af']
const SYSTEM_ICONS = ['grid', 'cpu', 'cpu', 'folder', 'laptop', 'globe', 'activity', 'code']

export function SystemPanel({ ui }) {
  const s = ui.system
  return (
    <LauncherFrame ui={ui} chip={s.chip} chipIcon="laptop" placeholder={s.placeholder} hints={s.hints} footer="none">
      <div className={styles.system}>
        <ul className={styles.sysNav}>
          {s.nav.map((item, i) => (
            <li key={item} className={i === 0 ? styles.sysNavOn : ''}>
              <span className={styles.sysIcon} style={{ '--tone': SYSTEM_TONES[i] }}><Icon name={SYSTEM_ICONS[i]} size={12} strokeWidth={2} /></span>
              {item}<kbd>⌘{i + 1}</kbd>
            </li>
          ))}
          <li className={styles.sysStatus}><i className={styles.liveDot} />{s.status}</li>
        </ul>
        <div className={styles.sysMain}>
          <div className={styles.device}>
            <Icon name="laptop" size={42} strokeWidth={1.4} />
            <div><strong>{s.device}</strong><span>{s.deviceSub}</span></div>
          </div>
          <div className={styles.tiles}>
            {s.tiles.map(([label, value, sub], i) => (
              <div key={label} className={styles.tile}>
                <span className={styles.tileLabel} style={{ '--tone': SYSTEM_TONES[i + 1] }}>{label}<kbd>⌘{i + 2}</kbd></span>
                <strong>{value}</strong>
                <span>{sub}</span>
                {i === 2 ? <span className={styles.meter}><i style={{ width: '49%' }} /></span> : null}
                {i === 5 ? <span className={`${styles.meter} ${styles.meterWarm}`}><i style={{ width: '99%' }} /></span> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </LauncherFrame>
  )
}

export function TranslatePanel({ ui }) {
  const t = ui.translate
  return (
    <LauncherFrame ui={ui} chip={t.chip} chipIcon="translate" query={t.query} hints={t.hints} footer="none">
      <div className={styles.translate}>
        <p className={styles.langRow}><span>{t.detected} ⌄</span><span aria-hidden="true">⇄</span><span className={styles.langTarget}>{t.target} ⌄</span></p>
        <div className={styles.wordCard}>
          <p className={styles.engine}><span className={styles.aiIcon}><Icon name="sparkles" size={12} /></span>{t.engine}<em>{t.wordBook}</em><kbd>⌘1</kbd></p>
          <p className={styles.word}>{t.word} <span>{t.meaning}</span></p>
          <p className={styles.phonetics}>{t.phonetics.map((p) => <span key={p}>{p}</span>)}</p>
          <ul className={styles.defs}>{t.defs.map(([pos, def]) => <li key={pos}><i>{pos}</i>{def}</li>)}</ul>
          <p className={styles.example}><span>{t.example[0]}</span><span>{t.example[1]}</span></p>
          <p className={styles.synonyms}><span>{t.synonymsLabel}</span>{t.synonyms.map((w) => <em key={w}>{w}</em>)}</p>
        </div>
        <p className={styles.group}>{t.compare}</p>
        <div className={styles.localResult}>
          <p><Icon name="laptop" size={14} />{t.local}<em>{t.localTag}</em><kbd>⌘2</kbd></p>
          <span>{t.localResult}</span>
        </div>
      </div>
    </LauncherFrame>
  )
}

export function QuickAskPanel({ ui, compact = false }) {
  const q = ui.quickAsk
  return (
    <LauncherFrame ui={ui} chip={q.chip} chipIcon="chat" query={q.query} footer="hidden" className={compact ? styles.compact : ''}>
      <div className={styles.answer}>
        <p className={styles.answerModel}>Typeflux Cloud</p>
        <h4>{q.title}</h4>
        {q.sections.map(([heading, items]) => (
          <div key={heading}>
            <h5>{heading}</h5>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
        <p>{q.tail}</p>
        <p className={styles.answerActions}>
          <span>{q.actions.join(' · ')}</span>
          <span>{q.actionsRight.join(' · ')}</span>
        </p>
      </div>
    </LauncherFrame>
  )
}

export function TerminalWindow({ ui }) {
  const t = ui.terminal
  return (
    <div className={styles.terminal}>
      <div className={styles.terminalBar}>
        <span className={styles.lights} aria-hidden="true"><i /><i /><i /></span>
        <span className={styles.terminalTitle}>{t.title}</span>
        <span className={styles.terminalTime}>0.4s</span>
      </div>
      <pre className={styles.terminalBody}>
        {TERMINAL_LINES.map(([, hash, subject]) => (
          <span key={hash}><b>{hash}</b> {subject}{'\n'}</span>
        ))}
        <span className={styles.prompt}>~/typeflux-homepage <b>❯</b> <i className={styles.caret} /></span>
      </pre>
      <div className={styles.terminalFoot}>
        <span><b>{t.running}</b> {t.shell}</span>
        <span>{t.interrupt} <em>■ {t.stop}</em></span>
      </div>
    </div>
  )
}

// One launcher demo by id, used by the launcher showcase.
export function LauncherDemo({ id, ui, placeholder, showLunar }) {
  switch (id) {
    case 'apps': return <AppsPanel ui={ui} placeholder={placeholder} />
    case 'files': return <FilesPanel ui={ui} />
    case 'cmd': return <TerminalWindow ui={ui} />
    case 'translate': return <TranslatePanel ui={ui} />
    case 'quickAsk': return <QuickAskPanel ui={ui} />
    case 'calendar': return <CalendarPanel ui={ui} showLunar={showLunar} />
    case 'monitor': return <MonitorPanel ui={ui} />
    case 'system': return <SystemPanel ui={ui} />
    default: return null
  }
}
