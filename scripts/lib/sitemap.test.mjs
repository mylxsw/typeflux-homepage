import { describe, expect, it } from 'vitest'
import { LANG_CODES } from '../../src/lib/localePath.js'
import { buildSitemapXml, SITEMAP_ROUTES } from './sitemap.mjs'

describe('buildSitemapXml', () => {
  const xml = buildSitemapXml('https://typeflux.app')

  it('includes every route in every language', () => {
    const locCount = (xml.match(/<loc>/g) || []).length
    expect(locCount).toBe(SITEMAP_ROUTES.length * LANG_CODES.length)

    expect(xml).toContain('<loc>https://typeflux.app/</loc>')
    expect(xml).toContain('<loc>https://typeflux.app/zh-CN/releases</loc>')
    expect(xml).toContain('<loc>https://typeflux.app/ja/privacy</loc>')
    expect(xml).toContain('<loc>https://typeflux.app/ko/terms</loc>')
  })

  it('adds hreflang alternates and x-default for every URL', () => {
    const firstUrl = xml.split('<url>')[1].split('</url>')[0]
    for (const code of LANG_CODES) {
      expect(firstUrl).toContain(`hreflang="${code}"`)
    }
    expect(firstUrl).toContain('hreflang="x-default"')
  })

  it('is a well-formed sitemap document', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"')
    expect(xml.trim().endsWith('</urlset>')).toBe(true)
  })

  it('never lists billing routes', () => {
    expect(xml).not.toContain('billing')
    expect(xml).not.toContain('/settings/')
  })
})
