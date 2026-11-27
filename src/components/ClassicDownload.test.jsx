// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import ClassicDownload from './ClassicDownload'
import { apiError, flush, mount, routeFetch } from './account/testUtils'

const endpoint = '/api/v1/app/releases/latest?product=classic'
const dmg = (architecture, channel) => ({ platform: 'macos', architecture, channel, package_type: 'full_dmg' })
let view

afterEach(() => {
  view?.unmount()
  view = null
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('Classic downloads', () => {
  it('hides the whole section while fetching and shows only available Classic DMGs', async () => {
    window.history.replaceState({}, '', '/zh-CN/releases')
    let respond
    const response = new Promise((resolve) => { respond = resolve })
    const fetchMock = routeFetch({ [endpoint]: () => response })
    view = await mount(<ClassicDownload />).render()

    expect(fetchMock).toHaveBeenCalledWith(endpoint, expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(view.find('section')).toBeUndefined()
    respond({ version: '0.5.0', assets: [
      dmg('arm64', 'global'),
      dmg('x86_64', 'cn'),
      { ...dmg('x86_64', 'global'), package_type: 'app_only_zip' },
      { ...dmg('arm64', 'cn'), platform: 'windows' },
    ] })
    await flush()

    expect(view.find('h2').textContent.trim()).toBe('Typeflux Classic v0.5.0')
    const links = [...view.container.querySelectorAll('section a')].map((a) => a.getAttribute('href'))
    expect(links).toEqual([
      '/d/macos/arm64/global?package_type=full_dmg&product=classic',
      '/d/macos/x86_64/cn?package_type=full_dmg&product=classic',
      '/zh-CN/compare',
    ])
  })

  it.each([
    ['unpublished release', () => apiError('RELEASE_NOT_AVAILABLE', 503)],
    ['network error', () => { throw new TypeError('Network error') }],
    ['missing assets', () => ({ version: '0.5.0' })],
    ['empty assets', () => ({ version: '0.5.0', assets: [] })],
    ['missing version', () => ({ assets: [dmg('arm64', 'global')] })],
  ])('hides the section for %s and cancels pending work on unmount', async (_, response) => {
    const fetchMock = routeFetch({ [endpoint]: response })
    view = await mount(<ClassicDownload />).render()

    expect(view.find('section')).toBeUndefined()
    const signal = fetchMock.mock.calls.at(-1)[1].signal
    expect(signal.aborted).toBe(false)
    view.unmount()
    view = null
    expect(signal.aborted).toBe(true)
  })
})
