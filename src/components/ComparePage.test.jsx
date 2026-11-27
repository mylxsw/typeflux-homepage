// @vitest-environment jsdom
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../contexts/ThemeContext'
import { I18nProvider } from '../i18n/index.jsx'
import ComparePage from './ComparePage'
import Header from './Header'
import { mount } from './account/testUtils'
import { LANG_CODES, localizedPath } from '../lib/localePath'
import { buildRouteSeoTags } from '../lib/seo'

let view

afterEach(() => {
  view?.unmount()
  view = null
  window.history.replaceState({}, '', '/')
})

describe('edition comparison', () => {
  it.each([
    ['en', 'Feature', 'Included', 'Unavailable', 'en'],
    ['zh-CN', '功能', '支持', '不支持', 'zh-CN'],
    ['zh-TW', '功能', '支援', '不支援', 'zh-CN'],
    ['ja', '機能', '対応', '非対応', 'en'],
    ['ko', '기능', '지원', '미지원', 'en'],
  ])('shows localized features and links in %s', async (lang, label, included, unavailable, guideLang) => {
    const path = localizedPath(lang, '/compare')
    window.history.replaceState({}, '', path)
    view = await mount(<ComparePage />).render()

    const table = view.find('table')
    expect(table.querySelector('th[scope="col"]').textContent).toBe(label)
    const rows = [...table.querySelectorAll('tbody tr')]
    expect(rows.map((row) => row.cells[1].textContent)).toEqual(Array(6).fill(included))
    expect(rows.map((row) => row.cells[2].textContent)).toEqual([
      included, included, included, unavailable, unavailable, unavailable,
    ])
    expect(view.container.querySelector(`a[href="${localizedPath(lang, '/releases')}"]`)).toBeTruthy()
    expect(view.container.querySelector(`a[href="${localizedPath(guideLang, '/blog/switching-typeflux-editions')}"]`)).toBeTruthy()

    const { title, tags } = buildRouteSeoTags(lang, '/compare')
    expect(title).toBe(view.find('h1').textContent)
    expect(tags).toContainEqual({ tag: 'link', attrs: { rel: 'canonical', href: `https://typeflux.app${path}` } })
    expect(tags.filter(({ attrs }) => attrs.rel === 'alternate')).toHaveLength(6)
  })
})


describe('prerendered comparison', () => {
  it.each(LANG_CODES)('hydrates %s with a saved light theme', async (lang) => {
    window.history.replaceState({}, '', localizedPath(lang, '/compare'))
    localStorage.setItem('typeflux-theme', 'dark')
    localStorage.setItem('typeflux-cookie-consent', 'essential-only')
    const app = (
      <ThemeProvider>
        <I18nProvider>
          <Header isComparePage />
          <ComparePage />
        </I18nProvider>
      </ThemeProvider>
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(app)
    document.body.append(container)
    const table = container.querySelector('table')
    const recover = vi.fn()
    let root

    try {
      expect(container.querySelector('button.theme-toggle').ariaLabel).toBe('Switch to light mode')
      localStorage.setItem('typeflux-theme', 'light')
      await act(async () => { root = hydrateRoot(container, app, { onRecoverableError: recover }) })

      expect(recover).not.toHaveBeenCalled()
      expect(container.querySelector('table')).toBe(table)
      expect(container.querySelector('button.theme-toggle').ariaLabel).toBe('Switch to dark mode')
      expect(document.documentElement.dataset.theme).toBe('light')
    } finally {
      if (root) act(() => root.unmount())
      container.remove()
      localStorage.removeItem('typeflux-theme')
      localStorage.removeItem('typeflux-cookie-consent')
      document.documentElement.removeAttribute('data-theme')
    }
  })
})
