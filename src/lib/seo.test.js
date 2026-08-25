import { describe, expect, it } from 'vitest'
import { LANG_CODES } from './localePath'
import { buildSeoTags, renderSeoTagsHtml, seoTitle, SITE_ORIGIN } from './seo'

function attrsOf(result, predicate) {
  return result.tags.filter(({ tag, attrs }) => predicate(tag, attrs)).map(({ attrs }) => attrs)
}

describe('seo tags', () => {
  it('builds canonical, description and localized title for a page', () => {
    const { title, tags } = buildSeoTags('zh-CN', '/releases', 'releases', { noindex: false })

    expect(title).toContain('Typeflux')
    expect(title).not.toBe(seoTitle('en', 'releases'))

    const canonical = attrsOf({ tags }, (tag, attrs) => tag === 'link' && attrs.rel === 'canonical')
    expect(canonical).toEqual([{ rel: 'canonical', href: `${SITE_ORIGIN}/zh-CN/releases` }])

    const description = attrsOf({ tags }, (tag, attrs) => attrs.name === 'description')
    expect(description).toHaveLength(1)
    expect(description[0].content.length).toBeGreaterThan(20)
  })

  it('emits hreflang alternates for every language plus x-default', () => {
    const { tags } = buildSeoTags('en', '/', 'home', { noindex: false })
    const alternates = attrsOf({ tags }, (tag, attrs) => attrs.rel === 'alternate')

    expect(alternates).toHaveLength(LANG_CODES.length + 1)
    for (const code of LANG_CODES) {
      expect(alternates.some((attrs) => attrs.hreflang === code)).toBe(true)
    }
    expect(alternates.find((attrs) => attrs.hreflang === 'x-default').href).toBe(`${SITE_ORIGIN}/`)
    expect(alternates.find((attrs) => attrs.hreflang === 'zh-CN').href).toBe(`${SITE_ORIGIN}/zh-CN`)
  })

  it('points social cards at the canonical URL with an absolute image', () => {
    const { tags } = buildSeoTags('ja', '/privacy', 'privacy', { noindex: false })

    const ogUrl = attrsOf({ tags }, (tag, attrs) => attrs.property === 'og:url')
    expect(ogUrl[0].content).toBe(`${SITE_ORIGIN}/ja/privacy`)

    const ogImage = attrsOf({ tags }, (tag, attrs) => attrs.property === 'og:image')
    expect(ogImage[0].content).toMatch(/^https:\/\//)

    const ogLocale = attrsOf({ tags }, (tag, attrs) => attrs.property === 'og:locale')
    expect(ogLocale[0].content).toBe('ja')
  })

  it('marks billing pages as noindex by default', () => {
    const { tags } = buildSeoTags('en', '/billing/plans', 'billing')
    const robots = attrsOf({ tags }, (tag, attrs) => attrs.name === 'robots')
    expect(robots).toEqual([{ name: 'robots', content: 'noindex, nofollow' }])
  })

  it('omits robots meta for indexable pages', () => {
    const { tags } = buildSeoTags('en', '/', 'home', { noindex: false })
    expect(attrsOf({ tags }, (tag, attrs) => attrs.name === 'robots')).toHaveLength(0)
  })

  it('falls back to English copy for unknown languages', () => {
    const { title } = buildSeoTags('de', '/', 'home', { noindex: false })
    expect(title).toBe(seoTitle('en', 'home'))
  })

  it('serializes tags to escaped HTML', () => {
    const html = renderSeoTagsHtml('en', '/', 'home', { noindex: false })
    expect(html).toContain('rel="canonical"')
    expect(html).toContain(`href="${SITE_ORIGIN}/"`)
    expect(html).toContain('hreflang="x-default"')
    expect(html).toContain('property="og:image"')
    expect(html).not.toContain('<script')
  })
})
