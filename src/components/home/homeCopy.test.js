import { describe, expect, it } from 'vitest'
import { LANG_CODES } from '../../lib/localePath'
import { HOME_COPY, formatCopy, getHomeCopy } from './homeCopy'
import { ENTRANCES, LAUNCHER_KEYWORDS, PRIVACY_ICONS, RING_ACTIONS, SCENARIO_TABS, TOOLBOX } from './homeModel'

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
    const empty = leaves(HOME_COPY[lang]).filter(([, value]) => typeof value !== 'string' || value.trim() === '')
    expect(empty).toEqual([])
  })

  it.each(LANG_CODES)('%s names every id the page renders', (lang) => {
    const copy = HOME_COPY[lang]
    for (const { id } of ENTRANCES) {
      expect(copy.entrances.items[id].name).toBeTruthy()
      expect(copy.hero.scenes[id].label).toBeTruthy()
    }
    for (const keyword of LAUNCHER_KEYWORDS) expect(copy.launcher.keywords[keyword]).toBeTruthy()
    for (const { id } of RING_ACTIONS) expect(copy.ring.actions[id]).toBeTruthy()
    for (const { id } of TOOLBOX) expect(copy.toolbox.items[id].name).toBeTruthy()
    for (const tab of SCENARIO_TABS) expect(copy.scenarios.tabs[tab].steps).toHaveLength(4)
    expect(copy.privacy.items).toHaveLength(PRIVACY_ICONS.length)
    expect(copy.ring.ran).toContain('{action}')
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
