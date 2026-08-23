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

  it('renders plans, recommendation, benefits, and the comparison table', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const loadPlans = vi.fn().mockResolvedValue(planResponse())

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(window.location.hash).toBe('')
    expect(sessionStorage.getItem('typeflux.billingPageToken')).toBe('billing-token')
    expect(container.textContent).toContain('Recommended')
    expect(container.textContent).toContain('Pro')
    const proHeading = [...container.querySelectorAll('h2')].find((heading) => heading.textContent === 'Pro')
    expect(proHeading.nextElementSibling.textContent).toBe('Do more with AI')
    expect(proHeading.nextElementSibling.nextElementSibling.textContent).toBe('For daily use')
    expect(container.textContent).toContain('$12')
    expect(container.textContent).toContain('Fast transcription')
    expect(container.textContent).toContain('See every plan side by side')
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

    const chooseButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Choose plan')
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
    const chooseButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Choose plan')
    await act(async () => {
      chooseButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })

    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro', 'month')
    expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_123')
  })

  it('switches a plan to yearly pricing before checkout', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_year')

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect: vi.fn() })
    const yearButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'year')
    await act(async () => {
      yearButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(container.textContent).toContain('$120')
    expect(container.textContent).toContain('Save 17%')

    const chooseButton = [...container.querySelectorAll('button')].find((button) => button.textContent === 'Choose plan')
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
    ['zh-TW', '專業版', '運用 AI 高效完成更多工作', '每月 123,456 AI 點數'],
    ['ja', 'Pro', 'AI でより多くの仕事を効率よく', '毎月 123,456 AI クレジット'],
    ['ko', '프로', 'AI로 더 많은 작업을 효율적으로', '매월 123,456 AI 크레딧'],
  ])('maps plan content for the %s fallback locale with dynamic credits', async (lang, name, tagline, feature) => {
    localStorage.setItem('typeflux-language', lang)
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans[1].monthlyCredits = 123456
    const loadPlans = vi.fn().mockResolvedValue(response)

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ lang }))
    expect(container.textContent).toContain(name)
    expect(container.textContent).toContain(tagline)
    expect(container.textContent).toContain(feature)
    expect(container.textContent).not.toContain('90,000 AI credits')
  })

  it('uses API-provided Simplified Chinese plan content directly', async () => {
    localStorage.setItem('typeflux-language', 'zh-CN')
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans[0] = {
      ...response.plans[0], name: '免费版', tagline: '从这里开始', description: '适合轻度个人使用', features: ['每月 4,500 AI 积分'],
    }
    response.plans[1] = {
      ...response.plans[1], name: 'API 专业版', tagline: 'API 中文副标题', description: 'API 中文详细说明', features: ['每月 90,000 AI 积分'],
    }
    const loadPlans = vi.fn().mockResolvedValue(response)

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ lang: 'zh-CN' }))
    expect(container.textContent).toContain('API 专业版')
    expect(container.textContent).toContain('API 中文副标题')
    expect(container.textContent).toContain('API 中文详细说明')
    expect(container.textContent).toContain('每月 90,000 AI 积分')
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
        features: ['Basic transcription'], highlight: false, priceCents: 0,
    currency: 'USD', monthlyCredits: 4500, currentPlan: true, prices: [],
      },
      {
        code: 'pro', name: 'Pro', tagline: 'Do more with AI', description: 'For daily use', interval: 'month',
        features: ['Basic transcription', 'Fast transcription'], highlight: true,
    priceCents: 1200, currency: 'USD', monthlyCredits: 90000, currentPlan: false,
    prices: [
      { interval: 'month', priceCents: 1200, currency: 'USD', default: true, current: false, discountPercent: 0 },
      { interval: 'year', priceCents: 12000, currency: 'USD', default: false, current: false, discountPercent: 17 },
    ],
      },
    ],
  }
}
