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
  sessionStorage.clear()
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

  it('renders the highlighted plan, allowances, usage summary, and feature list', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const loadPlans = vi.fn().mockResolvedValue(planResponse())

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(window.location.hash).toBe('')
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBe('billing-token')
    expect(container.textContent).toContain('Most Popular')
    expect(container.textContent).toContain('Choose the plan that fits you.')
    expect(container.textContent).toContain('Pro')
    expect(container.textContent).toContain('Subscribe Monthly')
    const proHeading = [...container.querySelectorAll('h2')].find((heading) => heading.textContent === 'Pro')
    const proCard = proHeading.closest('article')
    expect(proHeading.nextElementSibling.textContent).toBe('Do more with AI')
    expect(proCard.textContent).not.toContain('For daily use')
    expect(proCard.className).toContain('highlighted')
    expect(proCard.textContent).toContain('$12')
    expect(proCard.textContent).toContain('90,000 Credits per month')
    expect(proCard.textContent).toContain('Accelerate: Up to 1200 images or 60 videos')
    expect(proCard.textContent).toContain('Legacy server feature')
    const maxCard = [...container.querySelectorAll('h2')]
      .find((heading) => heading.textContent === 'Max')
      .closest('article')
    expect(maxCard.className).not.toContain('highlighted')
    expect(maxCard.textContent).not.toContain('Accelerate: Up to 1200 images or 60 videos')
    const freeHeading = [...container.querySelectorAll('h2')].find((heading) => heading.textContent === 'Free')
    const freeCard = freeHeading.closest('article')
    expect(freeCard.textContent).not.toContain('For light personal use')
    expect(freeCard.textContent).toContain('$0/ month')
    expect(container.textContent).not.toContain('Compare Typeflux plans')
    expect(container.querySelector('table')).toBeNull()
  })

  it('uses isolated checkout button variants for featured, standard, and current plans', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()) })

    const cards = [...container.querySelectorAll('article')]
    const currentButton = cards[0].querySelector('button:disabled')
    const featuredButton = [...cards[1].querySelectorAll('button')]
      .find((button) => button.textContent === 'Subscribe Monthly')
    const standardButton = [...cards[2].querySelectorAll('button')]
      .find((button) => button.textContent === 'Subscribe Monthly')

    expect(currentButton.className).toContain('standardCheckoutButton')
    expect(featuredButton.className).toContain('featuredCheckoutButton')
    expect(featuredButton.className).not.toContain('btn-primary')
    expect(standardButton.className).toContain('standardCheckoutButton')
  })

  it('uses the first Stripe price currency for the free plan zero price', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans[0].currency = 'EUR'
    response.plans[1].prices[0].currency = 'SGD'

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(response) })

    const freeCard = [...container.querySelectorAll('h2')]
      .find((heading) => heading.textContent === 'Free')
      .closest('article')
    expect(freeCard.textContent).toContain('SGD 0/ month')
    expect(freeCard.textContent).not.toContain('EUR')
  })

  it('restores the token after refresh and uses it for checkout', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=refresh-token')
    const loadPlans = vi.fn().mockResolvedValue(planResponse())
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_refresh')

    await renderPage({ loadPlans, createCheckout, redirect: vi.fn() })
    act(() => root.unmount())
    root = undefined
    loadPlans.mockClear()

    await renderPage({ loadPlans, createCheckout, redirect: vi.fn() })
    expect(window.location.hash).toBe('')
    expect(loadPlans).toHaveBeenCalledWith('refresh-token', expect.objectContaining({ lang: 'en' }))

    const chooseButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Subscribe Monthly')
    await act(async () => {
      chooseButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })
    expect(createCheckout).toHaveBeenCalledWith('refresh-token', 'pro', 'month')
  })

  it('creates checkout for the selected plan and redirects to Stripe', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_123')
    const redirect = vi.fn()

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect })
    const chooseButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Subscribe Monthly')
    await act(async () => {
      chooseButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro', 'month')
    expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_123')
  })

  it('synchronizes card toggles, shows yearly monthly rates and original prices, and checks out yearly', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_year')

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect: vi.fn() })
    const yearlyButtons = [...container.querySelectorAll('button')]
      .filter((button) => button.textContent.startsWith('Billed Yearly'))
    expect(yearlyButtons).toHaveLength(2)
    expect(yearlyButtons[0].textContent).toContain('Save 17%')
    expect(yearlyButtons[0].getAttribute('aria-label')).toBe('Billed Yearly (17%off)')
    expect(yearlyButtons[1].textContent).toContain('Save 40%')
    expect(yearlyButtons.every((button) => button.getAttribute('aria-pressed') === 'false')).toBe(true)
    await act(async () => {
      yearlyButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(yearlyButtons.every((button) => button.getAttribute('aria-pressed') === 'true')).toBe(true)
    const proCard = [...container.querySelectorAll('h2')]
      .find((heading) => heading.textContent === 'Pro')
      .closest('article')
    expect(proCard.textContent).toContain('$4.17/ month')
    const proOriginalPrice = proCard.querySelector('del')
    expect(proOriginalPrice?.textContent).toBe('$12')
    expect(proOriginalPrice?.parentElement.className).toContain('priceComparison')
    expect(proCard.textContent).toContain('Subscribe Yearly')
    const maxCard = [...container.querySelectorAll('h2')]
      .find((heading) => heading.textContent === 'Max')
      .closest('article')
    expect(maxCard.textContent).toContain('$8.33/ month')
    expect(maxCard.querySelector('del')?.textContent).toBe('$24')

    const chooseButton = [...proCard.querySelectorAll('button')].find((button) => button.textContent === 'Subscribe Yearly')
    await act(async () => {
      chooseButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro', 'year')
  })

  it('shows the expired-link state for an unauthorized token', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=expired')
    const error = Object.assign(new Error('expired'), { kind: 'expired_token' })

    await renderPage({ loadPlans: vi.fn().mockRejectedValue(error) })

    expect(container.textContent).toContain('This billing link has expired')
    expect(container.textContent).not.toContain('Try again')
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBeNull()
  })

  it.each([
    ['zh-TW', '專業版', '運用 AI 高效完成更多工作', '每月 123,456 點數'],
    ['ja', 'Pro', 'AI でより多くの仕事を効率よく', '月 123,456 クレジット'],
    ['ko', '프로', 'AI로 더 많은 작업을 효율적으로', '월 123,456 크레딧'],
  ])('maps plan content for the %s fallback locale with dynamic credits', async (lang, name, tagline, creditLabel) => {
    localStorage.setItem('typeflux-language', lang)
    window.history.replaceState({}, '', `/${lang}/billing/plans#t=billing-token`)
    const response = planResponse()
    response.plans[1].monthlyCredits = 123456
    const loadPlans = vi.fn().mockResolvedValue(response)

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ lang }))
    expect(container.textContent).toContain(name)
    expect(container.textContent).toContain(tagline)
    expect(container.textContent).toContain(creditLabel)
    expect(container.textContent).not.toContain('90,000 Credits')
  })

  it('uses API-provided Simplified Chinese plan content directly', async () => {
    localStorage.setItem('typeflux-language', 'zh-CN')
    window.history.replaceState({}, '', '/zh-CN/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans[0] = {
      ...response.plans[0], name: '免费版', tagline: '从这里开始', description: '适合轻度个人使用',
    }
    response.plans[1] = {
      ...response.plans[1], name: 'API 专业版', tagline: 'API 中文副标题', description: 'API 中文详细说明',
    }
    const loadPlans = vi.fn().mockResolvedValue(response)

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ lang: 'zh-CN' }))
    expect(container.textContent).toContain('API 专业版')
    expect(container.textContent).toContain('API 中文副标题')
    expect(container.textContent).not.toContain('API 中文详细说明')
    expect(container.textContent).toContain('每月 90,000 积分')
    const freeCard = [...container.querySelectorAll('h2')]
      .find((heading) => heading.textContent === '免费版')
      .closest('article')
    expect(freeCard.textContent).toContain('US$0/ 月')
  })

  it('renders an unlimited credit allowance without exposing the API sentinel', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans[1].monthlyCredits = -1

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(response) })

    expect(container.textContent).toContain('Unlimited Credits per month')
    expect(container.textContent).not.toContain('-1 Credits')
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
        code: 'free', name: 'Free', tagline: 'Start here', description: 'For light personal use', interval: 'month',
        highlight: false, priceCents: 0,
    currency: 'USD', monthlyCredits: 4500, currentPlan: true, prices: [],
      },
      {
        code: 'pro', name: 'Pro', tagline: 'Do more with AI', description: 'For daily use', interval: 'month',
        usageSummary: 'Accelerate: Up to 1200 images or 60 videos', features: ['Legacy server feature'], highlight: true,
    priceCents: 1200, currency: 'USD', monthlyCredits: 90000, currentPlan: false,
    prices: [
      { interval: 'month', priceCents: 1200, currency: 'USD', default: true, current: false, discountPercent: 0 },
      { interval: 'year', priceCents: 5000, currency: 'USD', default: false, current: false, discountPercent: 17 },
    ],
      },
      {
        code: 'max', name: 'Max', tagline: 'For power users', description: 'For the heaviest usage', interval: 'month',
        features: ['Priority processing'], highlight: false, priceCents: 2400, currency: 'USD', monthlyCredits: 500000, currentPlan: false,
        prices: [
          { interval: 'month', priceCents: 2400, currency: 'USD', default: true, current: false, discountPercent: 0 },
          { interval: 'year', priceCents: 10000, currency: 'USD', default: false, current: false, discountPercent: 40 },
        ],
      },
    ],
  }
}
