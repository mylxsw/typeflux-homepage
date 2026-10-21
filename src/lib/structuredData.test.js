import { describe, expect, it } from 'vitest'
import { LANG_CODES } from './localePath'
import { getFaqGroups, getFaqItems, getSeoCopy } from '../i18n/index.jsx'
import { FAQ_GROUP_IDS } from '../i18n/faq'
import { SITE_ORIGIN } from './site'
import { buildFeatureList, buildKeywords, buildStructuredData } from './structuredData'
import { serializeJsonLd } from './seo'

describe('buildStructuredData', () => {
  it('returns null for non-home pages', () => {
    expect(buildStructuredData('en', 'releases')).toBeNull()
    expect(buildStructuredData('zh-CN', 'privacy')).toBeNull()
    expect(buildStructuredData('en', 'billing')).toBeNull()
  })

  it('builds Organization, WebSite, WebPage, SoftwareApplication and FAQPage for home', () => {
    const data = buildStructuredData('en', 'home')
    const types = data['@graph'].map((node) => node['@type'])

    expect(data['@context']).toBe('https://schema.org')
    expect(types).toEqual(['Organization', 'WebSite', 'WebPage', 'SoftwareApplication', 'FAQPage'])
  })

  it('links the page, the app and the FAQ by @id', () => {
    const data = buildStructuredData('ja', 'home')
    const byType = Object.fromEntries(data['@graph'].map((node) => [node['@type'], node]))
    const page = byType.WebPage
    const app = byType.SoftwareApplication
    const faq = byType.FAQPage

    expect(page['@id']).toBe(`${SITE_ORIGIN}/ja#webpage`)
    expect(page.url).toBe(`${SITE_ORIGIN}/ja`)
    expect(page.name).toBe(getSeoCopy('ja', 'home').title)
    expect(page.isPartOf).toEqual({ '@id': byType.WebSite['@id'] })
    expect(page.about).toEqual({ '@id': app['@id'] })
    expect(faq.isPartOf).toEqual({ '@id': page['@id'] })
    expect(faq.about).toEqual({ '@id': app['@id'] })
    expect(faq.inLanguage).toBe('ja')
    expect(byType.WebSite.inLanguage).toEqual(LANG_CODES)
    expect(app.sameAs).toContain('https://github.com/mylxsw/typeflux')
  })

  it('describes Typeflux as a free macOS utility with absolute URLs', () => {
    const data = buildStructuredData('en', 'home')
    const app = data['@graph'].find((node) => node['@type'] === 'SoftwareApplication')

    expect(app.name).toBe('Typeflux')
    expect(app.operatingSystem).toBe('macOS 13 or later')
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

  it('describes requirements and localized keywords', () => {
    const app = buildStructuredData('zh-CN', 'home')['@graph'].find((node) => node['@type'] === 'SoftwareApplication')
    expect(app.operatingSystem).toBe('macOS 13 or later')
    expect(app.keywords).toBe(buildKeywords('zh-CN'))
    expect(app.keywords).toContain('启动器')
    expect(app.keywords).toContain('剪贴板管理')
    expect(buildKeywords('en').endsWith('macOS')).toBe(true)
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

describe('home FAQ and SEO copy', () => {
  it('groups the FAQ the same way in every language, including competitors', () => {
    for (const lang of LANG_CODES) {
      const groups = getFaqGroups(lang)
      expect(groups.map((group) => group.id), lang).toEqual(FAQ_GROUP_IDS)
      expect(groups.map((group) => group.items.length), lang).toEqual(getFaqGroups('en').map((group) => group.items.length))
      for (const group of groups) {
        expect(group.title, `${lang} ${group.id}`).toBeTruthy()
        for (const item of group.items) {
          expect(item.q.trim().length, lang).toBeGreaterThan(4)
          expect(item.a.trim().length, item.q).toBeGreaterThan(20)
        }
      }
      const questions = getFaqItems(lang).map((item) => item.q)
      expect(new Set(questions).size, lang).toBe(questions.length)
      const compare = groups.find((group) => group.id === 'compare').items.map((item) => item.q).join(' ')
      for (const name of ['Raycast', 'Alfred', 'Wispr Flow', 'SuperWhisper', 'Typeless', 'ChatGPT', 'Claude', 'CleanShot X', 'Maccy']) {
        expect(compare, `${lang} ${name}`).toContain(name)
      }
    }
  })

  it('keeps home SEO copy on the new positioning in every language', () => {
    for (const lang of LANG_CODES) {
      const { title, description } = getSeoCopy(lang, 'home')
      expect(title, lang).toMatch(/^Typeflux — /)
      expect(title, lang).toContain('AI')
      expect(description.length, lang).toBeGreaterThan(40)
      expect(description.length, lang).toBeLessThanOrEqual(160)
    }
  })
})
