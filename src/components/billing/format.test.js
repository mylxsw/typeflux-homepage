import { describe, expect, it } from 'vitest'
import { formatCredits } from './format'

describe('Credit display', () => {
  it('uses up to two decimal places without losing tiny positive balances', () => {
    expect(formatCredits(190, 'en')).toBe('190')
    expect(formatCredits(1.2, 'en')).toBe('1.2')
    expect(formatCredits(1.2345, 'en')).toBe('1.23')
    expect(formatCredits(0.0001, 'en')).toBe('<0.01')
    expect(formatCredits(0, 'en')).toBe('0')
    expect(formatCredits(13600, 'en')).toBe('13,600')
    expect(formatCredits(1.2, 'invalid_locale')).toBe('1.2')
  })
})
