import { describe, expect, it } from 'vitest'
import { getPathname, setSSRPath } from './serverContext'

// This file intentionally runs in the default node environment (no window),
// which is exactly the prerenderer's situation.
describe('serverContext', () => {
  it('defaults to / when no SSR path was set', () => {
    expect(getPathname()).toBe('/')
  })

  it('round-trips the SSR path', () => {
    setSSRPath('/zh-CN/releases')
    expect(getPathname()).toBe('/zh-CN/releases')
  })

  it('falls back to / for empty input', () => {
    setSSRPath('')
    expect(getPathname()).toBe('/')
    setSSRPath(undefined)
    expect(getPathname()).toBe('/')
  })
})
