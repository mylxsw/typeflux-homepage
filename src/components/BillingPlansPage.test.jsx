// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n/index.jsx'
import BillingPlansPage from './BillingPlansPage'
import { PREPAID_INTENT_STORAGE_KEY } from './billing/usePrepaidOrder'
import { CREDIT_PACK_SELECTION_STORAGE_KEY } from './billing/useStripeCheckout'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.React = React

let root
let container

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState({}, '', '/billing/plans#t=billing-token')
  window.scrollTo = vi.fn()
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  if (root) {
    act(() => root.unmount())
    root = undefined
  }
  container.remove()
  vi.restoreAllMocks()
})

const cny = (interval, priceCents) => ({ provider: 'aidea', billingMode: 'prepaid', interval, priceCents, currency: 'CNY', channels: ['alipay_page', 'wechat_native'] })

function planResponse(overrides = {}) {
  return {
    billingEnabled: true,
    currentSubscription: null,
    plans: [
      { code: 'free', name: 'Free', paid: false, monthlyCredits: 60000, prices: [], currentPlan: true },
      {
        code: 'pro', name: 'Pro', tagline: 'For daily dictation', paid: true, highlight: true, monthlyCredits: 2000000, features: ['Cloud dictation'],
        prices: [
          { interval: 'month', priceId: 'p_pm', priceCents: 399, currency: 'USD', default: true },
          { interval: 'year', priceId: 'p_py', priceCents: 3999, currency: 'USD', discountPercent: 16 },
          cny('month', 1900), cny('quarter', 4900), cny('year', 16900),
        ],
      },
      {
        code: 'premium', name: 'Premium', paid: true, monthlyCredits: -1,
        prices: [
          { interval: 'month', priceId: 'p_xm', priceCents: 799, currency: 'USD' },
          cny('month', 3900),
        ],
      },
    ],
    ...overrides,
  }
}

function packResponse(overrides = {}) {
  const pack = (code, name, credits, usd, fen, extra = {}) => ({
    code, name, credits, validDays: 365, available: true, priceCents: usd, currency: 'USD', ...extra,
    prices: [{ provider: 'stripe', priceCents: usd, currency: 'USD', channels: [] }, { provider: 'aidea', priceCents: fen, currency: 'CNY', channels: ['alipay_page', 'wechat_native'] }],
  })
  return {
    billingEnabled: true,
    credits: { limit: 2000000, used: 0, remaining: 790000, unlimited: false, totalRemaining: 918400, addon: { balance: 128400, usedThisPeriod: 0, remaining: 128400, nextExpiry: { credits: 128400, expiresAt: '2027-08-02T00:00:00Z' } } },
    packs: [pack('pack_s', 'Small', 100000, 299, 1900), pack('pack_m', 'Standard', 220000, 599, 3900, { highlight: true })],
    ...overrides,
  }
}

function prepaidOrder(overrides = {}) {
  return {
    id: 'order-1', kind: 'membership', status: 'pending', fulfillment: 'pending', amount_fen: 4900, currency: 'CNY',
    channel: 'wechat_native', plan_code: 'pro', billing_interval: 'quarter', action: 'qr_code', pay_url: 'weixin://wxpay/bizpayurl?pr=abc',
    period_end: '2027-01-18T00:00:00Z', ...overrides,
  }
}

function api(overrides = {}) {
  return {
    loadPlans: vi.fn().mockResolvedValue(planResponse()),
    loadCredits: vi.fn().mockResolvedValue(packResponse()),
    manage: vi.fn().mockResolvedValue('https://billing.stripe.com/p'),
    redirect: vi.fn(),
    ...overrides,
    prepaidProps: {
      listOrders: vi.fn().mockResolvedValue([]),
      getOrder: vi.fn(),
      createOrder: vi.fn(),
      closeOrder: vi.fn(),
      newRequestId: vi.fn(() => 'request-1'),
      pollInterval: 5,
      ...overrides.prepaidProps,
    },
    stripeProps: {
      createMembershipCheckout: vi.fn().mockResolvedValue('https://checkout.stripe.com/c'),
      createPackCheckout: vi.fn().mockResolvedValue({ id: 'cs_1', url: 'https://checkout.stripe.com/p' }),
      newRequestId: vi.fn(() => 'pack-request-1'),
      wait: vi.fn().mockResolvedValue(undefined),
      ...overrides.stripeProps,
    },
    creditProps: {
      loadGrants: vi.fn().mockResolvedValue({ items: [], nextCursor: '' }),
      loadStatus: vi.fn().mockResolvedValue({ id: 'cs_1', status: 'pending' }),
      pollIntervalMs: 5,
      ...overrides.creditProps,
    },
  }
}

async function renderPage(props) {
  root = createRoot(container)
  await act(async () => {
    root.render(<I18nProvider><BillingPlansPage {...props} /></I18nProvider>)
  })
  await flush()
  return props
}

async function flush(ms = 0) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms))
  })
}

async function click(element) {
  if (!element) throw new Error('missing element')
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await flush()
}

const text = () => document.body.textContent
const button = (label, scope = document.body) => [...scope.querySelectorAll('button, a')].find((node) => node.textContent.trim() === label)
const buttonStarting = (prefix, scope = document.body) => [...scope.querySelectorAll('button')].find((node) => node.textContent.trim().startsWith(prefix))
const method = (value) => container.querySelector(`input[type="radio"][value="${value}"]:not([name="membership-plan"]):not([name="credit-pack"])`)
const planCard = (code) => document.getElementById(`plan-${code}`)
const order = () => container.querySelector('aside')
const dialog = () => document.querySelector('[role="dialog"]')

describe('BillingPlansPage access', () => {
  it('asks the user to open the page from Typeflux without a token', async () => {
    window.history.replaceState({}, '', '/billing/plans')
    const props = await renderPage(api())
    expect(text()).toContain('Open this page from Typeflux')
    expect(props.loadPlans).not.toHaveBeenCalled()
  })

  it('stores the token, clears the hash and reports an expired link', async () => {
    const props = await renderPage(api({ loadPlans: vi.fn().mockRejectedValue({ kind: 'expired_token' }) }))
    expect(props.loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(window.location.hash).toBe('')
    expect(text()).toContain('This billing link has expired')
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBeNull()
  })

  it('retries plans that failed to load and shows empty catalogs', async () => {
    const loadPlans = vi.fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(planResponse({ plans: [planResponse().plans[0]] }))
    await renderPage(api({ loadPlans }))
    expect(text()).toContain('Plans are temporarily unavailable')
    await click(button('Try again'))
    expect(text()).toContain('No plans are available')
  })

  it('shows a loading state while plans load', async () => {
    await renderPage(api({ loadPlans: vi.fn(() => new Promise(() => {})) }))
    expect(container.querySelector('[role="status"]').textContent).toContain('Loading')
  })
})

describe('membership purchase', () => {
  it('shows one order with prices in the selected method’s currency', async () => {
    await renderPage(api())
    expect(container.querySelector('h1').textContent).toBe('Upgrade Typeflux')
    expect(text()).toContain('790,000.00 credits left this month')
    expect(text()).toContain('+128,400.00 add-on')
    expect(container.querySelectorAll('[role="tablist"]')).toHaveLength(1)
    expect(planCard('free')).toBeNull()
    expect(planCard('pro').textContent).toContain('$3.99')
    expect(planCard('pro').textContent).toContain('Most popular')
    expect(planCard('pro').textContent).toContain('≈ 66,667 h')
    expect(planCard('premium').textContent).toContain('Unlimited credits')
    expect(order().textContent).toContain('Pro · 1 month')
    expect(method('stripe').checked).toBe(true)
    expect(order().textContent).toContain('CN¥19')
    expect(order().textContent).toContain('Renews monthly')
    expect(buttonStarting('Continue to Stripe').textContent).toContain('$3.99')

    await click(method('wechat_native'))
    expect(planCard('pro').textContent).toContain('CN¥19')
    expect(order().textContent).toContain('Doesn’t renew automatically')
    await click(buttonStarting('Quarterly'))
    expect(planCard('pro').textContent).toContain('CN¥49')
    expect(planCard('pro').textContent).toContain('Save 14%')
    expect(planCard('pro').textContent).toContain('CN¥16.33 / month')
    expect(planCard('premium').textContent).toContain('Not available for this period')
    expect(order().textContent).toContain('Stripe' + 'Not available')

    await click(planCard('premium').querySelector('input'))
    expect(button('Pay CN¥49')).toBeUndefined()
    expect(order().querySelector('button[disabled]')).not.toBeNull()

    await click(method('stripe'))
    expect(container.querySelector('[aria-pressed="true"]').textContent).toBe('Monthly')
    expect(text()).toContain('Do Alipay and WeChat Pay memberships renew automatically?')
    expect(text()).toContain('Need help choosing?')
  })

  it('opens Stripe Checkout and retries a pending checkout', async () => {
    const createMembershipCheckout = vi.fn()
      .mockRejectedValueOnce({ kind: 'checkout_pending' })
      .mockResolvedValueOnce('https://checkout.stripe.com/c')
    const props = await renderPage(api({ stripeProps: { createMembershipCheckout } }))
    await click(buttonStarting('Yearly'))
    await click(buttonStarting('Continue to Stripe'))
    await flush()
    expect(createMembershipCheckout).toHaveBeenLastCalledWith('billing-token', 'pro', 'year', expect.any(Object))
    expect(props.stripeProps.wait).toHaveBeenCalledWith(2000, expect.any(AbortSignal))
    expect(props.redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c')
  })

  it('explains a Stripe conflict and reloads the account', async () => {
    const createMembershipCheckout = vi.fn().mockRejectedValue({ kind: 'conflict' })
    const props = await renderPage(api({ stripeProps: { createMembershipCheckout } }))
    await click(buttonStarting('Continue to Stripe'))
    expect(order().textContent).toContain('already has an active subscription')
    expect(props.loadPlans).toHaveBeenCalledTimes(2)
    await click(method('alipay_page'))
    expect(order().textContent).not.toContain('already has an active subscription')
  })

  it('pays with WeChat, polls the order and confirms activation', async () => {
    const created = prepaidOrder()
    const getOrder = vi.fn()
      .mockResolvedValueOnce({ ...created, status: 'paid' })
      .mockResolvedValue({ ...created, status: 'paid', fulfillment: 'granted' })
    const createOrder = vi.fn().mockResolvedValue(created)
    const props = await renderPage(api({ prepaidProps: { createOrder, getOrder, pollInterval: 40 } }))
    await click(method('wechat_native'))
    await click(buttonStarting('Quarterly'))
    await click(button('Pay CN¥49'))

    expect(createOrder).toHaveBeenCalledWith('billing-token', { request_id: 'request-1', plan_code: 'pro', billing_interval: 'quarter', channel: 'wechat_native' }, expect.any(Object))
    expect(JSON.parse(sessionStorage.getItem(PREPAID_INTENT_STORAGE_KEY))).toMatchObject({ request_id: 'request-1', order_id: 'order-1' })
    expect(dialog().textContent).toContain('Scan with WeChat to pay')
    expect(dialog().querySelector('svg title').textContent).toBe('Scan with WeChat to pay')
    expect(dialog().textContent).toContain('Pro · 3 months')
    expect(dialog().textContent).toContain('Order order-1')

    await flush(120)
    expect(dialog().textContent).toContain('Membership activated')
    expect(dialog().textContent).toContain('Pro is active until')
    expect(button('Return to Typeflux', dialog()).getAttribute('href')).toBe('typeflux://billing/return')
    expect(props.loadPlans).toHaveBeenCalledTimes(2)
    await click(button('Done', dialog()))
    expect(dialog()).toBeNull()
    expect(sessionStorage.getItem(PREPAID_INTENT_STORAGE_KEY)).toBeNull()
  })

  it('shows the paid-but-activating state and pauses polling', async () => {
    const created = prepaidOrder({ status: 'paid' })
    const getOrder = vi.fn().mockResolvedValue(created)
    await renderPage(api({ prepaidProps: { createOrder: vi.fn().mockResolvedValue(created), getOrder, maxPolls: 2 } }))
    await click(method('wechat_native'))
    await click(buttonStarting('Pay'))
    expect(dialog().textContent).toContain('Activating your membership')
    expect(button('Cancel order', dialog())).toBeUndefined()
    await flush(40)
    expect(dialog().textContent).toContain('Already paid? Select')
    getOrder.mockResolvedValue({ ...created, fulfillment: 'granted', period_end: '' })
    await click(button('I’ve paid', dialog()))
    expect(dialog().textContent).toContain('Pro is now active.')
  })

  it('opens Alipay in a new tab and lets the user cancel the order', async () => {
    const created = prepaidOrder({ channel: 'alipay_page', action: 'redirect', pay_url: 'https://openapi.alipay.com/pay', billing_interval: 'month', amount_fen: 1900 })
    const closeOrder = vi.fn().mockResolvedValue({ ...created, status: 'closed' })
    await renderPage(api({ prepaidProps: { createOrder: vi.fn().mockResolvedValue(created), getOrder: vi.fn(() => new Promise(() => {})), closeOrder } }))
    await click(method('alipay_page'))
    await click(button('Pay CN¥19'))
    const link = button('Open Alipay', dialog())
    expect(link.getAttribute('href')).toBe('https://openapi.alipay.com/pay')
    expect(link.getAttribute('target')).toBe('_blank')
    await click(button('Cancel order', dialog()))
    expect(closeOrder).toHaveBeenCalledWith('billing-token', 'order-1', expect.any(Object))
    expect(dialog().textContent).toContain('Order canceled')
    await click(button('Choose again', dialog()))
    expect(dialog()).toBeNull()
    expect(sessionStorage.getItem(PREPAID_INTENT_STORAGE_KEY)).toBeNull()
  })

  it('keeps an unpaid order after closing the dialog and offers to continue it', async () => {
    const created = prepaidOrder({ pay_url: '' })
    await renderPage(api({ prepaidProps: { createOrder: vi.fn().mockResolvedValue(created), getOrder: vi.fn(() => new Promise(() => {})) } }))
    await click(method('wechat_native'))
    await click(buttonStarting('Pay'))
    expect(dialog().textContent).toContain('Preparing your payment')
    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(dialog()).toBeNull()
    expect(text()).toContain('You have an unfinished order')
    expect(order().querySelector('fieldset').disabled).toBe(true)
    await click(button('Continue payment'))
    expect(dialog()).not.toBeNull()
  })

  it('closes an unfinished order from the banner and allows a new purchase', async () => {
    const first = prepaidOrder()
    const second = prepaidOrder({ id: 'order-2' })
    const createOrder = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second)
    const closeOrder = vi.fn().mockResolvedValue({ ...first, status: 'closed' })
    const newRequestId = vi.fn().mockReturnValueOnce('request-1').mockReturnValueOnce('request-2')
    await renderPage(api({ prepaidProps: { createOrder, closeOrder, newRequestId, getOrder: vi.fn(() => new Promise(() => {})) } }))
    await click(method('wechat_native'))
    await click(buttonStarting('Pay'))
    await click(dialog().querySelector('button[aria-label="Close"]'))
    expect(text()).toContain('Unpaid orders close automatically after 15 minutes.')
    await click(button('Cancel order'))
    expect(closeOrder).toHaveBeenCalledWith('billing-token', first.id, expect.any(Object))
    expect(order().querySelector('fieldset').disabled).toBe(false)
    await click(buttonStarting('Pay'))
    expect(createOrder).toHaveBeenNthCalledWith(2, 'billing-token', expect.objectContaining({ request_id: 'request-2' }), expect.any(Object))
    expect(dialog()).not.toBeNull()
  })

  it('traps focus in the payment dialog and closes from the backdrop', async () => {
    const created = prepaidOrder()
    await renderPage(api({ prepaidProps: { createOrder: vi.fn().mockResolvedValue(created), getOrder: vi.fn(() => new Promise(() => {})) } }))
    await click(method('wechat_native'))
    await click(buttonStarting('Pay'))
    const controls = [...dialog().querySelectorAll('button:not(:disabled), a[href]')]
    expect(document.activeElement).toBe(controls[0])
    const tab = (shiftKey) => act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true }))
    })
    await tab(true)
    expect(document.activeElement).toBe(controls[controls.length - 1])
    await tab(false)
    expect(document.activeElement).toBe(controls[0])
    document.body.focus()
    await tab(false)
    expect(document.activeElement).toBe(controls[0])
    await click(document.querySelector('[role="dialog"]').parentElement)
    expect(dialog()).toBeNull()
  })

  it('recovers an unresolved order after a reload', async () => {
    const pending = prepaidOrder({ fulfillment: 'review' })
    const listOrders = vi.fn().mockResolvedValue([pending])
    const getOrder = vi.fn().mockResolvedValue(pending)
    await renderPage(api({ prepaidProps: { listOrders, getOrder } }))
    expect(dialog().textContent).toContain('This payment needs a check')
    expect(JSON.parse(sessionStorage.getItem(PREPAID_INTENT_STORAGE_KEY))).toMatchObject({ order_id: 'order-1', plan_code: 'pro' })
    await click(dialog().querySelector('button[aria-label="Close"]'))
    expect(text()).toContain('You have an unfinished order · Pro · 3 months')
  })

  it('drops a stored intent the server never received and finished orders', async () => {
    sessionStorage.setItem(PREPAID_INTENT_STORAGE_KEY, JSON.stringify({ request_id: 'lost', plan_code: 'pro', billing_interval: 'month', channel: 'alipay_page' }))
    const getOrder = vi.fn().mockRejectedValue({ status: 404 })
    await renderPage(api({ prepaidProps: { getOrder } }))
    expect(getOrder).toHaveBeenCalledWith('billing-token', 'lost', expect.any(Object))
    expect(sessionStorage.getItem(PREPAID_INTENT_STORAGE_KEY)).toBeNull()
    act(() => root.unmount())

    sessionStorage.setItem(PREPAID_INTENT_STORAGE_KEY, JSON.stringify({ request_id: 'old', order_id: 'order-1', pack_code: 'pack_s', channel: 'wechat_native' }))
    root = createRoot(container)
    await renderPage(api({ prepaidProps: { getOrder: vi.fn().mockResolvedValue(prepaidOrder({ status: 'closed' })) } }))
    expect(dialog()).toBeNull()
    expect(sessionStorage.getItem(PREPAID_INTENT_STORAGE_KEY)).toBeNull()
  })

  it('retries an unconfirmed purchase with the same request ID', async () => {
    const createOrder = vi.fn()
      .mockRejectedValueOnce({ kind: 'network' })
      .mockResolvedValueOnce(prepaidOrder())
    const props = await renderPage(api({ prepaidProps: { createOrder, getOrder: vi.fn(() => new Promise(() => {})) } }))
    await click(method('wechat_native'))
    await click(buttonStarting('Pay'))
    expect(text()).toContain('Couldn’t update the order')
    expect(text()).toContain('Your last order didn’t finish')
    await click(button('Continue payment'))
    expect(createOrder).toHaveBeenCalledTimes(2)
    expect(createOrder.mock.calls[1][1].request_id).toBe('request-1')
    expect(props.prepaidProps.newRequestId).toHaveBeenCalledTimes(1)
    expect(dialog()).not.toBeNull()
  })

  it('blocks purchases until recent orders can be checked', async () => {
    const listOrders = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce([])
    await renderPage(api({ prepaidProps: { listOrders } }))
    expect(text()).toContain('We couldn’t load your recent order')
    expect(buttonStarting('Continue to Stripe').disabled).toBe(true)
    await click(button('Try again'))
    expect(text()).not.toContain('We couldn’t load your recent order')
    expect(buttonStarting('Continue to Stripe').disabled).toBe(false)
  })

  it('expires the page when the order API rejects the token', async () => {
    await renderPage(api({ prepaidProps: { listOrders: vi.fn().mockRejectedValue({ kind: 'expired_token' }) } }))
    expect(text()).toContain('This billing link has expired')
  })

  it('lets prepaid members renew only their plan', async () => {
    const subscription = { paid: true, active: true, billing_mode: 'prepaid', plan_code: 'pro', current_period_end: '2026-12-18T00:00:00Z' }
    await renderPage(api({ loadPlans: vi.fn().mockResolvedValue(planResponse({ currentSubscription: subscription })) }))
    expect(text()).toContain('Valid until December 18, 2026')
    expect(method('wechat_native').checked).toBe(true)
    expect(planCard('pro').textContent).toContain('Current plan')
    expect(button('Renew · CN¥19')).not.toBeUndefined()
    expect(order().textContent).toContain('Adds 1 month after your current membership ends')
    await click(planCard('premium').querySelector('input'))
    expect(order().textContent).toContain('To change plans, wait until it ends')
    await click(method('stripe'))
    expect(order().textContent).toContain('switch to a Stripe subscription after your current membership ends')
  })

  it('lets Stripe subscribers manage their subscription', async () => {
    const subscription = { paid: true, active: true, billing_mode: 'subscription', plan_code: 'pro' }
    const manage = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce('https://billing.stripe.com/p')
    const props = await renderPage(api({ manage, loadPlans: vi.fn().mockResolvedValue(planResponse({ currentSubscription: subscription })) }))
    expect(text()).toContain('Renews automatically')
    expect(order().textContent).toContain('This is your current plan.')
    await click(method('alipay_page'))
    expect(order().textContent).toContain('You’re subscribed through Stripe')
    await click(button('Manage subscription'))
    expect(text()).toContain('Stripe couldn’t be opened')
    await click(button('Manage subscription'))
    expect(props.redirect).toHaveBeenCalledWith('https://billing.stripe.com/p')
  })

  it('opens subscription management instead of a second checkout when upgrading Stripe Pro', async () => {
    const subscription = { paid: true, active: true, billing_mode: 'subscription', plan_code: 'pro' }
    let finish
    const manage = vi.fn(() => new Promise((resolve) => { finish = resolve }))
    const props = await renderPage(api({ manage, loadPlans: vi.fn().mockResolvedValue(planResponse({ currentSubscription: subscription })) }))
    await click(planCard('premium').querySelector('input'))
    expect(order().textContent).toContain('Change your plan in Stripe')
    expect(order().textContent).not.toContain('Renews monthly')
    const action = button('Manage subscription', order())
    expect(action.disabled).toBe(false)
    await click(action)
    expect(manage).toHaveBeenCalledWith('billing-token')
    expect(button('Opening Stripe…', order()).disabled).toBe(true)
    expect(planCard('premium').querySelector('input').disabled).toBe(true)
    expect(props.stripeProps.createMembershipCheckout).not.toHaveBeenCalled()
    expect(props.prepaidProps.createOrder).not.toHaveBeenCalled()
    await act(async () => { finish('https://billing.stripe.com/change') })
    expect(props.redirect).toHaveBeenCalledWith('https://billing.stripe.com/change')
  })

  it('disables purchases when billing is off', async () => {
    await renderPage(api({ loadPlans: vi.fn().mockResolvedValue(planResponse({ billingEnabled: false })) }))
    expect(order().textContent).toContain('Purchases are temporarily unavailable')
    expect(buttonStarting('Continue to Stripe').disabled).toBe(true)
  })

  it('recommends a plan from the usage estimator', async () => {
    await renderPage(api())
    const help = container.querySelector('details')
    help.open = true
    await click(buttonStarting('Choose'))
    expect(planCard('pro').querySelector('input').checked).toBe(true)
  })
})

describe('add-on credits', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/billing/plans?tab=credits#t=billing-token')
  })

  it('switches tabs and keeps the URL in sync', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    await renderPage(api())
    await click(button('Add-on credits'))
    expect(window.location.search).toBe('?tab=credits')
    expect(text()).toContain('Choose a credit pack')
    await click(button('Membership'))
    expect(window.location.search).toBe('')
  })

  it('buys a pack through Stripe after consent', async () => {
    const createPackCheckout = vi.fn()
      .mockRejectedValueOnce({ kind: 'network' })
      .mockResolvedValueOnce({ id: 'cs_1', url: 'https://checkout.stripe.com/p' })
    const props = await renderPage(api({ stripeProps: { createPackCheckout } }))
    expect(text()).toContain('918,400')
    expect(text()).toContain('128,400.00 add-on credits expire on')
    expect(order().textContent).toContain('Standard')
    expect(order().textContent).toContain('220,000.00 credits · valid for 365 days')
    const pay = buttonStarting('Continue to Stripe')
    expect(pay.disabled).toBe(true)
    await click(order().querySelector('input[type="checkbox"]'))
    await click(pay)
    expect(order().textContent).toContain('Stripe couldn’t be opened')
    await click(pay)
    expect(createPackCheckout.mock.calls.map((call) => call[2])).toEqual(['pack-request-1', 'pack-request-1'])
    expect(props.redirect).toHaveBeenCalledWith('https://checkout.stripe.com/p')
    expect(sessionStorage.getItem(CREDIT_PACK_SELECTION_STORAGE_KEY)).toBe('pack_m')
  })

  it('reports a rate-limited pack purchase', async () => {
    await renderPage(api({ stripeProps: { createPackCheckout: vi.fn().mockRejectedValue({ kind: 'rate_limited' }) } }))
    await click(container.querySelector('input[value="pack_s"]'))
    await click(order().querySelector('input[type="checkbox"]'))
    await click(buttonStarting('Continue to Stripe'))
    expect(order().textContent).toContain('limit of 10 credit pack orders')
  })

  it('buys a pack with WeChat and refreshes the balance', async () => {
    const created = prepaidOrder({ kind: 'credit_pack', pack_code: 'pack_m', credits: 220000, valid_days: 365, plan_code: undefined, billing_interval: undefined, amount_fen: 3900 })
    const getOrder = vi.fn().mockResolvedValue({ ...created, status: 'paid', fulfillment: 'granted' })
    const createOrder = vi.fn().mockResolvedValue(created)
    const props = await renderPage(api({ prepaidProps: { createOrder, getOrder } }))
    await click(method('wechat_native'))
    expect(container.querySelector('label input[value="pack_s"]').closest('label').textContent).toContain('CN¥19')
    await click(order().querySelector('input[type="checkbox"]'))
    await click(button('Pay CN¥39'))
    expect(createOrder).toHaveBeenCalledWith('billing-token', { request_id: 'request-1', pack_code: 'pack_m', channel: 'wechat_native' }, expect.any(Object))
    expect(dialog().textContent).toContain('Standard · 220,000.00 credits')
    await flush(30)
    expect(dialog().textContent).toContain('Credits added')
    expect(dialog().textContent).toContain('220,000.00 credits are ready to use.')
    expect(props.loadCredits).toHaveBeenCalledTimes(2)
  })

  it('shows refunded and posting states for credit orders', async () => {
    const pending = prepaidOrder({ kind: 'credit_pack', pack_code: 'pack_s', credits: 100000, status: 'paid' })
    const getOrder = vi.fn().mockResolvedValueOnce(pending).mockResolvedValue({ ...pending, fulfillment: 'refunded' })
    await renderPage(api({ prepaidProps: { listOrders: vi.fn().mockResolvedValue([pending]), getOrder } }))
    expect(dialog().textContent).toContain('Adding your credits')
    await flush(30)
    expect(dialog().textContent).toContain('Order refunded')
  })

  it('confirms a pack paid through Stripe on return', async () => {
    sessionStorage.setItem(CREDIT_PACK_SELECTION_STORAGE_KEY, 'pack_s')
    window.history.replaceState({}, '', '/billing/plans?tab=credits&checkout=success&session_id=cs_1#t=billing-token')
    const loadStatus = vi.fn().mockResolvedValueOnce({ status: 'pending' }).mockResolvedValue({ status: 'granted' })
    const loadGrants = vi.fn().mockResolvedValue({ items: [{ id: 'g', sessionId: 'cs_1', credits: 100000 }], nextCursor: '' })
    await renderPage(api({ creditProps: { loadStatus, loadGrants } }))
    expect(order().textContent).toContain('Small')
    await flush(30)
    expect(text()).toContain('Credits added')
    expect(text()).toContain('100,000.00 credits have been added')
    expect(sessionStorage.getItem(CREDIT_PACK_SELECTION_STORAGE_KEY)).toBeNull()
  })

  it('reports failed, delayed and unverified Stripe returns', async () => {
    window.history.replaceState({}, '', '/billing/plans?tab=credits&checkout=success&session_id=cs_1#t=billing-token')
    await renderPage(api({ creditProps: { loadStatus: vi.fn().mockResolvedValue({ status: 'failed' }) } }))
    expect(text()).toContain('Payment was not completed')
    act(() => root.unmount())

    root = createRoot(container)
    const loadStatus = vi.fn().mockRejectedValue(new Error('x'))
    await renderPage(api({ creditProps: { loadStatus, maxPollAttempts: 2 } }))
    await flush(30)
    expect(text()).toContain('Payment is still processing')
    await click(button('Check again'))
    expect(loadStatus.mock.calls.length).toBeGreaterThan(2)
    act(() => root.unmount())

    root = createRoot(container)
    await renderPage(api({ creditProps: { loadStatus: vi.fn().mockRejectedValue({ kind: 'expired_token' }) } }))
    expect(text()).toContain('Payment submitted')
    act(() => root.unmount())

    window.history.replaceState({}, '', '/billing/plans?tab=credits&checkout=success&session_id=cs_1')
    sessionStorage.clear()
    root = createRoot(container)
    await renderPage(api())
    expect(text()).toContain('Payment submitted')
  })

  it('acknowledges a canceled Stripe checkout', async () => {
    window.history.replaceState({}, '', '/billing/plans?tab=credits&checkout=cancel#t=billing-token')
    await renderPage(api())
    expect(text()).toContain('Checkout was canceled')
  })

  it('loads purchase history on demand', async () => {
    const loadGrants = vi.fn()
      .mockResolvedValueOnce({ items: [{ id: 'a', packCode: 'pack_s', credits: 100000, remaining: 5, status: 'active', grantedAt: '2026-01-01T00:00:00Z', expiresAt: '2026-02-01T00:00:00Z' }], nextCursor: 'next' })
      .mockResolvedValueOnce({ items: [{ id: 'b', source: 'admin', credits: 10, remaining: 10, status: 'frozen', grantedAt: '', expiresAt: '' }], nextCursor: '' })
      .mockRejectedValueOnce(new Error('x'))
    await renderPage(api({ creditProps: { loadGrants } }))
    await click(button('Purchase historyShow purchase history'))
    expect(text()).toContain('Small')
    expect(text()).toContain('Expired')
    await click(button('Load more'))
    expect(text()).toContain('Compensation')
    expect(text()).toContain('Frozen')
    await click(button('Purchase historyHide purchase history'))
    await click(button('Purchase historyShow purchase history'))
    expect(text()).toContain('Purchase history could not be loaded.')
  })

  it('shows credit catalog errors and empty catalogs', async () => {
    const loadCredits = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(packResponse({ packs: [] }))
    await renderPage(api({ loadCredits }))
    expect(text()).toContain('Credit packs are temporarily unavailable')
    await click(button('Try again'))
    expect(text()).toContain('There are no purchasable credit packs')
  })
})
