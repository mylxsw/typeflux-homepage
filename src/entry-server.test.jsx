// @vitest-environment jsdom
import React from 'react'
import { describe, expect, it } from 'vitest'
import { LANG_CODES, localizedPath } from './lib/localePath'
import { PUBLIC_ROUTES } from './lib/routes'
import { renderPage, getPublicRoutes } from './entry-server'

globalThis.React = React

const combos = PUBLIC_ROUTES.flatMap((route) => LANG_CODES.map((lang) => [lang, route]))

describe('prerender (renderPage)', () => {
  it.each(combos)('renders %s %s with localized markup and head tags', (lang, route) => {
    const path = localizedPath(lang, route)
    window.history.replaceState({}, '', path)

    const { lang: renderedLang, html, title, headTags } = renderPage(path)

    expect(renderedLang).toBe(lang)
    expect(html).toContain('Typeflux')
    expect(title).toContain('Typeflux')
    expect(headTags).toContain('rel="canonical"')
    expect(headTags).toContain(`hreflang="${lang}"`)
    expect(headTags).toContain('hreflang="x-default"')
  })

  it('renders localized body copy, not just the shell', () => {
    window.history.replaceState({}, '', '/zh-CN/')
    const { html } = renderPage('/zh-CN/')
    expect(html).toContain('免费下载')

    window.history.replaceState({}, '', '/ja/')
    const { html: jaHtml } = renderPage('/ja/')
    expect(jaHtml).toContain('無料ダウンロード')
  })

  it('renders release content on the releases route', () => {
    window.history.replaceState({}, '', '/zh-CN/releases')
    const { html } = renderPage('/zh-CN/releases')
    expect(html).toContain('v0.3.0')
  })

  it('embeds JSON-LD structured data and the visible FAQ on the home page', () => {
    window.history.replaceState({}, '', '/zh-CN/')
    const { html, headTags } = renderPage('/zh-CN/')

    expect(headTags).toContain('application/ld+json')
    expect(headTags).toContain('SoftwareApplication')
    expect(headTags).toContain('FAQPage')
    expect(headTags).not.toContain('</script><script>')

    // FAQ answers must be visible on the page, not only in the JSON-LD.
    expect(html).toContain('常见问题')
    expect(html).toContain('Typeflux 是免费的吗？')
  })

  it('omits structured data on inner pages', () => {
    window.history.replaceState({}, '', '/privacy')
    const { headTags } = renderPage('/privacy')
    expect(headTags).not.toContain('application/ld+json')
  })

  it('prerenders the blog index and blog posts with article metadata', () => {
    window.history.replaceState({}, '', '/blog')
    const index = renderPage('/blog')
    expect(index.title).toContain('Blog')
    expect(index.html).toContain('local-models-offline-voice-typing')

    window.history.replaceState({}, '', '/zh-CN/blog/local-models-offline-voice-typing')
    const post = renderPage('/zh-CN/blog/local-models-offline-voice-typing')
    expect(post.title).toContain('离线语音输入')
    expect(post.headTags).toContain('content="article"')
    expect(post.headTags).toContain('BlogPosting')
    expect(post.headTags).toContain('hreflang="en"')
    expect(post.html).toContain('离线')
  })

  it('lists blog routes in the public route set when posts exist', () => {
    expect(getPublicRoutes()).toContain('/blog')
    expect(getPublicRoutes()).toContain('/blog/local-models-offline-voice-typing')
  })
})
