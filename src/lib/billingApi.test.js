import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BILLING_PAGE_TOKEN_STORAGE_KEY,
  BillingApiError,
  clearBillingPageToken,
  clearStoredBillingPageToken,
  createBillingCheckoutSession,
  createCreditPackCheckoutSession,
  createRequestId,
  fetchBillingPlans,
  fetchCheckoutSessionStatus,
  fetchCreditGrants,
  fetchCreditPacks,
  parseBillingPageToken,
  resolveBillingPageToken,
} from './billingApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('billing API', () => {
  it('parses and decodes the billing token from the URL fragment', () => {
    expect(parseBillingPageToken('#t=header.payload.signature')).toBe('header.payload.signature')
    expect(parseBillingPageToken('#source=app&t=token%2Bvalue')).toBe('token+value')
    expect(parseBillingPageToken('#source=app')).toBe('')
  })

  it('persists a hash token and restores it on refresh', () => {
    const storage = fakeStorage()

    expect(resolveBillingPageToken('#t=fresh-token', storage)).toEqual({
      token: 'fresh-token', fromHash: true, persisted: true,
    })
    expect(storage.getItem(BILLING_PAGE_TOKEN_STORAGE_KEY)).toBe('fresh-token')
    expect(resolveBillingPageToken('', storage)).toEqual({
      token: 'fresh-token', fromHash: false, persisted: false,
    })

    clearStoredBillingPageToken(storage)
    expect(resolveBillingPageToken('', storage).token).toBe('')
  })

  it('keeps the hash token usable when session storage is unavailable', () => {
    const storage = { setItem: vi.fn(() => { throw new DOMException('blocked', 'SecurityError') }) }

    expect(resolveBillingPageToken('#t=fallback-token', storage)).toEqual({
      token: 'fallback-token', fromHash: true, persisted: false,
    })
  })

  it('removes the token fragment without changing the path or query', () => {
    const history = { state: { from: 'app' }, replaceState: vi.fn() }
    clearBillingPageToken({ pathname: '/billing/plans', search: '?campaign=launch' }, history)
    expect(history.replaceState).toHaveBeenCalledWith(history.state, '', '/billing/plans?campaign=launch')
  })

  it('loads and normalizes plans with the billing-page bearer token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK',
      data: {
        billing_enabled: true,
        plans: [{
          code: 'pro', name: 'Pro', description: 'For daily use', tagline: 'Do more with AI', interval: 'month',
          features: ['Fast transcription', '', 42], usage_summary: 'Up to 60 videos', highlight: true, sort_order: 2,
          price_cents: 1200, currency: 'usd', monthly_credits: 90000, current_plan: false,
          prices: [
            { interval: 'month', price_id: 'price_month', price_cents: 1200, currency: 'usd', default: true },
            { interval: 'year', price_id: 'price_year', price_cents: 12000, currency: 'usd', discount_percent: 16.6 },
          ],
        }],
        current_subscription: { plan_code: 'free', status: 'active' },
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const result = await fetchBillingPlans('billing-token', { lang: 'zh-CN' })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/plans?lang=zh-CN', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer billing-token' }),
    }))
    expect(result).toEqual({
      billingEnabled: true,
      plans: [{
        code: 'pro', name: 'Pro', description: 'For daily use', tagline: 'Do more with AI',
        usageSummary: 'Up to 60 videos', features: ['Fast transcription'], interval: 'month',
        highlight: true, paid: true, sortOrder: 2,
        prices: [
          { interval: 'month', priceId: 'price_month', priceCents: 1200, currency: 'USD', default: true, current: false, discountPercent: 0 },
          { interval: 'year', priceId: 'price_year', priceCents: 12000, currency: 'USD', default: false, current: false, discountPercent: 17 },
        ],
        monthlyCredits: 90000, priceCents: 1200, currency: 'USD', currentPlan: false,
      }],
      currentSubscription: { plan_code: 'free', status: 'active' },
    })
  })

  it('classifies an unauthorized response as an expired token', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'AUTH_INVALID_TOKEN', message: 'invalid billing page token',
    }), { status: 401, headers: { 'Content-Type': 'application/json' } }))

    await expect(fetchBillingPlans('expired')).rejects.toMatchObject({
      name: 'BillingApiError', kind: 'expired_token', status: 401,
    })
  })

  it.each([
    [409, 'BILLING_SUBSCRIPTION_EXISTS', 'conflict'],
    [503, 'BILLING_NOT_CONFIGURED', 'unavailable'],
    [400, 'BILLING_UNKNOWN_PLAN', 'request'],
  ])('classifies HTTP %s responses', async (status, code, kind) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ code }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }))

    await expect(fetchBillingPlans('billing-token')).rejects.toMatchObject({ kind, code, status })
  })

  it('classifies fetch failures while preserving aborts', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('offline'))
    await expect(fetchBillingPlans('billing-token')).rejects.toMatchObject({ kind: 'network' })

    const abort = new DOMException('aborted', 'AbortError')
    fetchMock.mockRejectedValueOnce(abort)
    await expect(fetchBillingPlans('billing-token')).rejects.toBe(abort)
  })

  it('rejects invalid success envelopes and non-JSON responses', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'OK' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'OK', data: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response('not-json', { status: 200 }))
      .mockResolvedValueOnce(new Response('not-json', { status: 503 }))

    await expect(fetchBillingPlans('billing-token')).rejects.toMatchObject({ kind: 'invalid_response' })
    await expect(fetchBillingPlans('billing-token')).rejects.toMatchObject({ kind: 'invalid_response' })
    await expect(fetchBillingPlans('billing-token')).rejects.toMatchObject({ kind: 'invalid_response', status: 200 })
    await expect(fetchBillingPlans('billing-token')).rejects.toMatchObject({ kind: 'unavailable', status: 503 })
  })

  it('prefers the explicit paid flag over the presence of prices', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK',
      data: {
        plans: [
          { code: 'trial', paid: false, prices: [{ interval: 'month', price_id: 'price_trial', price_cents: 100 }] },
          { code: 'team', paid: true },
        ],
      },
    }), { status: 200 }))

    const { plans } = await fetchBillingPlans('billing-token')

    expect(plans.map((plan) => [plan.code, plan.paid])).toEqual([['trial', false], ['team', true]])
  })

  it('filters malformed plans and applies safe metadata defaults', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { plans: [{}, { code: 'basic' }] },
    }), { status: 200 }))

    await expect(fetchBillingPlans('billing-token')).resolves.toEqual({
      billingEnabled: false,
      plans: [{
        code: 'basic', name: '', description: '', tagline: '', usageSummary: '', features: [], interval: '', highlight: false,
        paid: false, prices: [], sortOrder: 0, monthlyCredits: 0, priceCents: 0, currency: 'USD', currentPlan: false,
      }],
      currentSubscription: null,
    })
  })

  it('creates checkout with a selected plan and returns a secure URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { id: 'cs_123', url: 'https://checkout.stripe.com/c/pay/cs_123' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const url = await createBillingCheckoutSession('billing-token', 'pro', 'year')

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/web-checkout-session', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer billing-token',
        'Content-Type': 'application/json',
      }),
    body: JSON.stringify({ plan_code: 'pro', billing_interval: 'year' }),
    }))
    expect(url).toBe('https://checkout.stripe.com/c/pay/cs_123')
  })

  it('rejects checkout URLs that are not HTTPS', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { url: 'javascript:alert(1)' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await expect(createBillingCheckoutSession('billing-token', 'pro', 'month')).rejects.toEqual(
      expect.objectContaining({ kind: 'invalid_response' }),
    )
  })

  it('allows HTTP checkout only for local development', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { url: 'http://localhost:4242/checkout' },
    }), { status: 200 }))

    await expect(createBillingCheckoutSession('billing-token', 'pro', 'month')).resolves.toBe('http://localhost:4242/checkout')
  })

  it('rejects missing and malformed checkout URLs', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'OK', data: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'OK', data: { url: 'http://[' } }), { status: 200 }))

    await expect(createBillingCheckoutSession('billing-token', 'pro', 'month')).rejects.toMatchObject({ kind: 'invalid_response' })
    await expect(createBillingCheckoutSession('billing-token', 'pro', 'month')).rejects.toMatchObject({ kind: 'invalid_response' })
  })

  it('fails before making a request when the token is missing', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await expect(fetchBillingPlans('')).rejects.toEqual(new BillingApiError('missing_token'))
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('credit pack billing API', () => {
  it('loads, normalizes, and sorts credit packs with the balance summary', async () => {
    const fetchMock = mockJSON({
      code: 'OK',
      data: {
        billing_enabled: true,
        packs: [
          { code: 'pack_m', name: 'Medium', credits: 220000, valid_days: 365, sort_order: 1, highlight: true, available: true, price_cents: 1000, currency: 'usd' },
          { code: 'pack_s', name: 'Small', description: 'Occasional', credits: '100000', valid_days: 0, sort_order: 0, available: true, price_cents: 500, currency: 'usd' },
          { name: 'no code' },
        ],
        credits: {
          limit: 300000, used: 300000, remaining: 0, unlimited: false, total_remaining: 128400,
          addon: { balance: 220000, used_this_period: 91600, remaining: 128400, next_expiry: { credits: 100000, expires_at: '2027-03-01T00:00:00Z' } },
        },
      },
    })

    const result = await fetchCreditPacks('billing-token', { lang: 'zh-CN' })

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/credit-packs?lang=zh-CN', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer billing-token' }),
    }))
    expect(result.billingEnabled).toBe(true)
    expect(result.packs.map((pack) => pack.code)).toEqual(['pack_s', 'pack_m'])
    expect(result.packs[0]).toEqual({
      code: 'pack_s', name: 'Small', description: 'Occasional', credits: 100000, validDays: 0,
      sortOrder: 0, highlight: false, available: true, priceCents: 500, currency: 'USD',
    })
    expect(result.credits).toEqual({
      limit: 300000, used: 300000, remaining: 0, unlimited: false, totalRemaining: 128400,
      addon: { balance: 220000, usedThisPeriod: 91600, remaining: 128400, nextExpiry: { credits: 100000, expiresAt: '2027-03-01T00:00:00Z' } },
    })
  })

  it('tolerates a missing balance and omits the language query', async () => {
    const fetchMock = mockJSON({ code: 'OK', data: { billing_enabled: false, packs: [] } })

    const result = await fetchCreditPacks('billing-token')

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/credit-packs', expect.anything())
    expect(result.credits.addon.nextExpiry).toBeNull()
    expect(result.credits.remaining).toBe(0)
  })

  it('rejects a credit pack response without packs', async () => {
    mockJSON({ code: 'OK', data: { billing_enabled: true } })
    await expect(fetchCreditPacks('billing-token')).rejects.toMatchObject({ kind: 'invalid_response' })
  })

  it('creates a credit pack checkout with the pack code and request ID', async () => {
    const fetchMock = mockJSON({ code: 'OK', data: { id: 'cs_pack', url: 'https://checkout.stripe.com/c/pay/cs_pack' } })

    const session = await createCreditPackCheckoutSession('billing-token', 'pack_m', 'request-1')

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/web-credit-pack-checkout-session', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ pack_code: 'pack_m', request_id: 'request-1' }),
    }))
    expect(session).toEqual({ id: 'cs_pack', url: 'https://checkout.stripe.com/c/pay/cs_pack' })
  })

  it('rejects unsafe or missing credit pack checkout URLs', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ code: 'OK', data: { url: 'javascript:alert(1)' } }))
      .mockResolvedValueOnce(jsonResponse({ code: 'OK', data: { id: 'cs_1' } }))

    await expect(createCreditPackCheckoutSession('t', 'pack_s', 'r')).rejects.toMatchObject({ kind: 'invalid_response' })
    await expect(createCreditPackCheckoutSession('t', 'pack_s', 'r')).rejects.toMatchObject({ kind: 'invalid_response' })
  })

  it('maps rate limits, disabled billing, and expired requests to error kinds', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ code: 'CREDIT_PACK_RATE_LIMITED' }, 429))
      .mockResolvedValueOnce(jsonResponse({ code: 'BILLING_DISABLED' }, 503))
      .mockResolvedValueOnce(jsonResponse({ code: 'CREDIT_PACK_REQUEST_EXPIRED' }, 409))

    await expect(createCreditPackCheckoutSession('t', 'pack_s', 'r')).rejects.toMatchObject({ kind: 'rate_limited', status: 429 })
    await expect(createCreditPackCheckoutSession('t', 'pack_s', 'r')).rejects.toMatchObject({ kind: 'billing_disabled' })
    await expect(createCreditPackCheckoutSession('t', 'pack_s', 'r')).rejects.toMatchObject({
      kind: 'conflict', code: 'CREDIT_PACK_REQUEST_EXPIRED',
    })
  })

  it('pages through credit grants', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({
        code: 'OK',
        data: {
          items: [
            {
              id: 'grant-1', source: 'stripe', pack_code: 'pack_m', credits: 220000, remaining: 120000, amount_cents: 1000,
              currency: 'usd', stripe_checkout_session_id: 'cs_1', status: 'active',
              granted_at: '2026-10-01T00:00:00Z', expires_at: '2027-10-01T00:00:00Z',
            },
            { source: 'stripe' },
          ],
          next_cursor: 'grant-1',
        },
      }))
      .mockResolvedValueOnce(jsonResponse({ code: 'OK', data: {} }))

    const first = await fetchCreditGrants('billing-token')
    const second = await fetchCreditGrants('billing-token', { cursor: 'grant-1', limit: 5 })

    expect(fetchMock.mock.calls[0][0]).toBe('/api/v1/billing/credit-grants?limit=20')
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/billing/credit-grants?cursor=grant-1&limit=5')
    expect(first).toEqual({
      items: [{
        id: 'grant-1', source: 'stripe', packCode: 'pack_m', credits: 220000, remaining: 120000, amountCents: 1000,
        currency: 'USD', sessionId: 'cs_1', status: 'active', grantedAt: '2026-10-01T00:00:00Z', expiresAt: '2027-10-01T00:00:00Z',
      }],
      nextCursor: 'grant-1',
    })
    expect(second).toEqual({ items: [], nextCursor: '' })
  })

  it('rejects malformed grant pages', async () => {
    mockJSON({ code: 'OK', data: { items: 'nope' } })
    await expect(fetchCreditGrants('billing-token')).rejects.toMatchObject({ kind: 'invalid_response' })
  })

  it('reads checkout status and validates the value', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({ code: 'OK', data: { id: 'cs_1', status: 'granted' } }))
      .mockResolvedValueOnce(jsonResponse({ code: 'OK', data: { status: 'pending' } }))
      .mockResolvedValueOnce(jsonResponse({ code: 'OK', data: { status: 'unknown' } }))
      .mockResolvedValueOnce(jsonResponse({ code: 'AUTH_INVALID_TOKEN' }, 401))

    await expect(fetchCheckoutSessionStatus('t', 'cs_1')).resolves.toEqual({ id: 'cs_1', status: 'granted' })
    await expect(fetchCheckoutSessionStatus('t', 'cs/2')).resolves.toEqual({ id: 'cs/2', status: 'pending' })
    expect(fetchMock.mock.calls[1][0]).toBe('/api/v1/billing/checkout-sessions/cs%2F2/status')
    await expect(fetchCheckoutSessionStatus('t', 'cs_1')).rejects.toMatchObject({ kind: 'invalid_response' })
    await expect(fetchCheckoutSessionStatus('t', 'cs_1')).rejects.toMatchObject({ kind: 'expired_token' })
    await expect(fetchCheckoutSessionStatus('t', '')).rejects.toMatchObject({ kind: 'invalid_request' })
  })

  it('generates RFC 4122 version 4 request IDs with or without randomUUID', () => {
    const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

    expect(createRequestId({ randomUUID: () => 'native-id' })).toBe('native-id')
    expect(createRequestId({ getRandomValues: (bytes) => bytes.fill(255) })).toMatch(pattern)
    expect(createRequestId({})).toMatch(pattern)
    expect(createRequestId()).toMatch(pattern)
    expect(createRequestId({})).not.toBe(createRequestId({}))
  })
})

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function mockJSON(body, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(body, status))
}

function fakeStorage() {
  const values = new Map()
  return {
    getItem: vi.fn((key) => values.get(key) || null),
    setItem: vi.fn((key, value) => values.set(key, value)),
    removeItem: vi.fn((key) => values.delete(key)),
  }
}
