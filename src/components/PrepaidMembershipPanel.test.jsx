// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n/index.jsx'
import PrepaidMembershipPanel from './PrepaidMembershipPanel'
import { prepaidMembershipCopy, prepaidMessage } from './prepaidMembershipCopy'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.React = React
let root, container
const price = (interval, amount, channels) => ({ provider: 'aidea', interval, currency: 'CNY', priceCents: amount, channels })
const plans = [
  { code: 'free', name: 'Free', monthlyCredits: 4500, monthlyCreditsLabel: '4,500 credits', currentPlan: true, prices: [] },
  { code: 'pro', name: 'Pro', monthlyCredits: 90000, highlight: true, features: ['Cloud dictation', 'AI rewriting'], prices: [price('month', 1900), price('quarter', 4900), price('year', 16900)] },
  { code: 'premium', name: 'Premium', monthlyCredits: 500000, prices: [price('month', 3900)] },
]
const pending = { id: 'order-one', plan_code: 'pro', billing_interval: 'month', channel: 'wechat_native', amount_fen: 1900, currency: 'CNY', status: 'pending', fulfillment: 'pending', action: 'qr_code', pay_url: 'weixin://wxpay/one' }
beforeEach(() => {
  sessionStorage.clear(); localStorage.clear()
  window.history.replaceState({}, '', '/billing/plans')
  container = document.createElement('div'); document.body.appendChild(container)
})
afterEach(() => {
  if (root) act(() => root.unmount())
  root = null; container.remove(); vi.useRealTimers(); vi.restoreAllMocks()
})
function defaults(props = {}) {
  return { token: 'page-token', plans, listOrders: vi.fn().mockResolvedValue([]), getOrder: vi.fn().mockResolvedValue(pending), createOrder: vi.fn().mockResolvedValue(pending), closeOrder: vi.fn().mockResolvedValue({ ...pending, status: 'closed' }), pollInterval: 100000, ...props }
}
async function render(props) {
  if (props.lang) window.history.replaceState({}, '', '/' + props.lang + '/billing/plans')
  await act(async () => { root = createRoot(container); root.render(<I18nProvider><PrepaidMembershipPanel {...props} /></I18nProvider>) })
}
const button = (text) => [...document.body.querySelectorAll('button,input[type=radio]')].find((node) => node.getAttribute('aria-label') === text || node.textContent === text)
const dialog = () => document.querySelector('[role="dialog"]')
async function click(text) { const node = button(text); expect(node, 'Missing button: ' + text).toBeDefined(); await act(async () => { node.focus(); node.click() }) }
async function purchase() { await click('Choose Pro'); await click('Confirm and pay') }
function remember(order = pending) {
  sessionStorage.setItem('typeflux.prepaidIntent', JSON.stringify({ request_id: 'request-one', order_id: order.id, plan_code: order.plan_code, billing_interval: order.billing_interval, channel: order.channel }))
}

describe('prepaid checkout', () => {
  it.each(['stripe', 'alipay_page', 'wechat_native'])('confirms %s membership with its actual price and renewal policy', async (method) => {
    const stripeCheckout = vi.fn().mockResolvedValue(undefined)
    const createOrder = vi.fn().mockResolvedValue(pending)
    const mixedPlans = plans.map((plan) => plan.code === 'pro' ? { ...plan, prices: [...plan.prices,
      { provider: 'stripe', interval: 'month', priceCents: 500, currency: 'USD' },
      { provider: 'stripe', interval: 'year', priceCents: 5000, currency: 'USD' },
    ] } : plan)
    await render(defaults({ plans: mixedPlans, stripeCheckout, createOrder }))
    expect(container.querySelector('fieldset')).toBeNull()
    await click('Subscribe Monthly')
    await click(method === 'stripe' ? 'Stripe' : method === 'alipay_page' ? 'Alipay' : 'WeChat Pay')
    const term = method === 'stripe' ? 'One year' : 'Three months'
    await act(async () => dialog().querySelector(`button[aria-label="${term}"]`).click())
    expect(dialog().textContent).toContain(method === 'stripe' ? '$50.00' : 'CN¥49.00')
    expect(dialog().textContent).toContain(method === 'stripe' ? 'Renews automatically' : 'No automatic renewal')
    expect(stripeCheckout).not.toHaveBeenCalled()
    expect(createOrder).not.toHaveBeenCalled()
    await click('Confirm and pay')
    if (method === 'stripe') {
      expect(stripeCheckout).toHaveBeenCalledWith('pro', 'year')
      expect(createOrder).not.toHaveBeenCalled()
    } else {
      expect(createOrder).toHaveBeenCalledWith('page-token', expect.objectContaining({ plan_code: 'pro', billing_interval: 'quarter', channel: method }), expect.any(Object))
      expect(stripeCheckout).not.toHaveBeenCalled()
    }
  })
  it.each([true, false])('rechecks Stripe eligibility against a restored prepaid receipt (expired: %s)', async (expired) => {
    const stripeCheckout = vi.fn()
    const mixedPlans = [{ ...plans[1], prices: [...plans[1].prices, { provider: 'stripe', interval: 'month', priceCents: 500, currency: 'USD' }] }]
    remember()
    await render(defaults({ plans: mixedPlans, stripeCheckout, getOrder: vi.fn().mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'granted', period_end: expired ? '2020-01-01T00:00:00Z' : '2099-01-01T00:00:00Z' }) }))
    await click('Back to plans'); await click(expired ? 'Choose Pro' : 'Renew Pro'); await click('Stripe')
    expect(button('Confirm and pay').disabled).toBe(!expired)
    expect(stripeCheckout).not.toHaveBeenCalled()
  })
  it('locks payment choices during a Stripe request and displays a recoverable failure', async () => {
    let reject
    const stripeCheckout = vi.fn().mockImplementation(() => new Promise((_, fail) => { reject = fail }))
    const mixedPlans = [{ ...plans[1], prices: [...plans[1].prices, { provider: 'stripe', interval: 'month', priceCents: 500, currency: 'USD' }] }]
    await render(defaults({ plans: mixedPlans, stripeCheckout }))
    await click('Subscribe Monthly'); await click('Confirm and pay')
    expect(button('Alipay').disabled).toBe(true)
    await click('Processing…')
    expect(stripeCheckout).toHaveBeenCalledTimes(1)
    await act(async () => reject(new Error('offline')))
    expect(dialog().textContent).toContain('payment result is unavailable')
    expect(button('Confirm and pay').disabled).toBe(false)
  })
  it('explains prepaid membership restrictions before allowing a Stripe subscription', async () => {
    const stripeCheckout = vi.fn()
    const mixedPlans = [{ ...plans[1], prices: [...plans[1].prices, { provider: 'stripe', interval: 'month', priceCents: 500, currency: 'USD' }] }]
    await render(defaults({ plans: mixedPlans, stripeCheckout, subscription: { paid: true, active: true, billing_mode: 'prepaid', plan_code: 'pro' } }))
    await click('Renew Pro'); await click('Stripe')
    expect(button('Confirm and pay').disabled).toBe(true)
    expect(dialog().textContent).toContain('prepaid membership must end')
    expect(stripeCheckout).not.toHaveBeenCalled()
    await click('Close payment window'); await click('Subscribe Monthly'); await click('Alipay')
    expect(button('Renew and pay').disabled).toBe(false)
  })
  it('keeps active Stripe subscription protection when switching payment inside the order', async () => {
    const stripeCheckout = vi.fn()
    const mixedPlans = [{ ...plans[2], prices: [...plans[2].prices, { provider: 'stripe', interval: 'month', priceCents: 999, currency: 'USD' }] }]
    const props = defaults({ plans: mixedPlans, stripeCheckout, subscription: { paid: true, active: true, billing_mode: 'subscription', plan_code: 'pro' } })
    await render(props); await click('Subscribe Monthly'); await click('WeChat Pay')
    expect(button('Confirm and pay').disabled).toBe(true)
    expect(dialog().textContent).toContain('card subscription is still active')
    expect(props.createOrder).not.toHaveBeenCalled()
    await click('Stripe')
    expect(button('Confirm and pay').disabled).toBe(false)
  })

  it('describes unlimited allowance without exposing the internal negative balance', async () => {
    await render(defaults({ credits: { limit: -1, remaining: -1, unlimited: true }, plans: [{ ...plans[1], monthlyCredits: -1 }] }))
    expect(container.textContent).toContain('Unlimited credits this month')
    expect(container.textContent).not.toContain('-1')
    await click('Choose Pro')
    expect(dialog().textContent).toContain('Unlimited cloud credits / month')
  })
  it('limits confirmation to the purchase, amount, policy and next action', async () => {
    const props = defaults(); await render(props); await click('Three months'); await click('Choose Pro')
    const content = dialog().textContent
    expect(content).toContain('CN¥49.00')
    expect(content).toContain('90,000 cloud credits / month')
    expect(content.split('Three months')).toHaveLength(2)
    expect(content.split('No automatic renewal.')).toHaveLength(2)
    expect(content).not.toContain('TYPEFLUX CLOUD')
    expect(content).not.toContain('Card details')
    expect(content).not.toContain('Order number')
    expect(props.createOrder).not.toHaveBeenCalled()
  })
  it('keeps order references folded during payment and gives a useful paid action', async () => {
    await render(defaults()); await purchase()
    const details = dialog().querySelector('details')
    expect(details.open).toBe(false)
    expect(details.textContent).toContain(pending.id)
    expect(button('I have paid')).toBeDefined()
    await act(async () => details.querySelector('summary').click())
    expect(details.open).toBe(true)
    expect(details.textContent).toContain('WeChat Pay')
  })
  it('shows support details only when the payment needs checking', async () => {
    await render(defaults({ createOrder: vi.fn().mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'review' }) })); await purchase()
    expect(dialog().querySelector('details').open).toBe(true)
    expect(dialog().textContent).toContain('Feedback in Typeflux')
    expect(dialog().textContent).toContain(pending.id)
    expect(button('Confirm and pay')).toBeUndefined()
    expect(dialog().querySelector('a').getAttribute('href')).toBe('typeflux://billing/return')
  })
  it('finishes with an app return and one expiry instead of prompting another purchase', async () => {
    await render(defaults({ createOrder: vi.fn().mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'granted', period_end: '2027-01-01T00:00:00Z' }) })); await purchase()
    expect(dialog().textContent.split('Valid until')).toHaveLength(2)
    expect(dialog().textContent).toContain('Order total')
    expect(dialog().textContent).not.toContain('Total due')
    expect(dialog().textContent).not.toContain('No automatic renewal.')
    expect(button('Start another purchase')).toBeUndefined()
    expect(dialog().querySelector('a').textContent).toBe('Return to Typeflux')
    expect(dialog().querySelector('a').getAttribute('href')).toBe('typeflux://billing/return')
    await click('Back to plans')
    expect(button('Renew Pro').disabled).toBe(false)
  })
  it('shares plan cards, quotas and features, and confirms the term total before charging', async () => {
    const props = defaults(); await render(props)
    expect(container.querySelectorAll('article')).toHaveLength(3)
    expect(container.querySelector('select')).toBeNull()
    expect(container.textContent).toContain('Cloud dictation')
    expect(container.textContent).toContain('90,000 credits')
    await click('Three months')
    expect(container.querySelector('#plan-pro').textContent).toContain('CN¥49/ Three months')
    expect(container.querySelector('#plan-premium').textContent).toContain('Not available for this term')
    expect(button('Choose Premium').disabled).toBe(true)
    await click('Choose Pro')
    expect(dialog().textContent).toContain('Three months')
    expect(dialog().textContent).toContain('CN¥49.00')
    expect(props.createOrder).not.toHaveBeenCalled()
    await click('Confirm and pay')
    expect(props.createOrder).toHaveBeenCalledWith('page-token', expect.objectContaining({ billing_interval: 'quarter', request_id: expect.any(String) }), expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })
  it('shows an exact one-cent annual total rather than rounding it to free', async () => {
    await render(defaults({ plans: [{ ...plans[1], prices: [price('year', 1)] }] }))
    expect(container.textContent).toContain('CN¥0.01/ One year')
    await click('Choose Pro'); expect(dialog().textContent).toContain('CN¥0.01')
  })
  it('renders WeChat QR only after confirmation and saves no payment URL', async () => {
    const props = defaults({ createOrder: vi.fn(async (_token, intent) => {
      expect(JSON.parse(sessionStorage.getItem('typeflux.prepaidIntent')).request_id).toBe(intent.request_id)
      return pending
    }) })
    await render(props); await purchase()
    expect(dialog().querySelector('svg')).not.toBeNull()
    expect(dialog().querySelector('a')).toBeNull()
    expect(dialog().textContent).toContain('Scan to pay with WeChat')
    expect(sessionStorage.getItem('typeflux.prepaidIntent')).not.toContain('weixin://')
    expect(dialog().textContent).not.toContain('Membership activated')
  })
  it('opens Alipay separately and keeps this page waiting', async () => {
    const order = { ...pending, channel: 'alipay_page', action: 'redirect', pay_url: 'https://payments.example/one' }
    const createOrder = vi.fn().mockResolvedValue(order)
    await render(defaults({ lang: 'zh-CN', createOrder }))
    await click('选择 Pro'); await click('支付宝'); await click('确认并付款')
    expect(createOrder.mock.calls[0][1].channel).toBe('alipay_page')
    const link = dialog().querySelector('a')
    expect(link.href).toBe(order.pay_url); expect(link.target).toBe('_blank'); expect(link.rel).toContain('noopener')
    expect(dialog().textContent).not.toContain('会员权益已开通')
  })
  it('respects price-specific payment channels', async () => {
    const createOrder = vi.fn().mockResolvedValue({ ...pending, channel: 'alipay_page' })
    await render(defaults({ createOrder, plans: [{ ...plans[1], prices: [price('month', 1900, ['alipay_page'])] }] }))
    await click('Choose Pro')
    expect(button('WeChat Pay')).toBeUndefined()
    expect(button('Alipay').checked).toBe(true)
    await click('Confirm and pay'); expect(createOrder.mock.calls[0][1].channel).toBe('alipay_page')
  })
  it('reuses a lost-response request ID and clears its error after recovery', async () => {
    const createOrder = vi.fn().mockRejectedValueOnce(new Error('network')).mockResolvedValue(pending)
    await render(defaults({ createOrder })); await purchase()
    const first = createOrder.mock.calls[0][1].request_id
    expect(dialog().textContent).toContain('payment result is unavailable')
    expect(button('Alipay').disabled).toBe(true)
    await click('Close payment window')
    expect(button('Three months').disabled).toBe(true)
    await click('Choose Premium')
    expect(dialog().querySelector('h2').textContent).toBe('Pro')
    await click('Confirm and pay')
    expect(createOrder.mock.calls[1][1].request_id).toBe(first)
    expect(dialog().querySelector('[role="alert"]')).toBeNull()
  })
  it('restores an owned order and distinguishes payment from entitlement activation', async () => {
    remember()
    const props = defaults({ getOrder: vi.fn().mockResolvedValueOnce(pending).mockResolvedValueOnce({ ...pending, status: 'paid', pay_url: '' }).mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'granted', period_end: '2027-01-01T00:00:00Z' }) })
    await render(props)
    expect(props.getOrder).toHaveBeenCalledWith('page-token', pending.id, expect.any(Object))
    await click('I have paid')
    expect(dialog().textContent).toContain('Payment received')
    expect(dialog().textContent).not.toContain('Membership activated')
    expect(dialog().querySelector('svg')).toBeNull(); expect(button('Cancel order')).toBeUndefined()
    await click('Check membership')
    expect(dialog().textContent).toContain('Membership activated')
    expect(dialog().textContent).toContain('Valid until')
    await click('Back to plans')
    expect(dialog()).toBeNull()
    expect(button('Renew Pro').disabled).toBe(false); expect(button('Choose Premium').disabled).toBe(true)
    await click('Renew Pro'); expect(button('Renew and pay')).toBeDefined()
  })
  it('recovers pending orders from server history', async () => {
    const props = defaults({ listOrders: vi.fn().mockResolvedValue([{ ...pending, pay_url: '' }]) }); await render(props)
    expect(props.getOrder).toHaveBeenCalledWith('page-token', pending.id, expect.any(Object))
    expect(dialog().querySelector('svg')).not.toBeNull()
  })
  it('recovers manual review orders without offering another charge', async () => {
    const review = { ...pending, status: 'paid', fulfillment: 'review' }
    await render(defaults({ listOrders: vi.fn().mockResolvedValue([review]), getOrder: vi.fn().mockResolvedValue(review) }))
    expect(dialog().textContent).toContain('needs checking')
    expect(dialog().querySelector('a').getAttribute('href')).toBe('typeflux://billing/return'); expect(dialog().querySelector('svg')).toBeNull()
    await click('Close payment window'); expect(button('Choose Pro').disabled).toBe(true)
  })
  it('shows recovery failures and blocks charging until recovery succeeds', async () => {
    const props = defaults({ listOrders: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]) })
    await render(props)
    expect(container.querySelector('[role="alert"]')).not.toBeNull(); expect(button('Choose Pro').disabled).toBe(true)
    await click('Try again')
    expect(button('Choose Pro').disabled).toBe(false); expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(props.createOrder).not.toHaveBeenCalled()
  })
  it('resumes the same payment after closing its window', async () => {
    const props = defaults(); await render(props); await purchase(); await click('Close payment window')
    expect(dialog()).toBeNull(); expect(props.closeOrder).not.toHaveBeenCalled()
    await click('Continue payment')
    expect(dialog().querySelector('svg')).not.toBeNull(); expect(props.createOrder).toHaveBeenCalledTimes(1)
  })
  it('traps keyboard focus, supports Escape and restores page focus and scrolling', async () => {
    await render(defaults()); await click('Choose Pro')
    expect(document.activeElement).toBe(button('Close payment window'))
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })))
    expect(document.activeElement).toBe(button('Confirm and pay'))
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })))
    expect(document.activeElement).toBe(button('Close payment window')); expect(document.body.style.overflow).toBe('hidden')
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(dialog()).toBeNull(); expect(document.activeElement).toBe(button('Choose Pro')); expect(document.body.style.overflow).toBe('')
  })
  it('closes from the backdrop while keeping clicks inside open', async () => {
    await render(defaults()); await click('Choose Pro')
    await act(async () => dialog().click()); expect(dialog()).not.toBeNull()
    await act(async () => dialog().parentElement.click()); expect(dialog()).toBeNull()
  })
  it('bounds automatic polling and permits manually checking again', async () => {
    vi.useFakeTimers()
    const props = defaults({ pollInterval: 100, maxPolls: 2 }); await render(props); await purchase()
    await act(async () => vi.advanceTimersByTimeAsync(300))
    expect(props.getOrder).toHaveBeenCalledTimes(2); expect(dialog().textContent).toContain('Already paid?')
    await click('I have paid')
    expect(props.getOrder).toHaveBeenCalledTimes(3); expect(dialog().textContent).not.toContain('Already paid?')
    await act(async () => vi.advanceTimersByTimeAsync(100)); expect(props.getOrder).toHaveBeenCalledTimes(4)
  })
  it('stops polling after rights are granted', async () => {
    vi.useFakeTimers()
    const getOrder = vi.fn().mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'granted' })
    await render(defaults({ getOrder, pollInterval: 100 })); await purchase()
    await act(async () => vi.advanceTimersByTimeAsync(100))
    expect(dialog().textContent).toContain('Membership activated')
    await act(async () => vi.advanceTimersByTimeAsync(1000)); expect(getOrder).toHaveBeenCalledTimes(1)
  })
  it('shows preparation for an order without a ready payment link', async () => {
    await render(defaults({ createOrder: vi.fn().mockResolvedValue({ ...pending, status: 'creating', pay_url: '' }) }))
    await purchase(); expect(dialog().textContent).toContain('Preparing your payment'); expect(dialog().querySelector('svg')).toBeNull()
  })
  it('closes an unpaid order and clears the intent when returning to choose a plan', async () => {
    await render(defaults()); await purchase(); await click('Cancel order')
    expect(dialog().textContent).toContain('Order closed'); expect(dialog().querySelector('svg')).toBeNull()
    expect(sessionStorage.getItem('typeflux.prepaidIntent')).not.toBeNull()
    await click('Back to plans'); expect(sessionStorage.getItem('typeflux.prepaidIntent')).toBeNull()
  })
  it('allows choosing a new plan directly after an explicitly closed order', async () => {
    const props = defaults()
    await render(props); await purchase(); await click('Cancel order'); await click('Back to plans')
    await click('Choose Premium')
    expect(dialog().querySelector('h2').textContent).toBe('Premium')
    expect(dialog().querySelector('svg')).toBeNull()
    expect(sessionStorage.getItem('typeflux.prepaidIntent')).toBeNull()
    await click('Confirm and pay')
    expect(props.createOrder.mock.calls[1][1].plan_code).toBe('premium')
  })
  it('shows refunded orders without stale payment links', async () => {
    await render(defaults({ createOrder: vi.fn().mockResolvedValue({ ...pending, status: 'paid', fulfillment: 'refunded' }) }))
    await purchase(); expect(dialog().textContent).toContain('Refund recorded'); expect(dialog().querySelector('svg')).toBeNull()
  })
  it('blocks cross-provider purchases and opens existing subscription management', async () => {
    const manage = vi.fn().mockResolvedValue('https://billing.example/manage'), redirect = vi.fn()
    const props = defaults({ subscription: { paid: true, active: true, billing_mode: 'subscription', plan_code: 'pro' }, manage, redirect })
    await render(props)
    expect(button('Choose Pro').disabled).toBe(true); expect(container.textContent).toContain('card subscription is still active')
    await click('Manage subscription')
    expect(manage).toHaveBeenCalledWith('page-token', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(redirect).toHaveBeenCalledWith('https://billing.example/manage'); expect(props.createOrder).not.toHaveBeenCalled()
  })
  it('expires authorization without retaining a QR or offering another purchase', async () => {
    remember(); sessionStorage.setItem('typeflux.billingPageToken', 'page-token')
    const props = defaults({ getOrder: vi.fn().mockResolvedValueOnce(pending).mockRejectedValue({ kind: 'expired_token' }) })
    await render(props); await click('I have paid')
    expect(dialog().textContent).toContain('page has expired')
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBeNull(); expect(dialog().querySelector('svg')).toBeNull()
    expect(button('I have paid').disabled).toBe(true); expect(props.createOrder).not.toHaveBeenCalled()
  })
  it('clears an inaccessible account intent without exposing its payment link', async () => {
    remember(); await render(defaults({ getOrder: vi.fn().mockRejectedValue({ status: 404 }) }))
    expect(sessionStorage.getItem('typeflux.prepaidIntent')).toBeNull(); expect(dialog()).toBeNull(); expect(button('Choose Pro').disabled).toBe(false)
  })
  it('cancels recovery on unmount', async () => {
    let signal
    const listOrders = vi.fn((_token, options) => { signal = options.signal; return new Promise(() => {}) })
    await render(defaults({ listOrders })); act(() => root.unmount()); root = null; expect(signal.aborted).toBe(true)
  })
  it('aborts payment creation and unlocks scrolling on unmount', async () => {
    let signal
    const createOrder = vi.fn((_token, _intent, options) => { signal = options.signal; return new Promise(() => {}) })
    await render(defaults({ createOrder })); await purchase()
    expect(button('Processing…').disabled).toBe(true)
    act(() => root.unmount()); root = null; expect(signal.aborted).toBe(true); expect(document.body.style.overflow).toBe('')
  })
  it('preserves membership details when sales are disabled', async () => {
    await render(defaults({ billingEnabled: false, subscription: { billing_mode: 'prepaid', paid: true, active: true, plan_code: 'pro', current_period_end: '2027-01-01T00:00:00Z' } }))
    expect(button('Renew Pro').disabled).toBe(true)
    expect(container.textContent).toContain('existing membership stays valid'); expect(container.textContent).toContain('Valid until')
  })
  it('does not invent prices when there are no configured offers', async () => {
    await render(defaults({ plans: [plans[0]] }))
    expect(container.textContent).toContain('New purchases are unavailable'); expect(button('Choose Pro')).toBeUndefined()
  })
  it.each(['en', 'zh-CN', 'zh-TW', 'ja', 'ko'])('localizes one-time payment policies in %s', async (lang) => {
    await render(defaults({ lang })); const copy = prepaidMembershipCopy(lang)
    expect(container.textContent).toContain(copy.singlePayment)
    await click(prepaidMessage(copy.choosePlan, { plan: 'Pro' }))
    expect(dialog().textContent).toContain(copy.method); expect(dialog().textContent).toContain(copy.singlePayment)
    expect(button(copy.confirm)).toBeDefined()
    expect(dialog().textContent).toContain(copy.wechatMobileHint)
  })
  it('uses English copy for unsupported locales', () => {
    expect(prepaidMembershipCopy('fr')).toBe(prepaidMembershipCopy('en'))
  })
})
