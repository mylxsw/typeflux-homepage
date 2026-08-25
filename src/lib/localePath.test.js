import { describe, expect, it } from 'vitest'
import { DEFAULT_LANG, LANG_CODES, isSupportedLang, localizedPath, parsePath } from './localePath'

describe('localePath', () => {
  it('treats the root as the default language home', () => {
    expect(parsePath('/')).toEqual({ lang: 'en', route: '/' })
  })

  it('parses unprefixed routes as English', () => {
    expect(parsePath('/releases')).toEqual({ lang: 'en', route: '/releases' })
    expect(parsePath('/privacy')).toEqual({ lang: 'en', route: '/privacy' })
  })

  it('parses every non-default language prefix', () => {
    expect(parsePath('/zh-CN')).toEqual({ lang: 'zh-CN', route: '/' })
    expect(parsePath('/zh-TW/releases')).toEqual({ lang: 'zh-TW', route: '/releases' })
    expect(parsePath('/ja/privacy')).toEqual({ lang: 'ja', route: '/privacy' })
    expect(parsePath('/ko/terms')).toEqual({ lang: 'ko', route: '/terms' })
  })

  it('matches language prefixes case-insensitively', () => {
    expect(parsePath('/ZH-cn/releases')).toEqual({ lang: 'zh-CN', route: '/releases' })
  })

  it('does not treat similar-looking segments as language prefixes', () => {
    expect(parsePath('/japan')).toEqual({ lang: 'en', route: '/japan' })
    expect(parsePath('/zh-CNish/releases')).toEqual({ lang: 'en', route: '/zh-CNish/releases' })
  })

  it('normalizes trailing slashes, duplicate slashes and query strings', () => {
    expect(parsePath('/zh-CN/releases/')).toEqual({ lang: 'zh-CN', route: '/releases' })
    expect(parsePath('//releases//')).toEqual({ lang: 'en', route: '/releases' })
    expect(parsePath('/zh-CN/releases?x=1#y')).toEqual({ lang: 'zh-CN', route: '/releases' })
    expect(parsePath('')).toEqual({ lang: 'en', route: '/' })
    expect(parsePath(undefined)).toEqual({ lang: 'en', route: '/' })
  })

  it('builds localized paths for every language', () => {
    expect(localizedPath('en', '/releases')).toBe('/releases')
    expect(localizedPath('zh-CN', '/releases')).toBe('/zh-CN/releases')
    expect(localizedPath('zh-TW', '/')).toBe('/zh-TW')
    expect(localizedPath('ja', '/')).toBe('/ja')
    expect(localizedPath('ko', '/terms')).toBe('/ko/terms')
  })

  it('falls back to the default language for unknown codes', () => {
    expect(localizedPath('fr', '/releases')).toBe('/releases')
  })

  it('round-trips through parsePath', () => {
    for (const lang of LANG_CODES) {
      for (const route of ['/', '/releases', '/privacy', '/terms']) {
        expect(parsePath(localizedPath(lang, route))).toEqual({ lang, route })
      }
    }
  })

  it('exposes a sane language list', () => {
    expect(DEFAULT_LANG).toBe('en')
    expect(LANG_CODES[0]).toBe(DEFAULT_LANG)
    expect(isSupportedLang('zh-CN')).toBe(true)
    expect(isSupportedLang('de')).toBe(false)
  })
})
