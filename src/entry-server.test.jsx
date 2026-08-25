// @vitest-environment jsdom
import React from 'react'
import { describe, expect, it } from 'vitest'
import { LANG_CODES, localizedPath } from './lib/localePath'
import { PUBLIC_ROUTES } from './lib/routes'
import { renderPage } from './entry-server'

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
})
