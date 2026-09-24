import { describe, expect, it } from 'vitest'
import { apiURL } from './api'

describe('apiURL', () => {
  it('preserves direct release asset URLs', () => {
    const url = 'https://github.com/mylxsw/typeflux/releases/download/v0.4.0/Typeflux.dmg'
    expect(apiURL(url)).toBe(url)
  })
})
