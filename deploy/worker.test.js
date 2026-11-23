import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker.mjs'

afterEach(() => vi.unstubAllGlobals())

describe('billing deployment routing', () => {
  it('runs the worker before the SPA fallback for billing endpoints', () => {
    const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'))
    expect(config.assets.run_worker_first).toContain('/api/*')
  })

  it.each([
    ['/api/v1/billing/plans?lang=zh-CN', 'GET'],
    ['/api/v1/billing/credit-packs?lang=zh-CN', 'GET'],
    ['/api/v1/billing/prepaid-orders?limit=20', 'GET'],
    ['/api/v1/billing/prepaid-orders', 'POST'],
    ['/api/v1/auth/web/account/billing/plans', 'GET'],
  ])('forwards %s with credentials and JSON response intact', async (path, method) => {
    const payload = JSON.stringify({ code: 'OK', data: { items: [] } })
    const fetchMock = vi.fn().mockResolvedValue(new Response(payload, {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const body = method === 'POST' ? JSON.stringify({ plan_code: 'pro' }) : undefined
    const request = new Request(`https://typeflux.app${path}`, {
      method, body,
      headers: { Authorization: 'Bearer test-page-token', 'Content-Type': 'application/json',
        'X-Typeflux-Credit-Version': '2', 'CF-Connecting-IP': '192.0.2.1' },
    })
    const response = await worker.fetch(request, {})
    const [forwarded, options] = fetchMock.mock.calls[0]
    expect(forwarded.url).toBe(`https://api.typeflux.app${path}`)
    expect(forwarded.method).toBe(method)
    expect(forwarded.headers.get('Authorization')).toBe('Bearer test-page-token')
    expect(forwarded.headers.get('X-Typeflux-Credit-Version')).toBe('2')
    expect(forwarded.headers.get('X-Real-IP')).toBe('192.0.2.1')
    if (body) expect(await forwarded.text()).toBe(body)
    expect(options).toEqual({ redirect: 'manual', cache: 'no-store' })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(await response.text()).toBe(payload)
  })
})

describe('public API and outbound deployment routing', () => {
  const locales = ['', '/zh-CN', '/zh-TW', '/ja', '/ko']
  it('bypasses static HTML for every API and localized redirect route', () => {
    const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'))
    expect(config.assets.run_worker_first).toContain('/api/*')
    for (const locale of locales) {
      for (const prefix of ['/go/*', '/d/*']) {
        expect(config.assets.run_worker_first).toContain(`${locale}${prefix}`)
      }
    }
  })

  it.each(locales.flatMap((locale) => [
    [`${locale}/go/github/repository`, '/go/github/repository', 'https://github.com/mylxsw/typeflux'],
    [`${locale}/go/github/releases`, '/go/github/releases', 'https://github.com/mylxsw/typeflux/releases'],
    [`${locale}/go/github/issues`, '/go/github/issues', 'https://github.com/mylxsw/typeflux/issues'],
    [`${locale}/d/macos/arm64/stable`, '/d/macos/arm64/stable', 'https://github.com/mylxsw/typeflux/releases/download/test/Typeflux.dmg'],
  ]))('preserves the redirect and attribution for %s', async (path, upstream, destination) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, {
      status: 302, headers: { Location: destination, 'X-Robots-Tag': 'noindex, nofollow' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const query = '?click_id=2d522f22-b36f-4f97-92da-5b942e9cc653&placement=homepage_closing'
    const assets = { fetch: vi.fn() }
    const response = await worker.fetch(new Request(`https://typeflux.app${path}${query}`), { ASSETS: assets })
    expect(fetchMock.mock.calls[0][0].url).toBe(`https://api.typeflux.app${upstream}${query}`)
    expect(fetchMock.mock.calls[0][1].redirect).toBe('manual')
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe(destination)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(assets.fetch).not.toHaveBeenCalled()
  })

  it.each(['/api/v1/app/releases/latest', '/api/v1/analytics/events/batch'])(
    'forwards public endpoint %s instead of returning homepage HTML', async (path) => {
      const fetchMock = vi.fn().mockResolvedValue(Response.json({ code: 'OK' }))
      vi.stubGlobal('fetch', fetchMock)
      const response = await worker.fetch(new Request(`https://typeflux.app${path}`), {})
      expect(fetchMock.mock.calls[0][0].url).toBe(`https://api.typeflux.app${path}`)
      expect(response.headers.get('Content-Type')).toContain('application/json')
    },
  )
})
