import { describe, expect, it } from 'vitest'
import { LANG_CODES } from '../../lib/localePath'
import { HOME_COPY, formatCopy, getHomeCopy } from './homeCopy'
import {
  AGENT_CAPABILITIES,
  AGENT_MODES,
  CAPTURE_MODES,
  CLIPBOARD_CARDS,
  CUSTOM_ITEMS,
  ENTRANCES,
  FORMS,
  LAUNCHER_CAPABILITIES,
  LAUNCHER_DEMOS,
  MORE_TOOLS,
  PRIVACY_ICONS,
  REPLACES,
  RING_ACTIONS,
  SCENARIO_TABS,
} from './homeModel'

// Describes a value's structure: object keys, array lengths and leaf types.
function shape(value) {
  if (Array.isArray(value)) return value.map(shape)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, shape(value[key])]))
  }
  return typeof value
}

function leaves(value, path = []) {
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, [...path, i]))
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([k, v]) => leaves(v, [...path, k]))
  return [[path.join('.'), value]]
}

describe('home copy', () => {
  it('covers every supported language', () => {
    expect(Object.keys(HOME_COPY).sort()).toEqual([...LANG_CODES].sort())
  })

  it.each(LANG_CODES)('%s has the same structure as English', (lang) => {
    expect(shape(HOME_COPY[lang])).toEqual(shape(HOME_COPY.en))
  })

  it.each(LANG_CODES)('%s has no empty strings', (lang) => {
    // Calendar marks carry day numbers and a holiday flag; every string must be filled in.
    const empty = leaves(HOME_COPY[lang]).filter(([, value]) => (typeof value === 'string' ? value.trim() === '' : !['number', 'boolean'].includes(typeof value)))
    expect(empty).toEqual([])
  })

  it.each(LANG_CODES)('%s names every id the page renders', (lang) => {
    const copy = HOME_COPY[lang]
    for (const { id } of ENTRANCES) {
      expect(copy.entrances.items[id].name).toBeTruthy()
      expect(copy.hero.scenes[id].label).toBeTruthy()
    }
    for (const id of REPLACES) expect(copy.replaces.items[id]).toBeTruthy()
    for (const { id } of AGENT_CAPABILITIES) expect(copy.agent.capabilities[id].title).toBeTruthy()
    for (const id of AGENT_MODES) expect(copy.agent.modes[id].name).toBeTruthy()
    for (const id of LAUNCHER_DEMOS) expect(copy.launcher.demos[id]).toBeTruthy()
    for (const { id } of LAUNCHER_CAPABILITIES) expect(copy.launcher.capabilities[id].title).toBeTruthy()
    for (const [group, variants] of Object.entries(FORMS)) {
      expect(copy.forms.tabs[group]).toBeTruthy()
      for (const variant of variants) expect(copy.forms[group][variant].name).toBeTruthy()
    }
    for (const id of CAPTURE_MODES) expect(copy.capture.modes[id].name).toBeTruthy()
    for (const { id } of CLIPBOARD_CARDS) expect(copy.clipboard.cards[id].body).toBeTruthy()
    for (const { id } of RING_ACTIONS) expect(copy.ring.actions[id]).toBeTruthy()
    for (const { id } of MORE_TOOLS) expect(copy.more.items[id].name).toBeTruthy()
    for (const { id } of CUSTOM_ITEMS) expect(copy.custom.items[id].title).toBeTruthy()
    for (const tab of SCENARIO_TABS) expect(copy.scenarios.tabs[tab].steps).toHaveLength(4)
    expect(copy.privacy.items).toHaveLength(PRIVACY_ICONS.length)
    expect(copy.ring.ran).toContain('{action}')
    expect(copy.ui.system.nav).toHaveLength(8)
    expect(copy.ui.system.tiles).toHaveLength(6)
    expect(copy.ui.calendar.weekdays).toHaveLength(7)
    expect(copy.ui.calendar.marks).toHaveLength(2)
    expect(copy.ui.chat.conversations).toHaveLength(8)
    expect(copy.ui.chat.groups).toHaveLength(3)
    expect(copy.ui.capture.sources).toHaveLength(3)
  })

  it('only marks the mainland China holiday plan on the simplified Chinese calendar', () => {
    expect(LANG_CODES.filter((lang) => HOME_COPY[lang].ui.calendar.holidayPlan)).toEqual(['zh-CN'])
  })

  it.each(LANG_CODES)('%s carries no pricing copy', (lang) => {
    expect(HOME_COPY[lang]).not.toHaveProperty('plans')
    expect(JSON.stringify(HOME_COPY[lang])).not.toMatch(/Pro plan|Pro 套餐|Pro 方案|Pro プラン|Pro 요금제|\$\d|¥\d/)
  })

  it('tells visitors the iPhone app is not released yet', () => {
    expect(HOME_COPY.en.ios.badge).toBe('Coming soon')
    expect(HOME_COPY['zh-CN'].ios.badge).toBe('即将上线')
    expect(HOME_COPY['zh-CN'].ios.title).toContain('筹备中')
  })

  it('falls back to English for unknown languages', () => {
    expect(getHomeCopy('de')).toBe(HOME_COPY.en)
    expect(getHomeCopy(undefined)).toBe(HOME_COPY.en)
    expect(getHomeCopy('ja')).toBe(HOME_COPY.ja)
  })
})

describe('formatCopy', () => {
  it('fills known placeholders and keeps unknown ones', () => {
    expect(formatCopy('Ran: {action}', { action: 'Translate' })).toBe('Ran: Translate')
    expect(formatCopy('{a} and {b}', { a: 1 })).toBe('1 and {b}')
    expect(formatCopy('plain')).toBe('plain')
  })
})
