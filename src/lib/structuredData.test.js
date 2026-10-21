import { describe, expect, it } from 'vitest'
import { LANG_CODES } from './localePath'
import { getFaqItems } from '../i18n/index.jsx'
import { SITE_ORIGIN } from './site'
import { buildFeatureList, buildStructuredData } from './structuredData'
import { serializeJsonLd } from './seo'

describe('buildStructuredData', () => {
  it('returns null for non-home pages', () => {
    expect(buildStructuredData('en', 'releases')).toBeNull()
    expect(buildStructuredData('zh-CN', 'privacy')).toBeNull()
    expect(buildStructuredData('en', 'billing')).toBeNull()
  })

  it('builds Organization, WebSite, SoftwareApplication and FAQPage for home', () => {
    const data = buildStructuredData('en', 'home')
    const types = data['@graph'].map((node) => node['@type'])

    expect(data['@context']).toBe('https://schema.org')
    expect(types).toEqual(['Organization', 'WebSite', 'SoftwareApplication', 'FAQPage'])
  })

  it('describes Typeflux as a free macOS utility with absolute URLs', () => {
    const data = buildStructuredData('en', 'home')
    const app = data['@graph'].find((node) => node['@type'] === 'SoftwareApplication')

    expect(app.name).toBe('Typeflux')
    expect(app.operatingSystem).toBe('macOS')
    expect(app.offers).toEqual({ '@type': 'Offer', price: '0', priceCurrency: 'USD' })
    expect(app.isAccessibleForFree).toBe(true)
    expect(app.license).toContain('agpl-3.0')
    expect(app.url).toMatch(/^https:\/\//)
    expect(app.downloadUrl).toBe(`${SITE_ORIGIN}/releases`)
    expect(app.image).toMatch(/^https:\/\//)
  })

  it('localizes URLs, language and FAQ content', () => {
    const data = buildStructuredData('zh-CN', 'home')
    const app = data['@graph'].find((node) => node['@type'] === 'SoftwareApplication')
    const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage')

    expect(app.url).toBe(`${SITE_ORIGIN}/zh-CN`)
    expect(app.downloadUrl).toBe(`${SITE_ORIGIN}/zh-CN/releases`)
    expect(app.inLanguage).toBe('zh-CN')
    expect(faq.mainEntity.length).toBe(getFaqItems('zh-CN').length)
    expect(faq.mainEntity[0].name).toBe('Typeflux 是什么？')
    expect(faq.mainEntity.map((e) => e.name)).toContain('Typeflux 是免费的吗？')
    expect(faq.mainEntity[0].acceptedAnswer['@type']).toBe('Answer')
  })

  it('keeps FAQ structured data in sync with the visible FAQ section', () => {
    for (const lang of LANG_CODES) {
      const data = buildStructuredData(lang, 'home')
      const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage')
      const items = getFaqItems(lang)

      expect(items.length).toBeGreaterThan(0)
      expect(faq.mainEntity.map((e) => e.name)).toEqual(items.map((i) => i.q))
    }
  })

  it('lists the entry points and tools as localized features', () => {
    const en = buildStructuredData('en', 'home')['@graph'].find((node) => node['@type'] === 'SoftwareApplication')
    expect(en.featureList).toHaveLength(12)
    expect(en.featureList[0]).toMatch(/^AI Agent: /)
    expect(en.featureList).toContain('Ring: Your favorite actions in a radial menu right under the mouse.')
    expect(en.featureList).toContain('Translation: Several engines side by side, for selections or screen regions.')

    expect(buildFeatureList('ja')[1]).toMatch(/^ランチャー: /)
    expect(buildFeatureList('de')).toEqual(buildFeatureList('en'))
  })

  it('falls back to English FAQ content for unknown languages', () => {
    const data = buildStructuredData('de', 'home')
    const faq = data['@graph'].find((node) => node['@type'] === 'FAQPage')
    expect(faq.mainEntity.length).toBe(getFaqItems('en').length)
  })
})

describe('serializeJsonLd', () => {
  it('escapes angle brackets so the script tag can never break out', () => {
    const html = serializeJsonLd({ text: '</script><script>alert(1)</script>' })
    expect(html).not.toContain('</script>')
    expect(html).toContain('\\u003c/script>')
    expect(JSON.parse(html.replace(/\\u003c/g, '<')).text).toContain('</script>')
  })
})
