import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BillingApiError,
  clearBillingPageToken,
  createBillingCheckoutSession,
  fetchBillingPlans,
  parseBillingPageToken,
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
          code: 'pro', name: 'Pro', description: 'For daily use', interval: 'month',
          features: ['Fast transcription'], highlight: true, sort_order: 2,
          price_cents: 1200, currency: 'usd', current_plan: false,
        }],
        current_subscription: { plan_code: 'free', status: 'active' },
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const result = await fetchBillingPlans('billing-token')

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/plans', expect.objectContaining({
      headers: expect.objectContaining({ Authorization: 'Bearer billing-token' }),
    }))
    expect(result).toEqual({
      billingEnabled: true,
      plans: [{
        code: 'pro', name: 'Pro', description: 'For daily use', interval: 'month',
        features: ['Fast transcription'], highlight: true, sortOrder: 2,
        priceCents: 1200, currency: 'USD', currentPlan: false,
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

  it('filters malformed plans and applies safe metadata defaults', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { plans: [{}, { code: 'basic', features: null }] },
    }), { status: 200 }))

    await expect(fetchBillingPlans('billing-token')).resolves.toEqual({
      billingEnabled: false,
      plans: [{
        code: 'basic', name: '', description: '', interval: '', features: [], highlight: false,
        sortOrder: 0, priceCents: 0, currency: 'USD', currentPlan: false,
      }],
      currentSubscription: null,
    })
  })

  it('creates checkout with a selected plan and returns a secure URL', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { id: 'cs_123', url: 'https://checkout.stripe.com/c/pay/cs_123' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    const url = await createBillingCheckoutSession('billing-token', 'pro')

    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/web-checkout-session', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer billing-token',
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ plan_code: 'pro' }),
    }))
    expect(url).toBe('https://checkout.stripe.com/c/pay/cs_123')
  })

  it('rejects checkout URLs that are not HTTPS', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { url: 'javascript:alert(1)' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }))

    await expect(createBillingCheckoutSession('billing-token', 'pro')).rejects.toEqual(
      expect.objectContaining({ kind: 'invalid_response' }),
    )
  })

  it('allows HTTP checkout only for local development', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      code: 'OK', data: { url: 'http://localhost:4242/checkout' },
    }), { status: 200 }))

    await expect(createBillingCheckoutSession('billing-token', 'pro')).resolves.toBe('http://localhost:4242/checkout')
  })

  it('rejects missing and malformed checkout URLs', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'OK', data: {} }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: 'OK', data: { url: 'http://[' } }), { status: 200 }))

    await expect(createBillingCheckoutSession('billing-token', 'pro')).rejects.toMatchObject({ kind: 'invalid_response' })
    await expect(createBillingCheckoutSession('billing-token', 'pro')).rejects.toMatchObject({ kind: 'invalid_response' })
  })

  it('fails before making a request when the token is missing', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await expect(fetchBillingPlans('')).rejects.toEqual(new BillingApiError('missing_token'))
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
