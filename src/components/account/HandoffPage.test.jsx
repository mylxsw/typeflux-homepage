// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HandoffPage from './HandoffPage'
import { AccountApiError } from '../../lib/accountApi'
import { mount } from './testUtils'

const code = 'C'.repeat(43)
let view, navigate, exchange
beforeEach(() => {
  window.history.replaceState({}, '', '/account/handoff')
  navigate = vi.fn()
  exchange = vi.fn()
})
afterEach(() => { view?.unmount(); view = null })

const page = (grant = { code, target: 'usage' }, options) =>
  mount(<HandoffPage exchange={exchange} navigate={navigate} capture={() => grant} />, options).render()

describe('HandoffPage', () => {
  it.each(['created', 'same', 'switched'])('opens the target page after %s, exchanging once', async (status) => {
    exchange.mockResolvedValue({ status, target: 'usage', email: 'lin@example.com', currentEmail: '' })
    view = await page()
    expect(exchange).toHaveBeenCalledTimes(1)
    expect(exchange).toHaveBeenCalledWith(code)
    expect(navigate).toHaveBeenCalledWith('/account/usage')
  })
  it('localizes the destination', async () => {
    window.history.replaceState({}, '', '/ja/account/handoff')
    exchange.mockResolvedValue({ status: 'created', target: 'credits', email: 'a@b.c', currentEmail: '' })
    view = await page({ code, target: 'credits' })
    expect(navigate).toHaveBeenCalledWith('/ja/billing/plans?tab=credits')
  })
  it('explains a missing or expired link and offers web sign-in', async () => {
    view = await page({ code: '', target: 'billing' })
    expect(exchange).not.toHaveBeenCalled()
    expect(view.text()).toContain('This link has expired')
    expect(view.find('a', 'Sign in on the web').getAttribute('href')).toBe('/login?next=%2Faccount%2Fbilling')
    view.unmount()
    exchange.mockRejectedValue(new AccountApiError('AUTH_HANDOFF_INVALID', 400))
    view = await page()
    expect(view.text()).toContain('This link has expired')
    view.unmount()
    exchange.mockRejectedValue(new AccountApiError('NETWORK_ERROR'))
    view = await page()
    expect(view.text()).toContain('Something went wrong')
  })
  it('asks which account to use, then switches on request', async () => {
    exchange.mockResolvedValueOnce({ status: 'mismatch', target: 'billing', email: 'app@example.com', currentEmail: 'web@example.com' })
    view = await page({ code, target: 'billing' })
    expect(navigate).not.toHaveBeenCalled()
    expect(view.text()).toContain('Choose an account')
    expect(view.text()).toContain('Switching signs web@example.com out of this browser only.')
    exchange.mockRejectedValueOnce(new AccountApiError('NETWORK_ERROR'))
    await view.click(view.find('button', 'app@example.com'))
    expect(view.find('[role="alert"]', 'Something went wrong')).toBeTruthy()
    exchange.mockResolvedValueOnce({ status: 'switched', target: 'billing', email: 'app@example.com', currentEmail: '' })
    await view.click(view.find('button', 'app@example.com'))
    expect(exchange).toHaveBeenLastCalledWith(code, { replace: true })
    expect(view.load.mock.calls.length).toBeGreaterThan(1)
    expect(navigate).toHaveBeenCalledWith('/account/billing')
  })
  it('keeps the browser account when chosen, and handles a spent code', async () => {
    exchange.mockResolvedValueOnce({ status: 'mismatch', target: 'usage', email: 'app@example.com', currentEmail: 'web@example.com' })
    view = await page()
    await view.click(view.find('button', 'web@example.com'))
    expect(navigate).toHaveBeenCalledWith('/account/usage')
    expect(exchange).toHaveBeenCalledTimes(1)
    view.unmount()
    exchange.mockResolvedValueOnce({ status: 'mismatch', target: 'usage', email: 'app@example.com', currentEmail: 'web@example.com' })
    exchange.mockRejectedValueOnce(new AccountApiError('AUTH_HANDOFF_INVALID', 400))
    view = await page()
    await view.click(view.find('button', 'app@example.com'))
    expect(view.text()).toContain('This link has expired')
  })
  it('subscribes to the exchange once, even with default (per-render) callbacks', async () => {
    // A default navigate parameter is a new function on every render; the
    // effect must not re-run on it, or a mismatch re-renders forever.
    const result = Promise.resolve({ status: 'mismatch', target: 'usage', email: 'app@example.com', currentEmail: 'web@example.com' })
    let subscriptions = 0
    exchange.mockReturnValue({ then: (...args) => { subscriptions += 1; return result.then(...args) } })
    view = await mount(<HandoffPage exchange={exchange} capture={() => ({ code, target: 'usage' })} />).render()
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(view.text()).toContain('Choose an account')
    expect(exchange).toHaveBeenCalledTimes(1)
    // StrictMode mounts effects twice; anything more means the effect re-ran.
    expect(subscriptions).toBeLessThanOrEqual(2)
  })
})
