// @vitest-environment jsdom
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AccountPage from './AccountPage'
import { apiError, flush, mount, routeFetch } from './testUtils'

const A = '/api/v1/auth/web/account'
const stats = {
  period_start: '2026-10-03T00:00:00Z', period_end: '2026-11-02T00:00:00Z', plan_code: 'pro', paid: true,
  stats: { asr_count: 120, asr_audio_duration_ms: 3_600_000 },
  credits: { limit: 5000, used: 3180, remaining: 1820, total_remaining: 3020, unlimited: false, addon: { remaining: 1200, next_expiry: { credits: 1200, expires_at: '2026-12-01T00:00:00Z' } } },
}
const stripeSub = { paid: true, active: true, status: 'active', billing_mode: 'subscription', management_action: 'portal', plan_name: 'Pro', billing_interval: 'month', current_period_end: '2026-11-03T00:00:00Z', auto_renew: true }
const breakdown = { voice: 590, rewrite: 277, ask: 139, days: [
  { date: '2026-10-16', voice: 100, rewrite: 40, ask: 10 }, { date: '2026-10-17', voice: 0, rewrite: 0, ask: 0 }, { date: '2026-10-18', voice: 490, rewrite: 237, ask: 129 },
] }
const records = { records: [
  { id: 'r1', type: 'asr', audio_duration_ms: 42000, created_at: '2026-10-18T06:32:00Z' },
  { id: 'r2', type: 'chat', scenario: 'rewrite', total_tokens: 612, created_at: '2026-10-18T06:31:00Z' },
  { id: 'r3', type: 'chat', scenario: 'ask', created_at: 'bad' },
], total: 3 }
const grants = { items: [{ id: 'g1', source: 'stripe', credits: 1500, amount_cents: 499, currency: 'usd', status: 'active', granted_at: '2026-09-21T00:00:00Z' }] }
const orders = { items: [{ id: 'o1', kind: 'membership', plan_code: 'pro', months: 3, channel: 'alipay_page', status: 'pending', fulfillment: 'pending', amount_fen: 19900, currency: 'CNY', created_at: '2026-10-15T00:00:00Z' }] }

function api(overrides = {}) {
  return routeFetch({
    [`${A}/usage/current-period/stats`]: stats,
    [`${A}/billing/subscription`]: stripeSub,
    [`${A}/usage/current-period/breakdown`]: breakdown,
    // The real endpoint returns this body without the {code, data} envelope.
    [`${A}/usage/records`]: () => new Response(JSON.stringify(records)),
    [`${A}/billing/credit-grants`]: grants,
    [`${A}/billing/prepaid-orders`]: orders,
    [`${A}/billing/web-portal-session`]: { url: 'https://billing.stripe.com/p/session' },
    ...overrides,
  })
}

let view, navigate
beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/account')
  navigate = vi.fn()
  globalThis.ResizeObserver = class { constructor(cb) { this.cb = cb } observe() { this.cb([{ contentRect: { width: 600 } }]) } disconnect() {} }
})
afterEach(() => { view?.unmount(); view = null; vi.unstubAllGlobals(); delete globalThis.ResizeObserver })

const page = (route, options) => mount(<AccountPage route={route} navigate={navigate} />, options).render()

describe('session states', () => {
  it('asks signed-out visitors to sign in and come back', async () => {
    view = await page('/account/usage', { session: { authenticated: false } })
    expect(view.text()).toContain('Sign in to see your account')
    expect(view.find('a', 'Sign in').getAttribute('href')).toBe('/login?next=%2Faccount%2Fusage')
  })
  it('shows progress while loading and a retry when the session cannot be read', async () => {
    view = await page('/account', { load: () => new Promise(() => {}) })
    expect(view.container.querySelector('[role="status"]')).toBeTruthy()
    view.unmount()
    let down = true
    const load = vi.fn(async () => { if (down) throw new Error('down'); return { authenticated: false } })
    view = await page('/account', { load })
    expect(view.text()).toContain('This section could not be loaded.')
    down = false
    await view.click(view.find('button', 'Try again'))
    expect(view.text()).toContain('Sign in to see your account')
  })
  it('returns to the signed-out view when any section reports an expired session', async () => {
    api({ [`${A}/usage/current-period/stats`]: apiError('AUTH_REQUIRED', 401) })
    view = await page('/account')
    expect(view.text()).toContain('Sign in to see your account')
  })
})

describe('overview', () => {
  it('summarizes credits, plan, feature usage and recent payments', async () => {
    api()
    view = await page('/account')
    const text = view.text()
    expect(text).toContain('Hi, lin')
    expect(text).toContain('3,020credits left')
    expect(text).toContain('Plan credits left 1,820 / 5,000')
    expect(text).toContain('Add-on credits 1,200')
    expect(text).toContain('Pro')
    expect(text).toContain('Monthly')
    expect(text).toContain('Card (Stripe)')
    expect(text).toContain('Voice input · This period590credits')
    expect(text).toContain('3 mo')
    expect(text).toContain('Awaiting payment')
    expect(view.find('a', 'Buy credits').getAttribute('href')).toBe('/billing/plans?tab=credits')
    expect(view.find('a', 'Change plan').getAttribute('href')).toBe('/billing/plans')
    expect(view.find('a[aria-current="page"]').textContent).toBe('Overview')
    expect(view.container.querySelector('[role="img"]').getAttribute('aria-label')).toContain('Plan credits left 1820')
  })
  it('opens the Stripe portal, and reports failures', async () => {
    const fetchMock = api()
    view = await page('/account')
    await view.click(view.find('button', 'Manage subscription'))
    expect(navigate).toHaveBeenCalledWith('https://billing.stripe.com/p/session')
    const [, init] = fetchMock.mock.calls.find(([path]) => path.endsWith('/web-portal-session'))
    expect(init.headers['X-CSRF-Token']).toBe('csrf-1')
    expect(init.credentials).toBe('same-origin')
    api({ [`${A}/billing/web-portal-session`]: apiError('BILLING_UNAVAILABLE', 503) })
    await view.click(view.find('button', 'Manage subscription'))
    expect(view.text()).toContain('The billing portal could not be opened.')
    api({ [`${A}/billing/web-portal-session`]: apiError('AUTH_REQUIRED', 401) })
    await view.click(view.find('button', 'Manage subscription'))
    expect(view.text()).toContain('Sign in to see your account')
  })
  it('shows a past-due warning with a fix action', async () => {
    api({ [`${A}/billing/subscription`]: { ...stripeSub, status: 'past_due' } })
    view = await page('/account')
    expect(view.find('[role="alert"]', 'payment failed')).toBeTruthy()
    expect(view.text()).toContain('Payment failed')
    const buttons = [...view.container.querySelectorAll('button')].filter((b) => b.textContent === 'Manage subscription')
    expect(buttons).toHaveLength(2)
    await view.click(buttons[0])
    expect(navigate).toHaveBeenCalled()
  })
  it('invites free accounts to see plans and flags low credit', async () => {
    api({
      [`${A}/billing/subscription`]: { paid: false, plan_name: '' },
      [`${A}/usage/current-period/stats`]: { ...stats, credits: { limit: 300, used: 290, remaining: 10, total_remaining: 10 } },
      [`${A}/billing/credit-grants`]: { items: [] },
      [`${A}/billing/prepaid-orders`]: { items: [] },
    })
    view = await page('/account')
    expect(view.find('a', 'See plans').getAttribute('href')).toBe('/billing/plans')
    expect(view.text()).toContain('Running low')
    expect(view.text()).toContain('No payments yet.')
  })
  it('lets one failed section retry without blocking the rest', async () => {
    let fail = true
    api({ [`${A}/billing/subscription`]: () => (fail ? apiError('INTERNAL', 500) : stripeSub) })
    view = await page('/account')
    expect(view.text()).toContain('3,020')
    expect(view.text()).toContain('This section could not be loaded.')
    fail = false
    await view.click(view.find('button', 'Try again'))
    expect(view.text()).toContain('Monthly')
  })
  it('shows unlimited plans without a meter', async () => {
    api({ [`${A}/usage/current-period/stats`]: { ...stats, credits: { unlimited: true } } })
    view = await page('/account')
    expect(view.text()).toContain('Unlimited')
    expect(view.container.querySelector('[role="img"]')).toBeNull()
  })
})

describe('usage', () => {
  it('charts daily credits with a tooltip and an equivalent table', async () => {
    api()
    view = await page('/account/usage')
    const text = view.text()
    expect(text).toContain('1,006')
    expect(text).toContain('335.33 per day on average')
    expect(text).toContain('60min')
    expect(text).toContain('120 requests')
    const bars = view.container.querySelectorAll('svg path')
    expect(bars.length).toBe(6)
    const hits = view.container.querySelectorAll('svg rect')
    expect(hits).toHaveLength(3)
    await act(async () => hits[2].dispatchEvent(new MouseEvent('mouseover', { bubbles: true })))
    expect(view.container.querySelector('[role="status"]').textContent).toMatch(/Voice input490.*Total856/)
    await act(async () => hits[2].dispatchEvent(new MouseEvent('mouseout', { bubbles: true })))
    expect(view.container.querySelector('[role="status"]')).toBeNull()
    await act(async () => hits[0].dispatchEvent(new FocusEvent('focusin', { bubbles: true })))
    expect(view.container.querySelector('[role="status"]').textContent).toContain('150')
    await view.click(view.find('button', 'Table'))
    expect(view.find('button', 'Table').getAttribute('aria-pressed')).toBe('true')
    const rows = [...view.container.querySelectorAll('table')[0].querySelectorAll('tbody tr')].map((r) => r.textContent)
    expect(rows[0]).toBe('2026-10-18490237129856')
    await view.click(view.find('button', 'Chart'))
    expect(view.container.querySelectorAll('svg rect')).toHaveLength(3)
    expect(text).toContain('Voice input59059%')
    expect(text).toContain('0:42 of audio')
    expect(text).toContain('612 tokens')
    const kinds = [...[...view.container.querySelectorAll('table')].at(-1).querySelectorAll('tbody tr td:nth-child(2)')].map((td) => td.textContent)
    expect(kinds).toEqual(['Voice input', 'Rewrite', 'Ask'])
  })
  it('explains an empty period', async () => {
    api({
      [`${A}/usage/current-period/breakdown`]: { voice: 0, rewrite: 0, ask: 0, days: [] },
      [`${A}/usage/records`]: () => new Response(JSON.stringify({ records: [] })),
      [`${A}/usage/current-period/stats`]: { ...stats, credits: { unlimited: true } },
    })
    view = await page('/account/usage')
    expect(view.text()).toContain('No cloud usage in this period yet.')
    expect(view.text()).toContain('0 per day on average')
    expect(view.container.querySelector('svg')).toBeNull()
  })
})

describe('billing', () => {
  it('shows the balance, payment history and Stripe invoices', async () => {
    api()
    view = await page('/account/billing')
    const text = view.text()
    expect(text).toContain('Credit balance')
    expect(text).toContain('1,820 / 5,000')
    expect(text).toContain('next batch expires')
    expect(text).toContain('1,500 credits')
    expect(text).toContain('$4.99')
    expect(text).toContain('¥199')
    await view.click(view.find('button', 'Invoices & payment method'))
    expect(navigate).toHaveBeenCalledWith('https://billing.stripe.com/p/session')
    api({ [`${A}/billing/web-portal-session`]: apiError('INTERNAL', 500) })
    await view.click(view.find('button', 'Invoices & payment method'))
    expect(view.find('[role="alert"]', 'billing portal')).toBeTruthy()
  })
  it('offers renewal for prepaid plans and points App Store plans to Apple', async () => {
    api({ [`${A}/billing/subscription`]: { paid: true, active: true, billing_mode: 'prepaid', payment_channel: 'alipay_page', management_action: 'renew', plan_name: 'Pro', billing_interval: 'quarter', current_period_end: '2027-01-15T00:00:00Z', auto_renew: false } })
    view = await page('/account/billing')
    expect(view.find('a', 'Renew').getAttribute('href')).toBe('/billing/plans')
    expect(view.text()).toContain('Ends on')
    expect(view.text()).toContain('Prepaid memberships do not renew automatically.')
    expect(view.find('button', 'Invoices & payment method')).toBeUndefined()
    view.unmount()
    api({ [`${A}/billing/subscription`]: { paid: true, active: true, payment_provider: 'apple', management_action: 'portal', plan_name: 'Pro' }, [`${A}/usage/current-period/stats`]: { ...stats, credits: { unlimited: true } } })
    view = await page('/account/billing')
    expect(view.text()).toContain('Manage it in your Apple account settings.')
    expect(view.find('button', 'Manage subscription')).toBeUndefined()
    expect(view.text()).toContain('Unlimited')
  })
  it('localizes the area', async () => {
    window.history.replaceState({}, '', '/zh-CN/account/billing')
    api()
    view = await page('/account/billing')
    expect(view.text()).toContain('订阅与账单')
    expect(view.text()).toContain('积分余额')
    await flush()
  })
})
