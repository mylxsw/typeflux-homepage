// Language-neutral facts about the app (default shortcuts, keyword names, ring
// slots) and the small pure helpers the home page demos rely on.

// Default shortcuts as shipped by the macOS app. The agent is reached by asking
// in the launcher and pressing Return, so it shares the launcher shortcut.
export const ENTRANCES = [
  { id: 'agent', keys: ['⌘', 'Space'], then: '↩', icon: 'sparkles' },
  { id: 'launcher', keys: ['⌘', 'Space'], icon: 'search' },
  { id: 'voice', keys: ['Fn'], icon: 'mic' },
  { id: 'ring', keys: ['⌃', '⌥', 'Space'], icon: 'ring' },
]

export const HERO_SCENES = ENTRANCES.map((entrance) => entrance.id)

// Product categories Typeflux covers, shown under the hero.
export const REPLACES = ['dictation', 'launcher', 'chat', 'capture', 'recorder', 'clipboard', 'translator']

// What the agent can do in a conversation (see Ask/AskLocalTools and the
// Agent settings overview in the app).
export const AGENT_CAPABILITIES = [
  { id: 'chat', icon: 'chat' },
  { id: 'web', icon: 'globe' },
  { id: 'browser', icon: 'browser' },
  { id: 'files', icon: 'folder' },
  { id: 'commands', icon: 'terminal' },
  { id: 'computer', icon: 'cursor' },
  { id: 'code', icon: 'code' },
  { id: 'images', icon: 'image' },
  { id: 'memory', icon: 'notebook' },
  { id: 'skills', icon: 'puzzle' },
  { id: 'mcp', icon: 'plug' },
  { id: 'models', icon: 'cpu' },
]

// AskPermissionMode: strict asks for everything, standard runs reads on its
// own and asks before changes, auto runs every step.
export const AGENT_MODES = ['strict', 'standard', 'auto']

// How the voice capsule and the chat appear on screen.
export const FORMS = {
  capsule: ['bottom', 'orb', 'corner', 'notch'],
  chat: ['launcher', 'compact', 'quick', 'workspace'],
}

export const LAUNCHER_DEMOS = ['apps', 'files', 'cmd', 'translate', 'quickAsk', 'calendar', 'monitor', 'system']

// Invented, privacy-safe data for the redrawn app interfaces.
export const APP_ICONS = [
  { glyph: 'mail', tone: '#3b82f6' },
  { glyph: 'notebook', tone: '#eab308' },
  { glyph: 'calendar', tone: '#ef4444' },
  { glyph: 'play', tone: '#ec4899' },
  { glyph: 'image', tone: '#22c55e' },
  { glyph: 'terminal', tone: '#52525b' },
  { glyph: 'scanText', tone: '#0ea5e9' },
]

export const MONITOR = {
  cards: [
    { id: 'cpu', value: '22', unit: '%', key: '⌘1', tone: '#60a5fa', points: [8, 12, 10, 18, 14, 22, 16, 20, 26, 22] },
    { id: 'mem', value: '62', unit: '%', key: '⌘2', tone: '#a78bfa', points: [58, 59, 60, 60, 61, 61, 62, 61, 62, 62] },
    { id: 'disk', value: '49', unit: '%', key: '⌘3', tone: '#34d399', points: [4, 10, 6, 22, 8, 14, 30, 12, 9, 16] },
    { id: 'net', value: '35', unit: 'KB/s ↓', key: '⌘4', tone: '#f2c14e', points: [12, 30, 18, 42, 22, 35, 28, 50, 31, 35] },
  ],
  processes: [
    ['Typeflux', '12.3%', '446 MB', '132 KB/s', '4821'],
    ['WindowServer', '9.8%', '1.1 GB', '—', '412'],
    ['Safari', '6.4%', '880 MB', '48 KB/s', '1690'],
    ['Music', '3.1%', '312 MB', '—', '2207'],
    ['Mail', '2.2%', '264 MB', '12 KB/s', '1733'],
    ['Finder', '1.4%', '198 MB', '—', '601'],
  ],
}

export const TERMINAL_LINES = [
  ['hash', 'e0c2827', 'Showcase the agent, launcher and tools'],
  ['hash', '410469d', 'Reposition the homepage around four entry points'],
  ['hash', '45161f4', 'Center login terms consent'],
  ['hash', '30215e7', 'Simplify login heading'],
  ['hash', '1674ad8', 'Clarify the sign-in action'],
]

// October 2026 starts on a Thursday; the grid starts on Sunday, September 27.
const CALENDAR_START = { month: 9, day: 27 }
const LUNAR_DIGITS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

// Chinese lunar day name: 初一…初十, 十一…二十, 廿一…廿九, 三十.
export function lunarDayName(n) {
  if (n <= 10) return `初${LUNAR_DIGITS[n - 1]}`
  if (n < 20) return `十${LUNAR_DIGITS[n - 11]}`
  if (n === 20) return '二十'
  if (n < 30) return `廿${LUNAR_DIGITS[n - 21]}`
  return '三十'
}

// Lunar labels for the October 2026 grid: the eighth lunar month starts on
// September 11 and the ninth (九月) on October 10, 2026. Solar terms override.
const SOLAR_TERMS = { '10-8': '寒露', '10-23': '霜降', '11-7': '立冬' }

export function octoberGrid() {
  const cells = []
  let month = CALENDAR_START.month
  let day = CALENDAR_START.day
  for (let i = 0; i < 42; i += 1) {
    const inMonth = month === 10
    let lunar
    if (month === 9 || (month === 10 && day < 10)) lunar = lunarDayName(day + (month === 9 ? -10 : 20))
    else if (month === 10 && day === 10) lunar = '九月'
    else lunar = lunarDayName(month === 10 ? day - 9 : day + 22)
    lunar = SOLAR_TERMS[`${month}-${day}`] || lunar
    cells.push({ month, day, inMonth, lunar })
    const length = month === 9 ? 30 : 31
    day += 1
    if (day > length) { day = 1; month += 1 }
  }
  return cells
}

// Mainland China's 2026 National Day holiday: October 1–7 off, October 10 worked.
export const CN_HOLIDAY = { off: [1, 2, 3, 4, 5, 6, 7], work: [10] }
export const CALENDAR_TODAY = 21

// Turns values into an SVG polyline across a width × height box.
export function sparkline(points, width = 100, height = 24) {
  if (!points.length) return ''
  const max = Math.max(...points)
  const min = Math.min(...points)
  const span = max - min || 1
  const step = points.length > 1 ? width / (points.length - 1) : 0
  return points.map((v, i) => `${Math.round(i * step * 10) / 10},${Math.round((height - ((v - min) / span) * height) * 10) / 10}`).join(' ')
}

export const LAUNCHER_CAPABILITIES = [
  { id: 'files', icon: 'folder' },
  { id: 'content', icon: 'scanText' },
  { id: 'commands', icon: 'terminal' },
  { id: 'ask', icon: 'sparkles' },
  { id: 'apps', icon: 'grid' },
  { id: 'system', icon: 'cpu' },
  { id: 'web', icon: 'globe' },
  { id: 'calc', icon: 'calculator' },
]

export const CAPTURE_MODES = ['region', 'fullScreen', 'scrolling', 'recording', 'gif']

export const CLIPBOARD_CARDS = [
  { id: 'text', tone: 'amber' },
  { id: 'link', tone: 'blue' },
  { id: 'code', tone: 'teal' },
  { id: 'image', tone: 'violet' },
  { id: 'note', tone: 'rose' },
]

export const MORE_TOOLS = [
  { id: 'translate', icon: 'translate' },
  { id: 'wordBook', icon: 'book' },
  { id: 'calendar', icon: 'calendar' },
  { id: 'monitor', icon: 'activity' },
  { id: 'terminal', icon: 'terminal' },
  { id: 'notebook', icon: 'notebook' },
  { id: 'emoji', icon: 'smile' },
  { id: 'tabs', icon: 'browser' },
]

export const CUSTOM_ITEMS = [
  { id: 'aiBuild', icon: 'sparkles' },
  { id: 'workflows', icon: 'code' },
  { id: 'gallery', icon: 'grid' },
  { id: 'alfred', icon: 'download' },
  { id: 'aiCommands', icon: 'chat' },
  { id: 'hotkeys', icon: 'key' },
  { id: 'skills', icon: 'puzzle' },
  { id: 'mcp', icon: 'plug' },
]

// The ring's default slots in the app (RingConfiguration.defaultActions).
export const RING_ACTIONS = [
  { id: 'dictation', icon: 'mic' },
  { id: 'ask', icon: 'sparkles' },
  { id: 'translate', icon: 'translate' },
  { id: 'screenshot', icon: 'camera' },
  { id: 'screenshotText', icon: 'scanText' },
  { id: 'clipboard', icon: 'clipboard' },
]

export const SCENARIO_TABS = ['developer', 'writer', 'student', 'global']

export const PRIVACY_ICONS = ['laptop', 'key', 'lock', 'check', 'eyeOff', 'code']

// Pointer travel (px) before a slice counts as chosen, matching the app's 20pt.
export const RING_DEAD_ZONE = 20

const TAU = Math.PI * 2

// Returns the slice under a pointer offset from the ring centre, or -1 inside
// the dead zone. Slice 0 is centred at the top and indices run clockwise.
export function ringSliceAt(dx, dy, count, deadZone = RING_DEAD_ZONE) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || count < 1) return -1
  if (Math.hypot(dx, dy) < deadZone) return -1
  const step = TAU / count
  const angle = (Math.atan2(dx, -dy) + TAU) % TAU
  return Math.floor(((angle + step / 2) % TAU) / step) % count
}

// Centre of slice `index` on a circle of `radius`, relative to the ring centre.
export function ringSlicePosition(index, count, radius) {
  const angle = (TAU / count) * index
  // `+ 0` turns -0 into 0 so CSS never receives "-0px".
  return {
    x: Math.round(Math.sin(angle) * radius * 100) / 100 + 0,
    y: Math.round(-Math.cos(angle) * radius * 100) / 100 + 0,
  }
}

// Maps a key press to a ring command: run a numbered slot, move the
// selection with the arrow keys, run the selection, or cancel.
export function ringKeyCommand(key, selected, count) {
  if (count < 1) return null
  if (/^[1-9]$/.test(key)) {
    const index = Number(key) - 1
    return index < count ? { type: 'run', index } : null
  }
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return { type: 'select', index: selected < 0 ? 0 : (selected + 1) % count }
    case 'ArrowLeft':
    case 'ArrowUp':
      return { type: 'select', index: selected < 0 ? count - 1 : (selected - 1 + count) % count }
    case 'Enter':
    case ' ':
      return selected < 0 ? null : { type: 'run', index: selected }
    case 'Escape':
      return { type: 'select', index: -1 }
    default:
      return null
  }
}

// Roving focus for tab lists: returns the next index or null for other keys.
export function tabKeyIndex(key, current, count) {
  if (count < 1) return null
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count
    case 'Home':
      return 0
    case 'End':
      return count - 1
    default:
      return null
  }
}

// Number of characters a typewriter shows after `elapsed` ms.
export function typedLength(text, elapsed, msPerChar = 45) {
  if (!text) return 0
  if (elapsed <= 0) return 0
  return Math.min(text.length, Math.floor(elapsed / msPerChar))
}
