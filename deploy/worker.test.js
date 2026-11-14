import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import worker from './worker.mjs'

afterEach(() => vi.unstubAllGlobals())

describe('billing deployment routing', () => {
  it('runs the worker before the SPA fallback for billing endpoints', () => {
    const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'))
    expect(config.assets.run_worker_first).toContain('/api/v1/billing/*')
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
