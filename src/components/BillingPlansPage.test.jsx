// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../i18n/index.jsx'
import BillingPlansPage from './BillingPlansPage'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.React = React

let root
let container

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState({}, '', '/billing/plans')
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

describe('BillingPlansPage', () => {
  it('shows guidance and skips the API call when no token is present', async () => {
    const loadPlans = vi.fn()

    await renderPage({ loadPlans })

    expect(container.textContent).toContain('Open this page from Typeflux')
    expect(loadPlans).not.toHaveBeenCalled()
  })

  it('renders plans, recommendation, benefits, and the comparison table', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const loadPlans = vi.fn().mockResolvedValue(planResponse())

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(window.location.hash).toBe('')
    expect(container.textContent).toContain('Recommended')
    expect(container.textContent).toContain('Pro')
    expect(container.textContent).toContain('$12')
    expect(container.textContent).toContain('Fast transcription')
    expect(container.textContent).toContain('See every plan side by side')
  })

  it('creates checkout for the selected plan and redirects to Stripe', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_123')
    const redirect = vi.fn()

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect })
    const chooseButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Choose plan')
    await act(async () => {
      chooseButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro')
    expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_123')
  })

  it('shows the expired-link state for an unauthorized token', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=expired')
    const error = Object.assign(new Error('expired'), { kind: 'expired_token' })

    await renderPage({ loadPlans: vi.fn().mockRejectedValue(error) })

    expect(container.textContent).toContain('This billing link has expired')
    expect(container.textContent).not.toContain('Try again')
  })

  it('retries after a network failure', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const loadPlans = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('offline'), { kind: 'network' }))
      .mockResolvedValueOnce(planResponse())

    await renderPage({ loadPlans })
    const retryButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Try again')
    await act(async () => {
      retryButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(loadPlans).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Pro')
  })
})

async function renderPage(props) {
  root = createRoot(container)
  await act(async () => {
    root.render(
      <I18nProvider>
        <BillingPlansPage {...props} />
      </I18nProvider>,
    )
    await Promise.resolve()
  })
}

function planResponse() {
  return {
    billingEnabled: true,
    currentSubscription: { plan_code: 'free', status: 'active' },
    plans: [
      {
        code: 'free', name: 'Free', description: 'Start speaking', interval: 'month',
        features: ['Basic transcription'], highlight: false, priceCents: 0,
        currency: 'USD', currentPlan: true,
      },
      {
        code: 'pro', name: 'Pro', description: 'For daily use', interval: 'month',
        features: ['Basic transcription', 'Fast transcription'], highlight: true,
        priceCents: 1200, currency: 'USD', currentPlan: false,
      },
    ],
  }
}
