import { describe, expect, it } from 'vitest'
import { formatPostDate } from './postDate'

describe('formatPostDate', () => {
  it('formats dates in the requested language', () => {
    expect(formatPostDate('2026-08-25', 'en')).toContain('August')
    expect(formatPostDate('2026-08-25', 'zh-CN')).toContain('2026')
    expect(formatPostDate('2026-08-25', 'zh-CN')).toContain('8')
  })

  it('falls back to English for invalid locales', () => {
    expect(formatPostDate('2026-08-25', 'not-a-locale')).toContain('August')
  })
})
