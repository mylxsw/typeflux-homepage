// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PrepaidMembershipPanel from './PrepaidMembershipPanel'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.React = React
let root, container
const price = (interval, amount) => ({ provider: 'aidea', interval, currency: 'CNY', priceCents: amount })
const plans = [{ code: 'pro', name: 'Pro', prices: [price('month', 1900), price('quarter', 4900), price('year', 16900)] }, { code: 'premium', name: 'Premium', prices: [price('month', 3900)] }]
const pending = { id: 'order-one', plan_code: 'pro', billing_interval: 'month', channel: 'wechat_native', amount_fen: 1900, currency: 'CNY', status: 'pending', fulfillment: 'pending', action: 'qr_code', pay_url: 'weixin://wxpay/one' }

beforeEach(() => { sessionStorage.clear(); container = document.createElement('div'); document.body.appendChild(container) })
afterEach(() => { if (root) act(() => root.unmount()); root = null; container.remove(); vi.restoreAllMocks() })
function defaults(props = {}) { return { token: 'page-token', plans, listOrders: vi.fn().mockResolvedValue([]), getOrder: vi.fn().mockResolvedValue(pending), createOrder: vi.fn().mockResolvedValue(pending), closeOrder: vi.fn().mockResolvedValue({ ...pending, status: 'closed' }), pollInterval: 100000, ...props } }
async function render(props) { await act(async () => { root = createRoot(container); root.render(<PrepaidMembershipPanel {...props} />) }) }
const button = (text) => [...container.querySelectorAll('button')].find((node) => node.textContent === text)
async function click(text) { await act(async () => button(text).click()) }
async function select(index, value) { await act(async () => { const node = container.querySelectorAll('select')[index]; node.value = value; node.dispatchEvent(new Event('change', { bubbles: true })) }) }

describe('prepaid membership', () => {
  it('offers three calendar terms and renders a local WeChat QR code without navigating', async () => {
    const props = defaults(); await render(props)
    expect(container.textContent).toContain('No automatic renewal')
    expect([...container.querySelectorAll('select')[1].options].map((item) => item.value)).toEqual(['month', 'quarter', 'year'])
    await select(1, 'quarter'); await click('Confirm and pay')
    expect(props.createOrder).toHaveBeenCalledWith('page-token', expect.objectContaining({ billing_interval: 'quarter', request_id: expect.any(String) }), expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('a')).toBeNull()
    expect(container.textContent).toContain('Please do not pay twice')
    expect(sessionStorage.getItem('typeflux.prepaidIntent')).not.toContain('weixin://')
  })

  it('opens Alipay in a separate window and keeps the result page', async () => {
    const order = { ...pending, channel: 'alipay_page', action: 'redirect', pay_url: 'https://payments.example/one' }
    await render(defaults({ lang: 'zh-CN', createOrder: vi.fn().mockResolvedValue(order) }))
    await select(2, 'alipay_page'); await click('确认并付款')
    const link = container.querySelector('a'); expect(link.href).toBe(order.pay_url); expect(link.target).toBe('_blank'); expect(link.rel).toContain('noopener')
    expect(container.textContent).not.toContain('会员权益已开通')
  })

  it('reuses the same request ID after a lost response', async () => {
    const createOrder = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(pending)
    await render(defaults({ createOrder })); await click('Confirm and pay'); const first = createOrder.mock.calls[0][1].request_id
    expect(container.textContent).toContain('Retry the same order')
    await click('Confirm and pay'); expect(createOrder.mock.calls[1][1].request_id).toBe(first)
  })

  it('restores an owned order from storage and waits for entitlement grant', async () => {
    sessionStorage.setItem('typeflux.prepaidIntent', JSON.stringify({ request_id: 'request-one', order_id: pending.id, plan_code: 'pro', billing_interval: 'month', channel: 'wechat_native' }))
    const props = defaults({ getOrder: vi.fn().mockResolvedValueOnce(pending).mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'granted', period_end: '2027-01-01T00:00:00Z' }) })
    await render(props); expect(props.getOrder).toHaveBeenCalledWith('page-token', pending.id, expect.any(Object))
    await click('Check again'); expect(container.textContent).toContain('Membership activated'); expect(container.textContent).toContain('Valid until'); expect(container.querySelector('svg')).toBeNull()
    await click('Start another purchase'); expect(button('Renew and pay')).not.toBeNull()
    await select(0, 'premium'); expect(button('Renew and pay').disabled).toBe(true)
  })

  it('recovers a pending purchase from server history on another browser session', async () => {
    const props = defaults({ listOrders: vi.fn().mockResolvedValue([{ ...pending, pay_url: '' }]) }); await render(props)
    expect(props.getOrder).toHaveBeenCalledWith('page-token', pending.id, expect.any(Object)); expect(container.querySelector('svg')).not.toBeNull()
  })

  it('stops polling once rights are granted', async () => {
    const getOrder = vi.fn().mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'granted' })
    await render(defaults({ getOrder, pollInterval: 1, maxPolls: 2 })); await click('Confirm and pay')
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)) })
    expect(container.textContent).toContain('Membership activated'); const count = getOrder.mock.calls.length
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 10)) }); expect(getOrder).toHaveBeenCalledTimes(count)
  })

  it('closes unpaid orders and starts a new intent only after an explicit new purchase', async () => {
    await render(defaults()); await click('Confirm and pay'); await click('Close unpaid order')
    expect(container.textContent).toContain('Order closed'); await click('Start another purchase'); expect(sessionStorage.getItem('typeflux.prepaidIntent')).toBeNull()
  })

  it('shows manual review and refund states without offering another charge', async () => {
    await render(defaults({ createOrder: vi.fn().mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'review' }) }))
    await click('Confirm and pay'); expect(container.textContent).toContain('needs review'); expect(button('Start another purchase')).toBeUndefined()
  })

  it('blocks cross-provider and mid-term plan switches', async () => {
    await render(defaults({ subscription: { paid: true, active: true, billing_mode: 'subscription', plan_code: 'pro' } }))
    expect(button('Confirm and pay').disabled).toBe(true); expect(container.textContent).toContain('Cancel automatic renewal first')
  })

  it('expires authorization without creating a replacement purchase', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'page-token')
    const createOrder = vi.fn().mockRejectedValue({ kind: 'expired_token' }); await render(defaults({ createOrder }))
    await click('Confirm and pay'); expect(container.textContent).toContain('authorization has expired'); expect(sessionStorage.getItem('typeflux.billingPageToken')).toBeNull(); expect(button('Confirm and pay').disabled).toBe(true)
  })

  it('clears a stale intent from another account without using its payment URL', async () => {
    sessionStorage.setItem('typeflux.prepaidIntent', JSON.stringify({ request_id: 'old', plan_code: 'pro', billing_interval: 'month', channel: 'wechat_native' }))
    await render(defaults({ getOrder: vi.fn().mockRejectedValue({ status: 404 }) })); expect(sessionStorage.getItem('typeflux.prepaidIntent')).toBeNull(); expect(container.querySelector('svg')).toBeNull()
  })

  it('cancels recovery on unmount', async () => {
    let signal; const listOrders = vi.fn((_token, options) => { signal = options.signal; return new Promise(() => {}) })
    await render(defaults({ listOrders })); act(() => root.unmount()); root = null; expect(signal.aborted).toBe(true)
  })

  it('keeps existing membership visible when new purchases are disabled', async () => {
    await render(defaults({ billingEnabled: false, subscription: { billing_mode: 'prepaid', paid: true, active: true, plan_code: 'pro', current_period_end: '2027-01-01T00:00:00Z' } }))
    expect(button('Renew and pay').disabled).toBe(true)
    expect(container.textContent).toContain('Existing membership remains valid')
    expect(container.textContent).toContain('Valid until')
  })
})
