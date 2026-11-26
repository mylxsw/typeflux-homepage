// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import ComparePage from './ComparePage'
import { mount } from './account/testUtils'
import { localizedPath } from '../lib/localePath'
import { buildRouteSeoTags } from '../lib/seo'

let view

afterEach(() => {
  view?.unmount()
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
