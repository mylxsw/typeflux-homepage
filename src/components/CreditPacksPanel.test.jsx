// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n/index.jsx'
import BillingPlansPage from './BillingPlansPage'
import CreditPacksPanel, { CREDIT_PACK_SELECTION_STORAGE_KEY } from './CreditPacksPanel'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.React = React

let root
let container

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
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
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('credit packs tab', () => {
  it('opens from the ?tab=credits deep link and renders balance and packs', async () => {
    const api = creditApi()
    const loadPlans = vi.fn()

    await renderPage('/billing/plans?tab=credits#t=billing-token', api, { loadPlans })

    expect(loadPlans).not.toHaveBeenCalled()
    expect(api.loadPacks).toHaveBeenCalledWith('billing-token', expect.objectContaining({ lang: 'en', signal: expect.any(AbortSignal) }))
    expect(window.location.search).toBe('?tab=credits')
    expect(window.location.hash).toBe('')
    expect(tab('Add-on credits').getAttribute('aria-selected')).toBe('true')
    expect(tab('Subscription plans').getAttribute('aria-selected')).toBe('false')
    expect(container.querySelector('h1').textContent).toBe('Top up your credits.')

    const balance = container.querySelector('section[aria-label="Your credit balance"]')
    expect(balance.textContent).toContain('Monthly remaining0')
    expect(balance.textContent).toContain('Add-on remaining128,400')
    expect(balance.textContent).toMatch(/100,000 on Mar 1, 2027/)

    const cards = packCards()
    expect(cards).toHaveLength(4)
    expect(cards[0].textContent).toContain('$5')
    expect(cards[0].textContent).toContain('100,000 credits')
    expect(cards[0].textContent).not.toContain('bonus')
    expect(cards[1].textContent).toContain('Recommended')
    expect(cards[1].textContent).toContain('+10% bonus')
    expect(cards[2].textContent).toContain('+15% bonus')
    expect(cards[3].textContent).toContain('+25% bonus')
    expect(cards[3].textContent).toContain('Valid for 365 days')
    expect(radio('pack_m').checked).toBe(true)
  })

  it('summarizes the balance, unit prices, and the selected order', async () => {
    await renderPage('/billing/plans?tab=credits#t=billing-token', creditApi())

    const balance = container.querySelector('section[aria-label="Your credit balance"]')
    expect(balance.textContent).toContain('Available credits128,400')
    expect(balance.textContent).toContain('Usage order')

    const cards = packCards()
    expect(cards[0].textContent).toContain('$0.50 per 10k credits')
    expect(cards[3].textContent).toContain('$0.40 per 10k credits')
    expect(cards[3].textContent).toContain('Best value')
    expect(cards[1].textContent).not.toContain('Best value')

    const summary = container.querySelector('aside[aria-label="Order summary"]')
    expect(summary.textContent).toContain('PackMedium')
    expect(summary.textContent).toContain('Credits220,000')
    expect(summary.textContent).toContain('Valid for365 days')
    expect(summary.textContent).toContain('Balance after purchase348,400')
    expect(summary.textContent).toContain('Total$10')

    await click(radio('pack_xl'))
    expect(summary.textContent).toContain('Balance after purchase1,378,400')
  })

  it('links from the upsell back to subscription plans', async () => {
    const loadPlans = vi.fn().mockResolvedValue({ billingEnabled: true, plans: [], currentSubscription: null })
    await renderPage('/billing/plans?tab=credits#t=billing-token', creditApi(), { loadPlans })

    await click(buttonByText('View subscription plans'))

    expect(window.location.search).toBe('')
    expect(tab('Subscription plans').getAttribute('aria-selected')).toBe('true')
    expect(loadPlans).toHaveBeenCalledTimes(1)
  })

  it('requires agreeing to the no-refund policy before buying', async () => {
    const api = creditApi()
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)

    expect(container.textContent).toContain('One-time purchase. Non-refundable after purchase. Valid for 365 days.')
    const buy = buyButton()
    expect(buy.textContent).toBe('Buy 220,000 credits · $10')
    expect(buy.disabled).toBe(true)

    await click(buy)
    expect(api.createCheckout).not.toHaveBeenCalled()

    await agree()
    expect(buyButton().disabled).toBe(false)
    await agree()
    expect(buyButton().disabled).toBe(true)
  })

  it('creates one checkout per click with a fresh request ID and remembers the pack', async () => {
    let resolveCheckout
    const api = creditApi({
      createCheckout: vi.fn(() => new Promise((resolve) => { resolveCheckout = resolve })),
    })
    const redirect = vi.fn()
    await renderPage('/billing/plans?tab=credits#t=billing-token', { ...api, redirect })

    await click(radio('pack_l'))
    await agree()
    expect(buyButton().textContent).toBe('Buy 460,000 credits · $20')

    await click(buyButton())
    await click(buyButton())
    expect(api.createCheckout).toHaveBeenCalledTimes(1)
    expect(api.createCheckout).toHaveBeenCalledWith('billing-token', 'pack_l', 'request-1', { signal: expect.any(AbortSignal) })
    expect(buyButton().textContent).toBe('Opening Stripe…')
    expect(buyButton().disabled).toBe(true)
    expect(radio('pack_s').disabled).toBe(true)

    await act(async () => {
      resolveCheckout({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' })
      await Promise.resolve()
    })

    expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_1')
    expect(sessionStorage.getItem(CREDIT_PACK_SELECTION_STORAGE_KEY)).toBe('pack_l')

    // A page restored from the back/forward cache can buy again with a new ID.
    await act(async () => {
      window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true }))
    })
    await click(buyButton())
    expect(api.createCheckout).toHaveBeenLastCalledWith('billing-token', 'pack_l', 'request-2', { signal: expect.any(AbortSignal) })
  })

  it('reuses the request ID only when retrying after a transient failure', async () => {
    const api = creditApi({
      createCheckout: vi.fn()
        .mockRejectedValueOnce(apiError('network'))
        .mockRejectedValueOnce(apiError('rate_limited'))
        .mockRejectedValueOnce(apiError('request'))
        .mockResolvedValueOnce({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' }),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', { ...api, redirect: vi.fn() })
    await agree()

    await click(buyButton())
    expect(alertText()).toBe('Stripe Checkout could not be opened. Please try again.')
    await click(buyButton())
    expect(alertText()).toBe('You have reached the limit of 10 credit pack orders in 24 hours. Please try again later.')
    await click(buyButton())
    await click(buyButton())

    expect(api.createCheckout.mock.calls.map((call) => call[2])).toEqual(['request-1', 'request-1', 'request-2', 'request-3'])
  })

  it.each([false, true])('ignores an abandoned checkout response (retry: %s)', async (retry) => {
    let resolveCheckout
    const createCheckout = vi.fn(() => new Promise((resolve) => { resolveCheckout = resolve }))
    if (retry) createCheckout.mockRejectedValueOnce(apiError('network'))
    const redirect = vi.fn()
    const api = creditApi({ createCheckout, redirect })
    const loadPlans = vi.fn().mockResolvedValue({ billingEnabled: true, plans: [], currentSubscription: null })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api, { loadPlans })
    await agree()
    await click(buyButton())
    if (retry) await click(buyButton())
    await click(tab('Subscription plans'))

    await act(async () => { resolveCheckout({ id: 'cs_old', url: 'https://checkout.stripe.com/c/pay/cs_old' }) })
    await flush()

    expect(redirect).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(CREDIT_PACK_SELECTION_STORAGE_KEY)).toBeNull()
    expect(createCheckout.mock.calls.at(-1)[3].signal.aborted).toBe(true)
    expect(createCheckout.mock.calls.map((call) => call[2])).toEqual(retry ? ['request-1', 'request-1'] : ['request-1'])
  })

  it('does not expire a new panel when an abandoned checkout rejects late', async () => {
    let rejectCheckout
    const api = creditApi({ createCheckout: vi.fn(() => new Promise((resolve, reject) => { rejectCheckout = reject })) })
    const loadPlans = vi.fn().mockResolvedValue({ billingEnabled: true, plans: [], currentSubscription: null })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api, { loadPlans })
    await agree()
    await click(buyButton())
    await click(tab('Subscription plans'))
    await click(tab('Add-on credits'))
    await act(async () => { rejectCheckout(apiError('expired_token')) })
    await flush()

    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBe('billing-token')
    expect(api.createCheckout).toHaveBeenCalledTimes(1)
  })

  it('cancels the previous token checkout without invalidating the replacement purchase', async () => {
    const pending = []
    const redirect = vi.fn()
    const onExpired = vi.fn()
    const api = creditApi({ createCheckout: vi.fn(() => new Promise((resolve, reject) => { pending.push({ resolve, reject }) })) })
    root = createRoot(container)
    const renderPanel = async (token) => {
      await act(async () => { root.render(<CreditPacksPanel {...api} token={token} lang="en" redirect={redirect} onExpired={onExpired} />) })
      await flush()
    }
    await renderPanel('old-token')
    await agree()
    await click(buyButton())
    await renderPanel('new-token')
    expect(buyButton().disabled).toBe(false)
    await click(buyButton())
    await act(async () => { pending[0].reject(apiError('expired_token')) })
    await flush()

    expect(onExpired).not.toHaveBeenCalled()
    expect(buyButton().disabled).toBe(true)
    expect(api.createCheckout.mock.calls[0][3].signal.aborted).toBe(true)
    await act(async () => { pending[1].resolve({ id: 'cs_new', url: 'https://checkout.stripe.com/c/pay/cs_new' }) })
    await flush()
    expect(api.createCheckout.mock.calls.map((call) => call.slice(0, 3))).toEqual([
      ['old-token', 'pack_m', 'request-1'], ['new-token', 'pack_m', 'request-2'],
    ])
    expect(redirect).toHaveBeenCalledExactlyOnceWith('https://checkout.stripe.com/c/pay/cs_new')
  })

  it('retries the same purchase when navigation fails after checkout creation', async () => {
    const redirect = vi.fn().mockImplementationOnce(() => { throw new Error('navigation blocked') })
    const api = creditApi({ redirect })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)
    await agree()
    await click(buyButton())
    expect(alertText()).toBe('Stripe Checkout could not be opened. Please try again.')
    expect(buyButton().disabled).toBe(false)
    await click(buyButton())

    expect(api.createCheckout.mock.calls.map((call) => call[2])).toEqual(['request-1', 'request-1'])
    expect(redirect).toHaveBeenCalledTimes(2)
  })

  it('silently releases an aborted request and preserves its retry identity', async () => {
    const redirect = vi.fn()
    const api = creditApi({
      redirect,
      createCheckout: vi.fn()
        .mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'))
        .mockResolvedValueOnce({ id: 'cs_retry', url: 'https://checkout.stripe.com/c/pay/cs_retry' }),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)
    await agree()
    await click(buyButton())
    expect(alertText()).toBeUndefined()
    expect(buyButton().disabled).toBe(false)
    await click(buyButton())
    expect(api.createCheckout.mock.calls.map((call) => call[2])).toEqual(['request-1', 'request-1'])
    expect(redirect).toHaveBeenCalledExactlyOnceWith('https://checkout.stripe.com/c/pay/cs_retry')
  })

  it('explains customer reconciliation and keeps the same purchase identity', async () => {
    const api = creditApi({
      createCheckout: vi.fn()
        .mockRejectedValueOnce(apiError('reconciliation_required', 'BILLING_CUSTOMER_RECONCILIATION_REQUIRED'))
        .mockResolvedValueOnce({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' }),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', { ...api, redirect: vi.fn() })
    await agree()

    await click(buyButton())
    expect(alertText()).toBe('Billing setup for your account needs a quick check by our support team. Please contact support before trying again.')
    await click(buyButton())

    expect(api.createCheckout.mock.calls.map((call) => call[2])).toEqual(['request-1', 'request-1'])
  })

  it('starts a new request after the server reports the attempt expired', async () => {
    const api = creditApi({
      createCheckout: vi.fn()
        .mockRejectedValueOnce(apiError('conflict', 'CREDIT_PACK_REQUEST_EXPIRED'))
        .mockResolvedValueOnce({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' }),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', { ...api, redirect: vi.fn() })
    await agree()

    await click(buyButton())
    expect(alertText()).toBe('That checkout attempt has expired. Please start a new purchase.')

    await click(radio('pack_s'))
    expect(container.querySelector('[role="alert"]')).toBeNull()
    await click(buyButton())
    expect(api.createCheckout).toHaveBeenLastCalledWith('billing-token', 'pack_s', 'request-2', { signal: expect.any(AbortSignal) })
  })

  it('disables purchasing when billing is turned off', async () => {
    const api = creditApi({ loadPacks: vi.fn().mockResolvedValue(packResponse({ billingEnabled: false })) })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)

    expect(container.textContent).toContain('Billing is temporarily unavailable. You can still review credit packs, but checkout is disabled.')
    expect(packCards().every((card) => card.querySelector('input').disabled)).toBe(true)
    await agree()
    expect(buyButton().disabled).toBe(true)
    expect(buyButton().textContent).toBe('Choose a credit pack')
  })

  it('disables purchasing when checkout reports billing was turned off', async () => {
    const api = creditApi({ createCheckout: vi.fn().mockRejectedValue(apiError('billing_disabled', 'BILLING_DISABLED')) })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)
    await agree()

    await click(buyButton())

    expect(alertText()).toBe('Billing is temporarily disabled. Please try again later.')
    expect(buyButton().disabled).toBe(true)
    expect(container.textContent).toContain('Billing is temporarily unavailable.')
  })

  it('marks packs without a configured price as unavailable', async () => {
    const response = packResponse()
    response.packs[0] = { ...response.packs[0], available: false, priceCents: 0 }
    const api = creditApi({ loadPacks: vi.fn().mockResolvedValue(response) })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)

    expect(packCards()[0].textContent).toContain('—')
    expect(packCards()[0].textContent).toContain('Unavailable')
    expect(radio('pack_s').disabled).toBe(true)
    // Bonus percentages are relative to the first purchasable pack.
    expect(packCards()[1].textContent).not.toContain('bonus')
    expect(packCards()[2].textContent).toContain('+5% bonus')
  })

  it('shows the expired-link panel when the token expires while loading packs', async () => {
    const api = creditApi({ loadPacks: vi.fn().mockRejectedValue(apiError('expired_token')) })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)

    expect(container.textContent).toContain('This billing link has expired')
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBeNull()
  })

  it('shows the expired-link panel when the token expires at checkout', async () => {
    const api = creditApi({ createCheckout: vi.fn().mockRejectedValue(apiError('expired_token')) })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)
    await agree()

    await click(buyButton())

    expect(container.textContent).toContain('This billing link has expired')
    expect(packCards()).toHaveLength(0)
  })

  it('retries after a failed pack load and handles an empty catalog', async () => {
    const api = creditApi({
      loadPacks: vi.fn()
        .mockRejectedValueOnce(apiError('network'))
        .mockResolvedValueOnce(packResponse({ packs: [] })),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)

    expect(container.textContent).toContain('Credit packs are temporarily unavailable')
    await click(buttonByText('Try again'))

    expect(api.loadPacks).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('No credit packs are available')
  })

  it('shows unlimited monthly credits and no upcoming expiry', async () => {
    const response = packResponse()
    response.credits = {
      ...response.credits,
      limit: -1,
      unlimited: true,
      addon: { balance: 0, usedThisPeriod: 0, remaining: 0, nextExpiry: null },
    }
    await renderPage('/billing/plans?tab=credits#t=billing-token', creditApi({ loadPacks: vi.fn().mockResolvedValue(response) }))

    const balance = container.querySelector('section[aria-label="Your credit balance"]')
    expect(balance.textContent).toContain('Monthly remainingUnlimited')
    expect(balance.textContent).toContain('Nothing expiring')
  })

  it('restores the previous selection after a canceled checkout', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'billing-token')
    sessionStorage.setItem(CREDIT_PACK_SELECTION_STORAGE_KEY, 'pack_xl')
    const api = creditApi()

    await renderPage('/billing/plans?tab=credits&checkout=cancel', api)

    expect(container.textContent).toContain('Checkout was canceled and no payment was made. Your selection has been kept.')
    expect(radio('pack_xl').checked).toBe(true)
    expect(buyButton().textContent).toBe('Buy 1,250,000 credits · $50')
  })

  it('ignores a stored selection on a normal visit', async () => {
    sessionStorage.setItem(CREDIT_PACK_SELECTION_STORAGE_KEY, 'pack_xl')
    await renderPage('/billing/plans?tab=credits#t=billing-token', creditApi())

    expect(radio('pack_m').checked).toBe(true)
  })
})

describe('credit pack checkout result', () => {
  it('polls pending until granted, then refreshes the balance', async () => {
    vi.useFakeTimers()
    sessionStorage.setItem('typeflux.billingPageToken', 'billing-token')
    sessionStorage.setItem(CREDIT_PACK_SELECTION_STORAGE_KEY, 'pack_m')
    const api = creditApi({
      pollIntervalMs: 2000,
      loadStatus: vi.fn()
        .mockResolvedValueOnce({ id: 'cs_1', status: 'pending' })
        .mockResolvedValueOnce({ id: 'cs_1', status: 'pending' })
        .mockResolvedValueOnce({ id: 'cs_1', status: 'granted' }),
    })

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1', api)
    expect(resultCard().textContent).toContain('Confirming your payment')
    expect(api.loadStatus).toHaveBeenCalledTimes(1)

    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
    expect(resultCard().textContent).toContain('Confirming your payment')
    expect(api.loadStatus).toHaveBeenCalledTimes(2)
    await act(async () => { await vi.advanceTimersByTimeAsync(2000) })

    expect(api.loadStatus).toHaveBeenCalledTimes(3)
    expect(api.loadStatus).toHaveBeenCalledWith('billing-token', 'cs_1', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(resultCard().textContent).toContain('220,000 credits have been added to your account.')
    expect(resultCard().querySelector('a').getAttribute('href')).toBe('typeflux://billing/return')
    expect(api.loadPacks).toHaveBeenCalledTimes(2)
    expect(sessionStorage.getItem(CREDIT_PACK_SELECTION_STORAGE_KEY)).toBeNull()
  })

  it('confirms a grant without an amount when history cannot be read', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'billing-token')
    const api = creditApi({
      loadStatus: vi.fn().mockResolvedValue({ id: 'cs_1', status: 'granted' }),
      loadGrants: vi.fn().mockRejectedValue(apiError('network')),
    })

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1', api)
    await flushUntil(() => resultCard().textContent.includes('Credits added'))

    expect(resultCard().textContent).toContain('Your add-on credits have been added to your account.')
  })

  it('reports a failed payment and keeps the pack selected for a retry', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'billing-token')
    sessionStorage.setItem(CREDIT_PACK_SELECTION_STORAGE_KEY, 'pack_s')
    const api = creditApi({
      loadStatus: vi.fn()
        .mockResolvedValueOnce({ id: 'cs_1', status: 'pending' })
        .mockResolvedValueOnce({ id: 'cs_1', status: 'failed' }),
    })

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1', api)
    await flushUntil(() => resultCard().textContent.includes('Payment was not completed'))

    expect(resultCard().querySelector('a')).toBeNull()
    expect(radio('pack_s').checked).toBe(true)
  })

  it('stops polling after the attempt limit and lets the user check again', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'billing-token')
    const api = creditApi({
      loadStatus: vi.fn()
        .mockResolvedValueOnce({ id: 'cs_1', status: 'pending' })
        .mockRejectedValueOnce(apiError('network'))
        .mockResolvedValueOnce({ id: 'cs_1', status: 'pending' })
        .mockResolvedValueOnce({ id: 'cs_1', status: 'granted' }),
    })

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1', { ...api, maxPollAttempts: 3 })
    await flushUntil(() => resultCard().textContent.includes('Payment is still processing'))
    expect(api.loadStatus).toHaveBeenCalledTimes(3)

    await click(buttonByText('Check again'))
    await flushUntil(() => resultCard().textContent.includes('Credits added'))
    expect(api.loadStatus).toHaveBeenCalledTimes(4)
  })

  it('falls back to an unverified notice when the token expires during polling', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'billing-token')
    const api = creditApi({ loadStatus: vi.fn().mockRejectedValue(apiError('expired_token')) })

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1', api)
    await flushUntil(() => resultCard().textContent.includes('Payment submitted'))

    expect(resultCard().querySelector('a').getAttribute('href')).toBe('typeflux://billing/return')
  })

  it('keeps the unverified return action when the catalog and status requests both reject an expired token', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'expired-token')
    const api = creditApi({
      loadPacks: vi.fn().mockRejectedValue(apiError('expired_token')),
      loadStatus: vi.fn().mockRejectedValue(apiError('expired_token')),
    })

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1', api)

    expect(resultCard().textContent).toContain('Payment submitted')
    expect(resultCard().querySelector('a').getAttribute('href')).toBe('typeflux://billing/return')
    expect(container.textContent).not.toContain('This billing link has expired')
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBeNull()
    expect(api.loadPacks).toHaveBeenCalledTimes(1)
    expect(api.loadStatus).toHaveBeenCalledTimes(1)
    expect(api.loadGrants).not.toHaveBeenCalled()
  })

  it('acknowledges the payment without API calls when the token is gone', async () => {
    const api = creditApi()

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1', api)

    expect(resultCard().textContent).toContain('Payment submitted')
    expect(container.textContent).not.toContain('Open this page from Typeflux')
    expect(api.loadPacks).not.toHaveBeenCalled()
    expect(api.loadStatus).not.toHaveBeenCalled()
  })

  it('asks for a fresh link when the token is gone on a normal visit', async () => {
    await renderPage('/billing/plans?tab=credits', creditApi())

    expect(container.textContent).toContain('Open this page from Typeflux')
    expect(container.querySelector('[role="status"][aria-live]')).toBeNull()
  })
})

describe('credit pack purchase history', () => {
  it('loads on expand, labels statuses, and pages with the cursor', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-10-08T00:00:00Z'))
    const api = creditApi({
      loadGrants: vi.fn()
        .mockResolvedValueOnce({
          items: [
            grant({ id: 'g1', packCode: 'pack_m', credits: 220000, remaining: 100000 }),
            grant({ id: 'g2', packCode: 'pack_s', expiresAt: '2026-01-01T00:00:00Z' }),
            grant({ id: 'g3', packCode: 'pack_l', status: 'frozen' }),
          ],
          nextCursor: 'g3',
        })
        .mockResolvedValueOnce({ items: [grant({ id: 'g4', source: 'admin', packCode: 'manual', status: 'revoked' })], nextCursor: '' }),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)

    const toggle = buttonByText('Purchase history')
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(api.loadGrants).not.toHaveBeenCalled()

    await click(toggle)

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(api.loadGrants).toHaveBeenCalledWith('billing-token', expect.objectContaining({ limit: 20 }))
    const rows = () => [...container.querySelectorAll('tbody tr')]
    expect(rows()).toHaveLength(3)
    expect(rows()[0].textContent).toContain('Medium')
    expect(rows()[0].textContent).toContain('220,000')
    expect(rows()[0].textContent).toContain('100,000')
    expect(rows()[0].textContent).toContain('Active')
    expect(rows()[1].textContent).toContain('Expired')
    expect(rows()[2].textContent).toContain('Frozen')

    await click(buttonByText('Load more'))

    expect(api.loadGrants).toHaveBeenLastCalledWith('billing-token', { cursor: 'g3', limit: 20 })
    expect(rows()).toHaveLength(4)
    expect(rows()[3].textContent).toContain('Compensation')
    expect(rows()[3].textContent).toContain('Revoked')
    expect(buttonByText('Load more')).toBeUndefined()

    await click(toggle)
    expect(container.querySelector('table')).toBeNull()
  })

  it('shows empty and error states', async () => {
    const api = creditApi({
      loadGrants: vi.fn()
        .mockResolvedValueOnce({ items: [], nextCursor: '' })
        .mockRejectedValueOnce(apiError('network')),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)

    await click(buttonByText('Purchase history'))
    expect(container.textContent).toContain('No credit pack purchases yet.')

    await click(buttonByText('Purchase history'))
    await click(buttonByText('Purchase history'))
    expect(container.textContent).toContain('Purchase history could not be loaded.')
  })

  it('reports a failed next page and an expired token', async () => {
    const api = creditApi({
      loadGrants: vi.fn()
        .mockResolvedValueOnce({ items: [grant({ id: 'g1' })], nextCursor: 'g1' })
        .mockRejectedValueOnce(apiError('network'))
        .mockRejectedValueOnce(apiError('expired_token')),
    })
    await renderPage('/billing/plans?tab=credits#t=billing-token', api)
    await click(buttonByText('Purchase history'))

    await click(buttonByText('Load more'))
    expect(container.textContent).toContain('Purchase history could not be loaded.')

    await click(buttonByText('Purchase history'))
    await click(buttonByText('Purchase history'))
    expect(container.textContent).toContain('This billing link has expired')
  })
})

describe('billing tabs', () => {
  it('switches tabs, updates the URL, and drops checkout return parameters', async () => {
    sessionStorage.setItem('typeflux.billingPageToken', 'billing-token')
    const api = creditApi({ loadStatus: vi.fn().mockResolvedValue({ id: 'cs_1', status: 'failed' }) })
    const loadPlans = vi.fn().mockResolvedValue({ billingEnabled: true, plans: [], currentSubscription: null })

    await renderPage('/billing/plans?tab=credits&checkout=success&session_id=cs_1&ref=app', api, { loadPlans })
    await click(tab('Subscription plans'))

    expect(window.location.search).toBe('?ref=app')
    expect(loadPlans).toHaveBeenCalledTimes(1)
    expect(container.querySelector('h1').textContent).toContain('We’ll type.')

    await click(tab('Subscription plans'))
    expect(loadPlans).toHaveBeenCalledTimes(1)

    await click(tab('Add-on credits'))
    expect(window.location.search).toBe('?ref=app&tab=credits')
    expect(container.textContent).not.toContain('Payment was not completed')
    expect(api.loadStatus).toHaveBeenCalledTimes(1)
  })

  it('renders the Chinese copy, including the no-refund policy', async () => {
    await renderPage('/zh-CN/billing/plans?tab=credits#t=billing-token', creditApi())

    expect(tab('加购额度').getAttribute('aria-selected')).toBe('true')
    expect(tab('订阅套餐')).toBeDefined()
    expect(container.textContent).toContain('一次性购买，购买后不支持退款，有效期 365 天。')
    expect(container.textContent).toContain('月度剩余')
    expect(container.textContent).toContain('加购剩余')
    expect(container.textContent).toContain('最近一次到期')
    expect(container.textContent).toContain('多送 10%')
  })

  it('uses local pack names where the API has no translation', async () => {
    await renderPage('/ja/billing/plans?tab=credits#t=billing-token', creditApi())

    expect(packCards()[1].textContent).toContain('ミディアム')
    expect(container.textContent).toContain('一回限りの購入です。購入後の返金はできません。')
  })
})

async function renderPage(path, api, pageProps = {}) {
  window.history.replaceState({}, '', path)
  const { redirect = vi.fn(), ...creditPackProps } = api
  root = createRoot(container)
  await act(async () => {
    root.render(
      <I18nProvider>
        <BillingPlansPage
          redirect={redirect}
          loadCredits={creditPackProps.loadPacks}
          creditPackProps={{ redirect, pollIntervalMs: 1, ...creditPackProps }}
          {...pageProps}
        />
      </I18nProvider>,
    )
    await Promise.resolve()
  })
  await flush()
}

function creditApi(overrides = {}) {
  let requestCount = 0
  return {
    loadPacks: vi.fn().mockResolvedValue(packResponse()),
    createCheckout: vi.fn().mockResolvedValue({ id: 'cs_1', url: 'https://checkout.stripe.com/c/pay/cs_1' }),
    loadGrants: vi.fn().mockResolvedValue({ items: [grant({ id: 'g1', sessionId: 'cs_1' })], nextCursor: '' }),
    loadStatus: vi.fn().mockResolvedValue({ id: 'cs_1', status: 'pending' }),
    newRequestId: vi.fn(() => `request-${++requestCount}`),
    ...overrides,
  }
}

function packResponse({ billingEnabled = true, packs } = {}) {
  return {
    billingEnabled,
    packs: packs ?? [
      pack('pack_s', 'Small', 100000, 500, 0),
      { ...pack('pack_m', 'Medium', 220000, 1000, 1), highlight: true },
      pack('pack_l', 'Large', 460000, 2000, 2),
      pack('pack_xl', 'Extra large', 1250000, 5000, 3),
    ].map((item) => (billingEnabled ? item : { ...item, available: false, priceCents: 0 })),
    credits: {
      limit: 300000,
      used: 300000,
      remaining: 0,
      unlimited: false,
      totalRemaining: 128400,
      addon: {
        balance: 220000,
        usedThisPeriod: 91600,
        remaining: 128400,
        nextExpiry: { credits: 100000, expiresAt: '2027-03-01T12:00:00Z' },
      },
    },
  }
}

function pack(code, name, credits, priceCents, sortOrder) {
  return {
    code, name, description: `${name} pack`, credits, validDays: 365, sortOrder,
    highlight: false, available: true, priceCents, currency: 'USD',
  }
}

function grant(overrides) {
  return {
    id: 'g', source: 'stripe', packCode: 'pack_m', credits: 220000, remaining: 220000, amountCents: 1000,
    currency: 'USD', sessionId: '', status: 'active',
    grantedAt: '2026-09-01T00:00:00Z', expiresAt: '2027-09-01T00:00:00Z',
    ...overrides,
  }
}

function apiError(kind, code = '') {
  return Object.assign(new Error(kind), { kind, code })
}

function tab(label) {
  return [...container.querySelectorAll('[role="tab"]')].find((button) => button.textContent === label)
}

function packCards() {
  return [...container.querySelectorAll('input[name="credit-pack"]')].map((input) => input.closest('label'))
}

function radio(code) {
  return container.querySelector(`input[name="credit-pack"][value="${code}"]`)
}

function buyButton() {
  return container.querySelector('input[type="checkbox"]').closest('div').querySelector('button')
}

function buttonByText(text) {
  return [...container.querySelectorAll('button')].find((button) => button.textContent.startsWith(text))
}

function alertText() {
  return container.querySelector('[role="alert"]')?.textContent
}

function resultCard() {
  return container.querySelector('section[role="status"]')
}

async function agree() {
  await click(container.querySelector('input[type="checkbox"]'))
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await Promise.resolve()
  })
  await flush()
}

async function flush() {
  for (let index = 0; index < 3; index += 1) {
    await act(async () => { await Promise.resolve() })
  }
}

async function flushUntil(predicate, attempts = 50) {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) return
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 2)) })
  }
  throw new Error('condition not reached')
}
