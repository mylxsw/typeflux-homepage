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

export const LAUNCHER_DEMOS = ['files', 'cmd', 'ask', 'calc', 'fy', 'cal', 'tab', 'top']

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
