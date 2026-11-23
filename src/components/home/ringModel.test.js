import { describe, expect, it } from 'vitest'
import {
  RING,
  clampCenter,
  holePath,
  itemAngle,
  labelLines,
  outerRadius,
  outlinePath,
  pickSlot,
  pullFor,
  releaseAction,
  ringPoint,
  sectorPath,
  stepJelly,
  textWidth,
  wrapAngle,
} from './ringModel'

describe('ring geometry', () => {
  it('puts slot 0 at the top and runs clockwise', () => {
    expect(itemAngle(0, 6)).toBeCloseTo(Math.PI / 2)
    const [x, y] = ringPoint(100, itemAngle(1, 4))
    expect(x).toBeCloseTo(RING.C + 100)
    expect(y).toBeCloseTo(RING.C)
  })

  it('wraps angles into (-π, π]', () => {
    expect(wrapAngle(3 * Math.PI)).toBeCloseTo(Math.PI)
    expect(wrapAngle(-3 * Math.PI)).toBeCloseTo(-Math.PI)
    expect(wrapAngle(0.5)).toBe(0.5)
  })

  it('bulges the rim toward the jelly angle only', () => {
    expect(outerRadius(0, null)).toBe(RING.R_OUT)
    expect(outerRadius(0, { angle: 0, ext: 0 })).toBe(RING.R_OUT)
    const jelly = { angle: 0, ext: 40 }
    expect(outerRadius(0, jelly)).toBeCloseTo(RING.R_OUT + 40)
    expect(outerRadius(Math.PI, jelly)).toBeCloseTo(RING.R_OUT, 0)
  })

  it('builds closed outline, hole and sector paths', () => {
    expect(outlinePath(null, 4)).toMatch(/^M.*Z$/)
    expect(outlinePath({ angle: 0, ext: 30 })).not.toBe(outlinePath(null))
    expect(holePath(54)).toContain('A54 54')
    expect(sectorPath(0, 6, null, 2).split('L')).toHaveLength(6)
  })
})

describe('pickSlot', () => {
  it('ignores the centre and follows direction beyond the rim', () => {
    expect(pickSlot(0, 0, 6)).toBe(-1)
    expect(pickSlot(0, -40, 6)).toBe(-1)
    expect(pickSlot(0, -60, 6)).toBe(0)
    expect(pickSlot(500, 0, 6)).toBe(2)
    expect(pickSlot(0, 300, 6)).toBe(3)
    expect(pickSlot(-300, 0, 6)).toBe(5)
    expect(pickSlot(10, 0, 6, 5)).toBe(2)
  })

  it('rejects invalid input', () => {
    expect(pickSlot(NaN, 1, 6)).toBe(-1)
    expect(pickSlot(100, 100, 0)).toBe(-1)
  })
})

describe('jelly', () => {
  it('pulls only past the rim, up to a limit', () => {
    expect(pullFor(RING.R_OUT)).toBe(0)
    expect(pullFor(RING.R_OUT + 20)).toBeCloseTo(9)
    expect(pullFor(1000)).toBe(RING.MAX_PULL)
  })

  it('eases toward the target and settles', () => {
    let jelly = { angle: 0, ext: 0 }
    const target = { angle: 1, ext: 40 }
    let frames = 0
    let moving = true
    while (moving && frames < 200) {
      ;({ jelly, moving } = stepJelly(jelly, target))
      frames += 1
    }
    expect(frames).toBeLessThan(200)
    expect(jelly.ext).toBeCloseTo(40, 0)
    expect(jelly.angle).toBeCloseTo(1, 1)
    // Shrinks back more slowly than it grows.
    const grow = stepJelly({ angle: 0, ext: 0 }, { angle: 0, ext: 10 }).jelly.ext
    const shrink = 10 - stepJelly({ angle: 0, ext: 10 }, { angle: 0, ext: 0 }).jelly.ext
    expect(shrink).toBeLessThan(grow)
  })
})

describe('clampCenter', () => {
  it('moves the ring inward near the edges', () => {
    expect(clampCenter([10, 10], 960, 560)).toEqual([RING.MARGIN, RING.MARGIN])
    expect(clampCenter([950, 550], 960, 560)).toEqual([960 - RING.MARGIN, 560 - RING.MARGIN])
    expect(clampCenter([400, 300], 960, 560)).toEqual([400, 300])
    expect(clampCenter([10, 10], 300, 300)).toEqual([150, 150])
  })
})

describe('releaseAction', () => {
  it('keeps a tap open, runs a flick and cancels in the centre', () => {
    expect(releaseAction({ moved: 5, dist: 200, selected: 1 })).toBe('stay')
    expect(releaseAction({ moved: 40, dist: 200, selected: 1 })).toBe('run')
    expect(releaseAction({ moved: 40, dist: 10, selected: 1 })).toBe('cancel')
    expect(releaseAction({ moved: 40, dist: 200, selected: -1 })).toBe('cancel')
  })
})

describe('labelLines', () => {
  it('keeps short labels and wraps long ones', () => {
    expect(labelLines('截图')).toEqual(['截图'])
    expect(labelLines('Copy text from screen')).toEqual(['Copy text', 'from screen'])
    expect(labelLines('翻译选中文字和段落')).toHaveLength(2)
    expect(labelLines('Supercalifragilisticexpialidocious')[0].endsWith('…')).toBe(true)
    expect(textWidth('ab')).toBeCloseTo(12.2)
  })
})
