// @vitest-environment jsdom
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BillingPlansPage from './BillingPlansPage'
import { isSessionCredential } from '../lib/billingApi'
import { flush, mount } from './account/testUtils'

globalThis.React = React
const code = 'H'.repeat(43)
const plans = { billingEnabled: true, currentSubscription: null, plans: [{ code: 'free', name: 'Free', paid: false, monthlyCredits: 60000, prices: [], currentPlan: true }] }
const packs = { billingEnabled: true, credits: null, packs: [] }

let view
function props(overrides = {}) {
  return {
    loadPlans: vi.fn().mockResolvedValue(plans),
    loadCredits: vi.fn().mockResolvedValue(packs),
    prepaidProps: { listOrders: vi.fn().mockResolvedValue([]), getOrder: vi.fn() },
    ...overrides,
  }
}
beforeEach(() => { sessionStorage.clear(); localStorage.clear(); window.scrollTo = vi.fn(); window.history.replaceState({}, '', '/billing/plans') })
afterEach(() => { view?.unmount(); view = null })

describe('BillingPlansPage on the website session', () => {
  it('loads with the cookie session when opened directly', async () => {
    const p = props()
    view = await mount(<BillingPlansPage {...p} />).render()
    const credential = p.loadPlans.mock.calls[0][0]
    expect(isSessionCredential(credential)).toBe(true)
    expect(credential.csrf).toBe('csrf-1')
    expect(p.prepaidProps.listOrders).toHaveBeenCalledWith(credential, expect.anything())
  })
  it('signs the header out when the session expires mid-visit', async () => {
    const p = props({ loadPlans: vi.fn().mockRejectedValue({ kind: 'expired_token' }) })
    view = await mount(<BillingPlansPage {...p} />).render()
    expect(view.text()).toContain('This billing link has expired')
    expect(view.text()).not.toContain('For your security, billing links are short-lived')
    expect(view.container.querySelector('[role="alert"] p')).toBeNull()
    expect(view.find('a', 'Sign in').getAttribute('href')).toBe('/login?next=%2Fbilling%2Fplans')
    expect(view.find('a', 'Sign in').className).toMatch(/statusSignIn/)
  })
  it('offers web sign-in when nothing is available', async () => {
    window.history.replaceState({}, '', '/zh-CN/billing/plans')
    view = await mount(<BillingPlansPage {...props()} />, { session: { authenticated: false } }).render()
    expect(view.find('a', '登录').getAttribute('href')).toBe('/zh-CN/login?next=%2Fzh-CN%2Fbilling%2Fplans')
  })
  it('waits for a handoff, then asks which account to use', async () => {
    window.history.replaceState({}, '', `/billing/plans#t=page-token&h=${code}`)
    let answer
    const exchange = vi.fn(() => new Promise((resolve) => { answer = resolve }))
    const p = props()
    view = await mount(<BillingPlansPage {...p} exchange={exchange} />).render()
    expect(view.container.querySelector('[role="status"]')).toBeTruthy()
    expect(p.loadPlans).not.toHaveBeenCalled()
    answer({ status: 'mismatch', target: 'plans', email: 'app@example.com', currentEmail: 'web@example.com' })
    await flush()
    expect(view.text()).toContain('Choose an account')
    await view.click(view.find('button', 'web@example.com'))
    expect(isSessionCredential(p.loadPlans.mock.calls[0][0])).toBe(true)
  })
})
