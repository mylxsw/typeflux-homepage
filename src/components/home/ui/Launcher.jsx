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

export function AppIcon({ index, size = 30 }) {
  const icon = APP_ICONS[index % APP_ICONS.length]
  return (
    <span className={styles.appIcon} style={{ '--tone': icon.tone, width: size, height: size }}>
      <Icon name={icon.glyph} size={Math.round(size * 0.56)} strokeWidth={2} />
    </span>
  )
}

// A filled, tinted icon tile like the app's plugin and settings icons.
export function Tile({ icon, tone = '#0a84ff', size = 22 }) {
  return (
    <span className={styles.tile} style={{ '--tone': tone, width: size, height: size }}>
      <Icon name={icon} size={Math.round(size * 0.64)} strokeWidth={2.1} />
    </span>
  )
}

function Chip({ icon, children }) {
  return <span className={styles.chip}><Tile icon={icon} />{children}</span>
}

// The launcher frame: header input, a body and a footer. `footer` is 'model'
// (toolbar and hints), 'hints' (hints only, as in plugin panels) or 'hidden';
// `bare` drops the body, leaving the slim search bar. Plugin panels (with a
// chip) show the drag handle and window button the app shows.
export function LauncherFrame({ chip, chipIcon = 'sparkles', query, placeholder, hints, footer = 'model', footerRight, bare = false, ui, children, className = '' }) {
  return (
    <div className={`${styles.launcher} ${bare ? styles.bare : ''} ${className}`}>
      {chip ? <span className={styles.handle} aria-hidden="true" /> : null}
      <div className={styles.launcherHeader}>
        {chip ? <Chip icon={chipIcon}>{chip}</Chip> : null}
        <span className={styles.query}>
          <span className={styles.caret} aria-hidden="true" />
          {query ? <span>{query}</span> : <span className={styles.placeholder}>{placeholder}</span>}
        </span>
        <span className={styles.headerIcons} aria-hidden="true">
          <Icon name="mic" size={20} strokeWidth={1.6} />
          {chip ? <Icon name="windows" size={20} strokeWidth={1.6} /> : null}
          <svg className={styles.returnIcon} viewBox="0 0 24 24"><path d="M20 5v6a3 3 0 0 1-3 3H5M9 10l-4 4 4 4" /></svg>
        </span>
      </div>
      {bare ? null : <div className={styles.launcherBody}>{children}</div>}
      {footer === 'hidden' ? null : footer === 'model' ? (
        <div className={styles.launcherFooter}>
          <span className={styles.footerTools} aria-hidden="true">
            <Icon name="plus" size={17} strokeWidth={1.8} />
            <Icon name="lock" size={15} />
            <span className={styles.modelChip}><Icon name="grid" size={12} strokeWidth={2.2} />Typeflux Cloud</span>
            <Icon name="shield" size={15} className={styles.blue} />
            <i className={styles.toolDivider} />
            <Icon name="scanText" size={16} className={styles.blue} />
            <Icon name="cloud" size={16} className={styles.blue} />
          </span>
          <span className={styles.hints}>{hints || ui.launcher.hints.join(' · ')}</span>
        </div>
      ) : (
        <div className={`${styles.launcherFooter} ${styles.pluginFooter}`}>
          <span className={styles.hints}>{hints}</span>
          {footerRight ? <span className={styles.hints}>{footerRight}</span> : null}
        </div>
      )}
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

function DocIcon({ kind }) {
  return (
    <span className={styles.docIcon} data-kind={kind} aria-hidden="true">
      <i />
      <b>{kind}</b>
    </span>
  )
}

export function FilesPanel({ ui }) {
  const { files } = ui
  return (
    <LauncherFrame ui={ui} query={files.query}>
      <p className={styles.group}>{ui.launcher.aiGroup}</p>
      <ul className={styles.list}>
        <li>
          <span className={styles.aiIcon}><Icon name="sparkles" size={16} /></span>
          <span className={styles.rowTitle}>{ui.launcher.askAi} <span className={styles.dim}>“{files.query}”</span></span>
          <span className={styles.rowMeta}>⌘↩</span>
        </li>
      </ul>
      <p className={styles.group}>{ui.launcher.filesGroup}</p>
      <ul className={styles.list}>
        {files.items.map(([name, path], i) => (
          <li key={name} className={i === 0 ? styles.rowActive : ''}>
            <DocIcon kind={name.split('.').pop().toUpperCase()} />
            <span className={styles.rowTitle}><Highlight text={name} term={files.query} /></span>
            <span className={styles.rowPath}>{path}</span>
            {i === 0 ? <span className={styles.rowMeta}>{ui.launcher.open} ↩</span> : null}
          </li>
        ))}
      </ul>
      <p className={styles.group}>{files.contentGroup}</p>
      <ul className={styles.list}>
        <li>
          <DocIcon kind="MD" />
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

const METRIC_ICONS = { cpu: 'cpu', mem: 'memory', disk: 'drive', net: 'arrows' }

export function MonitorPanel({ ui }) {
  const m = ui.monitor
  return (
    <LauncherFrame ui={ui} chip={m.chip} chipIcon="activity" placeholder={m.placeholder} hints={m.hints} footer="hints">
      <div className={styles.monitorMeta}>
        <span><i className={styles.liveDot} />{m.live}</span>
        <span>{m.uptime}</span>
      </div>
      <div className={styles.metricGrid}>
        {MONITOR.cards.map((card) => (
          <div key={card.id} className={styles.metric} style={{ '--tone': card.tone }}>
            <span className={styles.metricHead}>
              <span><Icon name={METRIC_ICONS[card.id]} size={14} strokeWidth={2} />{m.cards[card.id][0]}</span>
              <kbd>{card.key}</kbd>
            </span>
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
        <thead><tr>{m.cols.map((col, i) => <th key={col} className={i === 1 ? styles.sorted : ''}>{col}</th>)}</tr></thead>
        <tbody>
          {MONITOR.processes.map((row) => (
            <tr key={row[0]}>
              <td><span className={styles.procIcon}><Icon name="gear" size={12} /></span>{row[0]}</td>
              {row.slice(1).map((cell, j) => <td key={j} className={j === 0 ? styles.strong : ''}>{cell}</td>)}
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
    <LauncherFrame ui={ui} chip={c.chip} chipIcon="calendar" placeholder={c.placeholder} hints={c.hints} footer="hints">
      <div className={styles.calendar}>
        <div>
          <div className={styles.calHead}>
            <strong>{c.month}</strong><span>{c.monthSub}</span>
            <span className={styles.calNav}>
              <span>{c.todayButton}</span>
              <span><Icon name="chevronLeft" size={14} strokeWidth={2} /></span>
              <span><Icon name="chevronRight" size={14} strokeWidth={2} /></span>
            </span>
          </div>
          <div className={styles.calGrid}>
            {c.weekdays.map((d, i) => <span key={`${d}-${i}`} className={styles.weekday}>{d}</span>)}
            {GRID.map((cell) => {
              const off = c.holidayPlan && cell.inMonth && CN_HOLIDAY.off.includes(cell.day)
              const work = c.holidayPlan && cell.inMonth && CN_HOLIDAY.work.includes(cell.day)
              const mark = cell.inMonth ? marks[cell.day] : undefined
              const term = showLunar && /[露降冬]$/.test(cell.lunar)
              const sub = mark || (showLunar ? cell.lunar : '')
              const className = [
                styles.day,
                cell.inMonth ? '' : styles.dayOut,
                off ? styles.dayOff : '',
                work ? styles.dayWork : '',
                cell.inMonth && cell.day === CALENDAR_TODAY ? styles.dayToday : '',
                mark || term ? styles.dayMark : '',
              ].join(' ')
              return (
                <span key={`${cell.month}-${cell.day}`} className={className}>
                  <b>{cell.day}</b>
                  {sub ? <small>{sub}</small> : null}
                  {off ? <em className={styles.badgeOff}>{CN_HOLIDAY.badges[0]}</em> : null}
                  {work ? <em className={styles.badgeWork}>{CN_HOLIDAY.badges[1]}</em> : null}
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
          <p className={styles.calEventsTitle}><span>{c.eventsTitle}</span><span>{c.events.length}</span></p>
          <ul className={styles.events}>
            {c.events.map(([time, title]) => <li key={time}><span>{time}</span>{title}</li>)}
          </ul>
          <p className={styles.calNew}>{c.newEvent}</p>
        </aside>
      </div>
    </LauncherFrame>
  )
}

const SYSTEM_TONES = ['#0a84ff', '#0a84ff', '#a78bfa', '#2dd4bf', '#f43f5e', '#22c55e', '#f59e0b', '#8e8e93']
const SYSTEM_ICONS = ['grid', 'cpu', 'memory', 'drive', 'display', 'globe', 'battery', 'gear']

export function SystemPanel({ ui }) {
  const s = ui.system
  return (
    <LauncherFrame ui={ui} chip={s.chip} chipIcon="info" placeholder={s.placeholder} hints={s.hints} footerRight={s.copyReport} footer="hints">
      <div className={styles.system}>
        <ul className={styles.sysNav}>
          {s.nav.map((item, i) => (
            <li key={item} className={i === 0 ? styles.sysNavOn : ''}>
              <Tile icon={SYSTEM_ICONS[i]} tone={SYSTEM_TONES[i]} size={22} />
              {item}<kbd>⌘{i + 1}</kbd>
            </li>
          ))}
          <li className={styles.sysStatus}><i className={styles.liveDot} />{s.status}</li>
        </ul>
        <div className={styles.sysMain}>
          <div className={styles.device}>
            <Icon name="laptop" size={48} strokeWidth={1.2} />
            <div><strong>{s.device}</strong><span>{s.deviceSub}</span></div>
            <Icon name="copy" size={18} className={styles.deviceCopy} />
          </div>
          <div className={styles.tiles}>
            {s.tiles.map(([label, value, sub], i) => (
              <div key={label} className={styles.specTile}>
                <span className={styles.tileLabel}>
                  <span><Icon name={SYSTEM_ICONS[i + 1]} size={14} strokeWidth={2} style={{ color: SYSTEM_TONES[i + 1] }} className={styles.tileIcon} />{label}</span>
                  <kbd>⌘{i + 2}</kbd>
                </span>
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
    <LauncherFrame ui={ui} chip={t.chip} chipIcon="translate" query={t.query} hints={t.hints} footer="hints">
      <div className={styles.translate}>
        <p className={styles.group}>{t.chip}</p>
        <p className={styles.langRow}><span>{t.detected} ⌄</span><span aria-hidden="true">⇄</span><span className={styles.langTarget}>{t.target} ⌄</span></p>
        <div className={styles.wordCard}>
          <p className={styles.engine}>
            <span aria-hidden="true">⌄</span>
            <Tile icon="sparkles" />
            {t.engine}<em>{t.wordBook}</em>
            <span className={styles.engineTools} aria-hidden="true">
              <Icon name="star" size={15} /><Icon name="refresh" size={15} /><Icon name="speaker" size={15} /><Icon name="copy" size={15} />
              <kbd>⌘1</kbd>
            </span>
          </p>
          <p className={styles.word}>{t.word} <span>{t.meaning}</span></p>
          <p className={styles.phonetics}>{t.phonetics.map((p) => <span key={p}>{p} <Icon name="speaker" size={11} /></span>)}</p>
          <ul className={styles.defs}>{t.defs.map(([pos, def]) => <li key={pos}><i>{pos}</i>{def}</li>)}</ul>
          <p className={styles.example}><span>{t.example[0]}</span><span>{t.example[1]}</span></p>
          <p className={styles.synonyms}><span>{t.synonymsLabel}</span>{t.synonyms.map((w) => <em key={w}>{w}</em>)}</p>
        </div>
        <p className={styles.group}>{t.compare}</p>
        <div className={styles.localResult}>
          <p><span aria-hidden="true">⌄</span><Tile icon="laptop" tone="#8e8e93" />{t.local}<em>{t.localTag}</em><kbd>⌘2</kbd></p>
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
        <h4>{q.query}</h4>
        <p className={styles.answerLead}>{q.title}</p>
        {q.sections.map(([heading, items]) => (
          <div key={heading}>
            <h5>{heading}</h5>
            <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
        <p>{q.tail}</p>
        <p className={styles.answerActions}>
          <span>{q.actions.map((a) => <b key={a}>{a}</b>)}</span>
          <span>{q.actionsRight.map((a) => <b key={a}>{a}</b>)}</span>
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
        <span className={styles.terminalTitle}><Icon name="sparkles" size={13} />{t.title}</span>
        <span className={styles.terminalPills}><span>~</span><span>0.4s</span><Icon name="pin" size={15} className={styles.blue} /></span>
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
