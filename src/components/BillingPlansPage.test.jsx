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
    expect(container.querySelector('h1').textContent).toBe('Talk. We’ll type.For less than a coffee a month.')
    expect(container.textContent).toContain('Save up to 40% with yearly billing')
    expect(container.textContent).toContain('Pro')
    expect(container.textContent).toContain('Subscribe Monthly')
    const proHeading = [...container.querySelectorAll('h2')].find((heading) => heading.textContent === 'Pro')
    const proCard = proHeading.closest('article')
    expect(proHeading.nextElementSibling.textContent).toBe('Do more with AI')
    expect(proCard.textContent).not.toContain('For daily use')
    expect(proCard.className).toContain('highlighted')
    expect(proCard.textContent).toContain('$12')
    expect(proCard.textContent).toContain('≈ 25 hof cloud dictation / month')
    expect(proCard.textContent).toContain('~50 min a day · 90,000 credits')
    expect(proCard.textContent).toContain('Billed monthly · cancel anytime')
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
    expect(freeCard.textContent).toContain('4,500 Credits per month')
    expect(freeCard.textContent).toContain('Free forever')
    expect(freeCard.textContent).not.toContain('cloud dictation')
    const table = container.querySelector('table')
    expect([...table.querySelectorAll('thead th')].map((cell) => cell.textContent)).toEqual(['Free', 'Pro', 'Max'])
    const dictationRow = [...table.querySelectorAll('tbody tr')].find((row) => row.textContent.startsWith('Cloud dictation'))
    expect([...dictationRow.querySelectorAll('td')].map((cell) => cell.textContent)).toEqual(['—', '25 h', '139 h'])
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
    expect(createCheckout).toHaveBeenCalledWith('refresh-token', 'pro', 'month', { signal: expect.any(AbortSignal) })
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

    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro', 'month', { signal: expect.any(AbortSignal) })
    expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_123')
  })

  it('retries a pending checkout for the same selection and opens only the latest URL', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const pending = Object.assign(new Error('pending'), { kind: 'checkout_pending', code: 'BILLING_CHECKOUT_PENDING' })
    const createCheckout = vi.fn()
      .mockRejectedValueOnce(pending)
      .mockRejectedValueOnce(pending)
      .mockResolvedValueOnce('https://checkout.stripe.com/c/pay/cs_latest')
    const wait = vi.fn().mockResolvedValue(undefined)
    const redirect = vi.fn()

    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      createCheckout,
      redirect,
      wait,
      pendingRetryDelays: [1, 2, 3],
    })
    await click(buttonByText('Subscribe Monthly'))
    await flush()

    expect(createCheckout).toHaveBeenCalledTimes(3)
    expect(createCheckout.mock.calls.every((call) => call.slice(0, 3).join() === 'billing-token,pro,month')).toBe(true)
    expect(wait.mock.calls.map((call) => call[0])).toEqual([1, 2])
    expect(redirect).toHaveBeenCalledTimes(1)
    expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_latest')
  })

  it('keeps the selection and explains a checkout that stays pending', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const pending = Object.assign(new Error('pending'), { kind: 'checkout_pending' })
    const createCheckout = vi.fn().mockRejectedValue(pending)
    const redirect = vi.fn()

    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      createCheckout,
      redirect,
      wait: vi.fn().mockResolvedValue(undefined),
      pendingRetryDelays: [1, 1],
    })
    await click(container.querySelector('[role="switch"]'))
    await click(buttonByText('Subscribe Yearly'))
    await flush()

    expect(createCheckout).toHaveBeenCalledTimes(3)
    expect(redirect).not.toHaveBeenCalled()
    expect(container.querySelector('[role="alert"]').textContent).toContain('still being confirmed')
    // The yearly selection survives and the buttons are usable again.
    expect(container.querySelector('[role="switch"]').getAttribute('aria-checked')).toBe('true')
    expect(buttonByText('Subscribe Yearly').disabled).toBe(false)
  })

  it('explains that billing reconciliation needs support without retrying', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockRejectedValue(
      Object.assign(new Error('reconcile'), { kind: 'reconciliation_required' }),
    )
    const wait = vi.fn()

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, wait })
    await click(buttonByText('Subscribe Monthly'))

    expect(createCheckout).toHaveBeenCalledTimes(1)
    expect(wait).not.toHaveBeenCalled()
    expect(container.querySelector('[role="alert"]').textContent).toContain('contact support')
  })

  it('refreshes plans when the account already has a subscription', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const loadPlans = vi.fn().mockResolvedValue(planResponse())
    const createCheckout = vi.fn().mockRejectedValue(Object.assign(new Error('exists'), { kind: 'conflict' }))

    await renderPage({ loadPlans, createCheckout })
    await click(buttonByText('Subscribe Monthly'))
    await flush()

    expect(loadPlans).toHaveBeenCalledTimes(2)
    expect(container.querySelector('[role="alert"]').textContent).toContain('already has an active subscription')
  })

  it('stops a pending checkout backoff when the page unmounts', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockRejectedValue(Object.assign(new Error('pending'), { kind: 'checkout_pending' }))
    const redirect = vi.fn()
    vi.useFakeTimers()
    try {
      await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect })
      await click(buttonByText('Subscribe Monthly'))
      expect(createCheckout).toHaveBeenCalledTimes(1)

      act(() => root.unmount())
      root = undefined
      await act(async () => { await vi.runAllTimersAsync() })

      expect(createCheckout).toHaveBeenCalledTimes(1)
      expect(redirect).not.toHaveBeenCalled()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not redirect a first checkout request that resolves after unmount', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const request = deferredCheckout()
    const redirect = vi.fn()

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout: request.createCheckout, redirect })
    await click(buttonByText('Subscribe Monthly'))
    const [{ signal }] = request.calls
    expect(signal.aborted).toBe(false)

    act(() => root.unmount())
    root = undefined
    expect(signal.aborted).toBe(true)
    // A transport that ignores the abort still cannot open the late URL.
    await act(async () => { request.resolve('https://checkout.stripe.com/c/pay/cs_after_unmount') })
    await flush()

    expect(redirect).not.toHaveBeenCalled()
  })

  it('does not redirect or retry a pending retry request that resolves after unmount', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const request = deferredCheckout()
    const redirect = vi.fn()
    const wait = vi.fn().mockResolvedValue(undefined)

    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      createCheckout: request.createCheckout,
      redirect,
      wait,
      pendingRetryDelays: [1, 1],
    })
    await click(buttonByText('Subscribe Monthly'))
    await act(async () => { request.reject(Object.assign(new Error('pending'), { kind: 'checkout_pending' })) })
    await flush()
    expect(request.calls).toHaveLength(2)

    act(() => root.unmount())
    root = undefined
    expect(request.calls[1].signal.aborted).toBe(true)
    await act(async () => { request.reject(Object.assign(new Error('pending'), { kind: 'checkout_pending' })) })
    await flush()

    expect(request.calls).toHaveLength(2)
    expect(wait).toHaveBeenCalledTimes(1)
    expect(redirect).not.toHaveBeenCalled()
  })

  it('drops a plan checkout when the user switches to credit packs', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const request = deferredCheckout()
    const redirect = vi.fn()
    const creditPackProps = {
      loadPacks: vi.fn().mockResolvedValue({ billingEnabled: true, packs: [], credits: null }),
      redirect: vi.fn(),
    }

    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      createCheckout: request.createCheckout,
      redirect,
      creditPackProps,
    })
    await click(buttonByText('Subscribe Monthly'))
    await click(container.querySelector('#billing-tab-credits'))
    expect(container.querySelector('#billing-tab-credits').getAttribute('aria-selected')).toBe('true')
    expect(request.calls[0].signal.aborted).toBe(true)

    await act(async () => { request.resolve('https://checkout.stripe.com/c/pay/cs_after_tab_change') })
    await flush()
    expect(redirect).not.toHaveBeenCalled()
    expect(creditPackProps.redirect).not.toHaveBeenCalled()

    // Back on plans the buttons work again and ask the server for a fresh link.
    await click(container.querySelector('#billing-tab-plans'))
    expect(buttonByText('Subscribe Monthly').disabled).toBe(false)
    await click(buttonByText('Subscribe Monthly'))
    await act(async () => { request.resolve('https://checkout.stripe.com/c/pay/cs_current') })
    await flush()

    expect(request.calls).toHaveLength(2)
    expect(redirect).toHaveBeenCalledExactlyOnceWith('https://checkout.stripe.com/c/pay/cs_current')
  })

  it('ignores a late failure from a checkout abandoned by a tab switch', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const request = deferredCheckout()
    const loadPlans = vi.fn().mockResolvedValue(planResponse())

    await renderPage({
      loadPlans,
      createCheckout: request.createCheckout,
      redirect: vi.fn(),
      creditPackProps: { loadPacks: vi.fn().mockResolvedValue({ billingEnabled: true, packs: [], credits: null }) },
    })
    await click(buttonByText('Subscribe Monthly'))
    await click(container.querySelector('#billing-tab-credits'))
    await act(async () => { request.reject(Object.assign(new Error('exists'), { kind: 'conflict' })) })
    await click(container.querySelector('#billing-tab-plans'))
    await flush()

    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(buttonByText('Subscribe Monthly').disabled).toBe(false)
  })

  it('treats an abort error from the checkout request as a silent cancel', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn((token, plan, interval, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    }))
    const redirect = vi.fn()
    const wait = vi.fn()

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect, wait })
    await click(buttonByText('Subscribe Monthly'))
    act(() => root.unmount())
    root = undefined
    await flush()

    expect(createCheckout).toHaveBeenCalledTimes(1)
    expect(wait).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })

  it('does not request again when a custom wait resolves after the checkout was abandoned', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    let finishWait
    const wait = vi.fn(() => new Promise((resolve) => { finishWait = resolve }))
    const createCheckout = vi.fn().mockRejectedValue(Object.assign(new Error('pending'), { kind: 'checkout_pending' }))

    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      createCheckout,
      redirect: vi.fn(),
      wait,
      creditPackProps: { loadPacks: vi.fn().mockResolvedValue({ billingEnabled: true, packs: [], credits: null }) },
    })
    await click(buttonByText('Subscribe Monthly'))
    expect(wait).toHaveBeenCalledTimes(1)
    await click(container.querySelector('#billing-tab-credits'))
    await act(async () => { finishWait() })
    await flush()

    expect(createCheckout).toHaveBeenCalledTimes(1)
  })

  it('allows a new checkout after a failed one and keeps one request in flight', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const request = deferredCheckout()
    const redirect = vi.fn()

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout: request.createCheckout, redirect })
    await click(buttonByText('Subscribe Monthly'))
    await click(buttonByText('Upgrade to Pro'))
    expect(request.calls).toHaveLength(1)
    await act(async () => { request.reject(Object.assign(new Error('boom'), { kind: 'network' })) })
    await flush()
    expect(container.querySelector('[role="alert"]').textContent).toContain('could not be opened')

    await click(buttonByText('Subscribe Monthly'))
    await act(async () => { request.resolve('https://checkout.stripe.com/c/pay/cs_second') })
    await flush()

    expect(request.calls).toHaveLength(2)
    expect(request.calls[0].signal).not.toBe(request.calls[1].signal)
    expect(redirect).toHaveBeenCalledExactlyOnceWith('https://checkout.stripe.com/c/pay/cs_second')
  })

  it('shows the expired-link panel when checkout reports an expired token', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockRejectedValue(Object.assign(new Error('expired'), { kind: 'expired_token' }))
    const redirect = vi.fn()

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect })
    await click(buttonByText('Subscribe Monthly'))

    expect(redirect).not.toHaveBeenCalled()
    expect(container.textContent).toContain('This billing link has expired')
  })

  it('waits with real timers between pending retries', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('pending'), { kind: 'checkout_pending' }))
      .mockResolvedValueOnce('https://checkout.stripe.com/c/pay/cs_after_wait')
    const redirect = vi.fn()
    vi.useFakeTimers()
    try {
      await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect })
      await click(buttonByText('Subscribe Monthly'))
      await act(async () => { await vi.advanceTimersByTimeAsync(1999) })
      expect(createCheckout).toHaveBeenCalledTimes(1)
      await act(async () => { await vi.advanceTimersByTimeAsync(1) })
      expect(createCheckout).toHaveBeenCalledTimes(2)
      expect(redirect).toHaveBeenCalledWith('https://checkout.stripe.com/c/pay/cs_after_wait')
    } finally {
      vi.useRealTimers()
    }
  })

  it('switches every card to yearly with one toggle, shows savings, and checks out yearly', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_year')

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect: vi.fn() })
    const toggle = container.querySelector('[role="switch"]')
    expect(container.querySelectorAll('[role="switch"]')).toHaveLength(1)
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    expect(container.textContent).toContain('Save up to 40%')

    await click(toggle)
    expect(toggle.getAttribute('aria-checked')).toBe('true')
    const proCard = planCard('Pro')
    expect(proCard.textContent).toContain('$4.17/ month')
    const proOriginalPrice = proCard.querySelector('del')
    expect(proOriginalPrice?.textContent).toBe('$12')
    expect(proOriginalPrice?.parentElement.className).toContain('priceComparison')
    expect(proCard.textContent).toContain('Save 17%')
    expect(proCard.textContent).toContain('Billed $50 yearly')
    expect(proCard.textContent).toContain('Subscribe Yearly')
    const maxCard = planCard('Max')
    expect(maxCard.textContent).toContain('$8.33/ month')
    expect(maxCard.querySelector('del')?.textContent).toBe('$24')

    const chooseButton = [...proCard.querySelectorAll('button')].find((button) => button.textContent === 'Subscribe Yearly')
    await click(chooseButton)
    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro', 'year', { signal: expect.any(AbortSignal) })
  })

  it('selects an interval from its label and toggles back to monthly', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()) })
    const toggle = container.querySelector('[role="switch"]')
    await click(buttonByText('Yearly'))
    expect(toggle.getAttribute('aria-checked')).toBe('true')
    await click(toggle)
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    await click(toggle)
    await click(buttonByText('Monthly'))
    expect(toggle.getAttribute('aria-checked')).toBe('false')
    expect(planCard('Pro').textContent).toContain('$12/ month')
  })

  it('hides the interval switch when plans offer a single interval', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans.forEach((plan) => { plan.prices = plan.prices.filter((price) => price.interval === 'month') })

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(response), loadCredits: vi.fn().mockRejectedValue(new Error('offline')) })

    expect(container.querySelector('[role="switch"]')).toBeNull()
    expect(container.textContent).not.toContain('Save up to')
    expect(container.textContent).not.toContain('credits left this month')
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
    response.plans[0].monthlyCredits = 123456
    const loadPlans = vi.fn().mockResolvedValue(response)

    await renderPage({ loadPlans })

    expect(loadPlans).toHaveBeenCalledWith('billing-token', expect.objectContaining({ lang }))
    expect(container.textContent).toContain(name)
    expect(container.textContent).toContain(tagline)
    expect(container.textContent).toContain(creditLabel)
    expect(container.textContent).not.toContain('4,500')
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
    expect(container.textContent).toContain('每月 4,500 积分')
    expect(container.textContent).toContain('每天约 50 分钟 · 90,000 积分')
    expect(container.textContent).toContain('你说内容，我来打字')
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

describe('plan toolbar status', () => {
  it('shows remaining credits and add-on balance for the current plan and links to top-ups', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const loadCredits = vi.fn().mockResolvedValue(creditResponse({ limit: 4500, remaining: 3000, addon: 20000 }))

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), loadCredits })

    expect(loadCredits).toHaveBeenCalledWith('billing-token', expect.objectContaining({ lang: 'en', signal: expect.any(AbortSignal) }))
    const chip = statusChip()
    expect(chip.textContent).toContain('Free')
    expect(chip.textContent).toContain('3,000 credits left this month')
    expect(chip.textContent).toContain('+20,000 add-on')
    expect(chip.getAttribute('title')).toBe('33% of this month’s credits used')
    expect(chip.className).not.toContain('statusLow')

    await click(buttonByText('Top up'))
    expect(window.location.search).toBe('?tab=credits')
    expect(container.querySelector('[role="tab"][aria-selected="true"]').textContent).toBe('Add-on credits')
    expect(container.querySelector('h1').textContent).toBe('Top up your credits.')
    expect(container.textContent).toContain('One-time purchase · no auto-renewal')
  })

  it('warns when most monthly credits are used and handles unlimited balances', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      loadCredits: vi.fn().mockResolvedValue(creditResponse({ limit: 4500, remaining: 200, addon: 0 })),
    })
    expect(statusChip().className).toContain('statusLow')
    expect(statusChip().textContent).not.toContain('add-on')
    act(() => root.unmount())

    root = undefined
    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      loadCredits: vi.fn().mockResolvedValue(creditResponse({ limit: -1, remaining: 0, addon: 0, unlimited: true })),
    })
    expect(statusChip().textContent).toContain('Unlimited credits this month')
    expect(statusChip().getAttribute('title')).toBeNull()
  })

  it('omits the status chip when the balance cannot be loaded', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    await renderPage({
      loadPlans: vi.fn().mockResolvedValue(planResponse()),
      loadCredits: vi.fn().mockRejectedValue(Object.assign(new Error('offline'), { kind: 'network' })),
    })

    expect(statusChip()).toBeNull()
    expect(container.querySelector('[role="switch"]')).not.toBeNull()
  })
})

describe('plan estimator', () => {
  it('recommends the smallest paid plan that covers the estimate and reacts to input', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()) })

    const estimator = container.querySelector('section[aria-labelledby="plan-estimator-title"]')
    expect(estimator.textContent).toContain('Estimated 67,500 credits / month')
    expect(recommendation()).toBe('Pro')
    expect(estimator.textContent).toContain('Uses about 75% of its credits, leaving 25% headroom')
    expect(estimator.textContent).not.toContain('Free')

    await click(buttonByText('Often'))
    expect(estimator.textContent).toContain('Estimated 86,400 credits / month')
    expect(buttonByText('Often').getAttribute('aria-pressed')).toBe('true')

    await setSlider(120)
    expect(estimator.textContent).toContain('2 h')
    expect(recommendation()).toBe('Max')

    await setSlider(480)
    expect(recommendation()).toBe('Max + add-on')
    expect(estimator.textContent).toContain('beyond Max')
    expect(estimator.textContent).toContain('>999%')
  })

  it('scrolls to and highlights the recommended plan', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 0 })

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()) })
    await click(buttonByText('Choose Pro'))

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
    expect(planCard('Pro').className).toContain('pulse')
    delete Element.prototype.scrollIntoView
  })

  it('treats an unlimited plan as always fitting and hides without paid plans', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans[2].monthlyCredits = -1
    await renderPage({ loadPlans: vi.fn().mockResolvedValue(response) })
    await setSlider(480)
    expect(recommendation()).toBe('Max')
    expect(container.textContent).toContain('Unlimited credits — no need to watch your usage.')
    act(() => root.unmount())

    root = undefined
    const freeOnly = planResponse()
    freeOnly.plans = [freeOnly.plans[0]]
    await renderPage({ loadPlans: vi.fn().mockResolvedValue(freeOnly) })
    expect(container.querySelector('section[aria-labelledby="plan-estimator-title"]')).toBeNull()
  })
})

describe('final call to action', () => {
  it('quotes the daily yearly price of the highlighted plan and checks out yearly', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_final')

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(planResponse()), createCheckout, redirect: vi.fn() })

    expect(container.textContent).toContain('Yearly Pro costs just $0.14 a day.')
    await click(buttonByText('Upgrade to Pro'))
    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro', 'year', { signal: expect.any(AbortSignal) })
  })

  it('falls back to monthly checkout and hides for subscribers of the plan', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const monthlyOnly = planResponse()
    monthlyOnly.plans[1].prices = [monthlyOnly.plans[1].prices[0]]
    monthlyOnly.plans[2].prices = [monthlyOnly.plans[2].prices[0]]
    const createCheckout = vi.fn().mockResolvedValue('https://checkout.stripe.com/c/pay/cs_month')
    await renderPage({ loadPlans: vi.fn().mockResolvedValue(monthlyOnly), createCheckout, redirect: vi.fn() })
    expect(container.textContent).toContain('Start free and upgrade whenever you need more.')
    await click(buttonByText('Upgrade to Pro'))
    expect(createCheckout).toHaveBeenCalledWith('billing-token', 'pro', 'month', { signal: expect.any(AbortSignal) })
    act(() => root.unmount())

    root = undefined
    const subscribed = planResponse()
    subscribed.plans[0].currentPlan = false
    subscribed.plans[1].currentPlan = true
    await renderPage({ loadPlans: vi.fn().mockResolvedValue(subscribed) })
    expect(buttonByText('Upgrade to Pro')).toBeUndefined()
  })

  it('uses the paid flag from the API to decide whether a plan shows dictation hours', async () => {
    window.history.replaceState({}, '', '/billing/plans#t=billing-token')
    const response = planResponse()
    response.plans[1].paid = false

    await renderPage({ loadPlans: vi.fn().mockResolvedValue(response) })

    expect(planCard('Pro').textContent).toContain('90,000 Credits per month')
    expect(planCard('Pro').textContent).not.toContain('cloud dictation')
    expect(buttonByText('Upgrade to Pro')).toBeUndefined()
  })
})

// Each call returns a promise settled by the test, in call order, so a test
// can resolve a request after the page has moved on.
function deferredCheckout() {
  const calls = []
  const pending = []
  return {
    calls,
    createCheckout: vi.fn((token, planCode, billingInterval, options = {}) => new Promise((resolve, reject) => {
      calls.push({ token, planCode, billingInterval, signal: options.signal })
      pending.push({ resolve, reject })
    })),
    resolve: (url) => pending.shift().resolve(url),
    reject: (error) => pending.shift().reject(error),
  }
}

async function renderPage(props) {
  root = createRoot(container)
  const pageProps = { loadCredits: vi.fn().mockRejectedValue(new Error('not stubbed')), ...props }
  await act(async () => {
    root.render(
      <I18nProvider>
        <BillingPlansPage {...pageProps} />
      </I18nProvider>,
    )
    await Promise.resolve()
  })
  await flush()
}

async function flush() {
  for (let index = 0; index < 3; index += 1) {
    await act(async () => { await Promise.resolve() })
  }
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await Promise.resolve()
  })
  await flush()
}

async function setSlider(value) {
  const slider = container.querySelector('#plan-estimator-minutes')
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  await act(async () => {
    setter.call(slider, String(value))
    slider.dispatchEvent(new Event('input', { bubbles: true }))
  })
}

function buttonByText(text) {
  return [...container.querySelectorAll('button')].find((button) => button.textContent === text)
}

function planCard(name) {
  return [...container.querySelectorAll('article h2')].find((heading) => heading.textContent === name).closest('article')
}

function statusChip() {
  return container.querySelector('[class*="statusChip"]')
}

function recommendation() {
  return container.querySelector('[class*="recommendation"]').textContent
}

function creditResponse({ limit, remaining, addon, unlimited = false }) {
  return {
    billingEnabled: true,
    packs: [],
    credits: {
      limit, used: Math.max(0, limit - remaining), remaining, unlimited, totalRemaining: remaining + addon,
      addon: { balance: addon, usedThisPeriod: 0, remaining: addon, nextExpiry: null },
    },
  }
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
