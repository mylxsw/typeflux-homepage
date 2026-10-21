import { describe, expect, it } from 'vitest'
import {
  AGENT_CAPABILITIES,
  AGENT_MODES,
  CAPTURE_MODES,
  CLIPBOARD_CARDS,
  CUSTOM_ITEMS,
  ENTRANCES,
  FORMS,
  HERO_SCENES,
  LAUNCHER_CAPABILITIES,
  MORE_TOOLS,
  RING_ACTIONS,
  RING_DEAD_ZONE,
  ringKeyCommand,
  ringSliceAt,
  ringSlicePosition,
  tabKeyIndex,
  typedLength,
} from './homeModel'

describe('entrances', () => {
  it('ships the app default shortcuts in a fixed order', () => {
    expect(HERO_SCENES).toEqual(['agent', 'launcher', 'voice', 'ring'])
    expect(ENTRANCES.find((e) => e.id === 'voice').keys).toEqual(['Fn'])
    expect(ENTRANCES.find((e) => e.id === 'launcher').keys).toEqual(['⌘', 'Space'])
    expect(ENTRANCES.find((e) => e.id === 'agent')).toMatchObject({ keys: ['⌘', 'Space'], then: '↩' })
    expect(ENTRANCES.find((e) => e.id === 'ring').keys).toEqual(['⌃', '⌥', 'Space'])
  })

  it('lists every capsule style, chat form and capture mode the app ships', () => {
    expect(FORMS.capsule).toEqual(['bottom', 'orb', 'corner', 'notch'])
    expect(FORMS.chat).toEqual(['launcher', 'compact', 'quick', 'workspace'])
    expect(CAPTURE_MODES).toEqual(['region', 'fullScreen', 'scrolling', 'recording', 'gif'])
    expect(AGENT_MODES).toEqual(['strict', 'standard', 'auto'])
  })

  it('keeps ids unique within each list', () => {
    for (const list of [AGENT_CAPABILITIES, LAUNCHER_CAPABILITIES, MORE_TOOLS, CUSTOM_ITEMS, CLIPBOARD_CARDS]) {
      const ids = list.map((item) => item.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('mirrors the ring default slots', () => {
    expect(RING_ACTIONS.map((a) => a.id)).toEqual(['dictation', 'ask', 'translate', 'screenshot', 'screenshotText', 'clipboard'])
  })
})

describe('ringSliceAt', () => {
  it('ignores pointers inside the dead zone', () => {
    expect(ringSliceAt(0, 0, 6)).toBe(-1)
    expect(ringSliceAt(RING_DEAD_ZONE - 1, 0, 6)).toBe(-1)
    expect(ringSliceAt(RING_DEAD_ZONE, 0, 6)).not.toBe(-1)
    expect(ringSliceAt(10, 0, 6, 5)).not.toBe(-1)
  })

  it('numbers slices clockwise from the top', () => {
    expect(ringSliceAt(0, -100, 4)).toBe(0)
    expect(ringSliceAt(100, 0, 4)).toBe(1)
    expect(ringSliceAt(0, 100, 4)).toBe(2)
    expect(ringSliceAt(-100, 0, 4)).toBe(3)
  })

  it('splits slice boundaries half a step either side of each centre', () => {
    // With six slices each spans 60°, so slice 0 covers -30°..30°.
    const at = (degrees) => {
      const r = (degrees * Math.PI) / 180
      return ringSliceAt(Math.sin(r) * 100, -Math.cos(r) * 100, 6)
    }
    expect(at(-29)).toBe(0)
    expect(at(29)).toBe(0)
    expect(at(31)).toBe(1)
    expect(at(-31)).toBe(5)
    expect(at(180)).toBe(3)
  })

  it('rejects invalid input', () => {
    expect(ringSliceAt(NaN, 50, 6)).toBe(-1)
    expect(ringSliceAt(50, Infinity, 6)).toBe(-1)
    expect(ringSliceAt(50, 50, 0)).toBe(-1)
  })

  it('round-trips with ringSlicePosition', () => {
    for (let i = 0; i < 6; i += 1) {
      const { x, y } = ringSlicePosition(i, 6, 100)
      expect(ringSliceAt(x, y, 6)).toBe(i)
    }
  })
})

describe('ringSlicePosition', () => {
  it('places slice 0 straight up and rounds to hundredths', () => {
    expect(ringSlicePosition(0, 4, 100)).toEqual({ x: 0, y: -100 })
    expect(ringSlicePosition(1, 4, 100)).toEqual({ x: 100, y: 0 })
    expect(ringSlicePosition(1, 6, 100)).toEqual({ x: 86.6, y: -50 })
  })
})

describe('ringKeyCommand', () => {
  it('runs numbered slots that exist', () => {
    expect(ringKeyCommand('1', -1, 6)).toEqual({ type: 'run', index: 0 })
    expect(ringKeyCommand('6', 2, 6)).toEqual({ type: 'run', index: 5 })
    expect(ringKeyCommand('7', 2, 6)).toBeNull()
    expect(ringKeyCommand('0', 2, 6)).toBeNull()
  })

  it('moves the selection with wrap-around', () => {
    expect(ringKeyCommand('ArrowRight', -1, 6)).toEqual({ type: 'select', index: 0 })
    expect(ringKeyCommand('ArrowDown', 5, 6)).toEqual({ type: 'select', index: 0 })
    expect(ringKeyCommand('ArrowLeft', -1, 6)).toEqual({ type: 'select', index: 5 })
    expect(ringKeyCommand('ArrowUp', 0, 6)).toEqual({ type: 'select', index: 5 })
    expect(ringKeyCommand('ArrowLeft', 3, 6)).toEqual({ type: 'select', index: 2 })
  })

  it('runs the selection, cancels, and ignores other keys', () => {
    expect(ringKeyCommand('Enter', 2, 6)).toEqual({ type: 'run', index: 2 })
    expect(ringKeyCommand(' ', 4, 6)).toEqual({ type: 'run', index: 4 })
    expect(ringKeyCommand('Enter', -1, 6)).toBeNull()
    expect(ringKeyCommand('Escape', 3, 6)).toEqual({ type: 'select', index: -1 })
    expect(ringKeyCommand('a', 3, 6)).toBeNull()
    expect(ringKeyCommand('1', -1, 0)).toBeNull()
  })
})

describe('tabKeyIndex', () => {
  it('implements roving focus keys', () => {
    expect(tabKeyIndex('ArrowRight', 3, 4)).toBe(0)
    expect(tabKeyIndex('ArrowDown', 1, 4)).toBe(2)
    expect(tabKeyIndex('ArrowLeft', 0, 4)).toBe(3)
    expect(tabKeyIndex('ArrowUp', 2, 4)).toBe(1)
    expect(tabKeyIndex('Home', 2, 4)).toBe(0)
    expect(tabKeyIndex('End', 0, 4)).toBe(3)
    expect(tabKeyIndex('Enter', 0, 4)).toBeNull()
    expect(tabKeyIndex('ArrowRight', 0, 0)).toBeNull()
  })
})

describe('typedLength', () => {
  it('reveals one character per step and never overshoots', () => {
    expect(typedLength('hello', 0)).toBe(0)
    expect(typedLength('hello', -10)).toBe(0)
    expect(typedLength('hello', 44)).toBe(0)
    expect(typedLength('hello', 90)).toBe(2)
    expect(typedLength('hello', 10_000)).toBe(5)
    expect(typedLength('hello', 100, 10)).toBe(5)
    expect(typedLength('', 1000)).toBe(0)
  })
})
