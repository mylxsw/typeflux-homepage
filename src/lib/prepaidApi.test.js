import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPrepaidOrder, fetchPrepaidOrder, closePrepaidOrder, fetchPrepaidOrders, openBillingManagement, fetchBillingPlans } from './billingApi'
afterEach(() => vi.restoreAllMocks())
const order = { id: 'one', amount_fen: 1900, currency: 'CNY', status: 'pending', fulfillment: 'pending', action: 'qr_code', pay_url: 'weixin://wxpay/one' }
function reply(data) { return new Response(JSON.stringify({ code: 'OK', data }), { status: 200 }) }
describe('prepaid API contract', () => {
  it('sends server-selected product inputs and keeps QR content separate from redirect URLs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => reply(order))
    const purchase = { plan_code: 'pro', billing_interval: 'quarter', channel: 'wechat_native', request_id: 'request-one' }
    expect(await createPrepaidOrder('token', purchase)).toEqual(order)
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/billing/prepaid-orders', expect.objectContaining({ method: 'POST', body: JSON.stringify(purchase) }))
    await fetchPrepaidOrder('token', 'order/one'); expect(fetchMock.mock.calls[1][0]).toContain('order%2Fone')
    await closePrepaidOrder('token', 'order/one'); expect(fetchMock.mock.calls[2][0]).toContain('order%2Fone/close')
  })
  it.each([{ ...order, status: 'unknown' }, { ...order, fulfillment: 'unknown' }, { ...order, amount_fen: -1 }, { ...order, currency: 'USD' }, { ...order, pay_url: 'javascript:alert(1)' }, { ...order, pay_url: 'invalid' }, { ...order, action: 'redirect', pay_url: 'http://payments.example/' }])('rejects invalid or unsafe order facts', async (data) => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply(data)); await expect(fetchPrepaidOrder('token', 'one')).rejects.toMatchObject({ kind: 'invalid_response' })
  })
  it('validates lists and management URLs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(reply({ items: [order] })).mockResolvedValueOnce(reply({ items: null })).mockResolvedValueOnce(reply({ url: 'https://billing.stripe.com/portal' })).mockResolvedValueOnce(reply({}))
    expect(await fetchPrepaidOrders('token')).toEqual([order]); await expect(fetchPrepaidOrders('token')).rejects.toMatchObject({ kind: 'invalid_response' })
    expect(await openBillingManagement('token')).toBe('https://billing.stripe.com/portal'); await expect(openBillingManagement('token')).rejects.toMatchObject({ kind: 'invalid_response' }); expect(fetchMock).toHaveBeenCalledTimes(4)
  })
  it('retains prepaid CNY prices without manufacturing Stripe price IDs', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(reply({ billing_enabled: true, plans: [{ code: 'pro', prices: [{ provider: 'aidea', interval: 'quarter', price_cents: 4900, currency: 'CNY', channels: ['wechat_native', 'invalid'] }] }] }))
    const result = await fetchBillingPlans('token'); expect(result.plans[0].prices[0]).toMatchObject({ provider: 'aidea', priceId: '', interval: 'quarter', priceCents: 4900, channels: ['wechat_native'] })
  })
})
