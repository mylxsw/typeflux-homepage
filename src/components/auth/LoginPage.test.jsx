// @vitest-environment jsdom
import React, { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'
import { authCopy, authText, errorKey } from './authCopy'
import { I18nProvider } from '../../i18n/index.jsx'
import { ThemeProvider } from '../../contexts/ThemeContext'
import Header from '../Header'
import { AuthApiError } from '../../lib/authApi'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const transaction = 'T'.repeat(43)
const redirect = `ai.gulu.app.typeflux://auth/callback?code=${'C'.repeat(43)}&state=${'S'.repeat(32)}`
const baseSession = () => ({ transaction_id: transaction, csrf_token: 'csrf', status: 'pending', providers: ['password', 'google', 'github', 'apple'], email: '', expires_at: Date.now() / 1000 + 600 })
let root, container, api, session, navigate

beforeEach(() => {
  localStorage.clear(); sessionStorage.clear()
  window.history.replaceState({}, '', '/login')
  session = baseSession()
  api = {
    session: vi.fn(async () => ({ ...session })), enterEmail: vi.fn(async () => 'login'),
    email: vi.fn(async action => {
      if (action === 'login') { session = { ...session, status: 'authenticated', email: 'lin@example.com' }; return 'complete' }
      return ({ register: 'activate', activate: 'login', 'resend-activation': 'activate', 'forgot-password': 'reset-password', 'reset-password': 'login' })[action]
    }),
    provider: vi.fn(async provider => `https://${provider}.example.test/authorize`),
    complete: vi.fn(async () => ({ redirect_url: redirect, expires_at: Date.now() / 1000 + 60 })),
  }
  navigate = vi.fn()
  container = document.createElement('div'); document.body.append(container)
})
afterEach(() => {
  if (root) act(() => root.unmount())
  root = null; container.remove(); vi.restoreAllMocks(); vi.useRealTimers()
})

async function render(props = {}, header = false) {
  await act(async () => {
    root = createRoot(container)
    root.render(<StrictMode><ThemeProvider><I18nProvider>{header && <Header isAuthPage />}<LoginPage api={api} transaction={transaction} enabled navigate={navigate} {...props} /></I18nProvider></ThemeProvider></StrictMode>)
  })
}
function button(text) { return [...container.querySelectorAll('button')].find(x => x.textContent === text) }
async function click(node) { expect(node).toBeTruthy(); await act(async () => node.click()) }
async function fill(selector, value) {
  const node = container.querySelector(selector); expect(node).toBeTruthy()
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value)
    node.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function submit() { await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))) }
async function agree() { await click(container.querySelector('input[type="checkbox"]')) }
async function enter(next = 'login') {
  api.enterEmail.mockResolvedValue(next)
  await agree(); await fill('[name="email"]', 'lin@example.com'); await submit()
}
const title = () => container.querySelector('h1').textContent

describe('email lifecycle and identity confirmation', () => {
  it('gates every entry with consent, validates email, focuses errors and reads once in StrictMode', async () => {
    await render()
    expect(api.session).toHaveBeenCalledTimes(1)
    expect(document.activeElement).toBe(container.querySelector('h1'))
    await submit(); expect(container.textContent).toContain('Enter a valid email')
    await fill('[name="email"]', 'lin@example.com'); await submit()
    expect(api.enterEmail).not.toHaveBeenCalled()
    expect(document.activeElement.type).toBe('checkbox')
    await click(button('Continue with Google')); expect(api.provider).not.toHaveBeenCalled()
    await agree(); await submit()
    expect(title()).toBe('Enter your password')
    await fill('#password', 'Example123')
    await click(container.querySelector('[aria-label="Show password"]'))
    expect(container.querySelector('#password').type).toBe('text')
    await click(container.querySelector('[aria-label="Hide password"]'))
    await submit()
    expect(title()).toBe('Continue to Typeflux?')
    expect(container.textContent).toContain('lin@example.com')
    expect(api.complete).not.toHaveBeenCalled()
    await click(button('Continue'))
    expect(api.complete).toHaveBeenCalledWith(expect.objectContaining({ status: 'authenticated' }), false, expect.any(AbortSignal), true)
    expect(navigate).toHaveBeenCalledWith(redirect)
    expect(container.querySelector(`a[href^="ai.gulu"]`).textContent).toBe('Open Typeflux')
    expect(container.textContent).not.toContain('C'.repeat(43))
    expect(sessionStorage.length).toBe(0)
    expect(Object.keys(localStorage)).toEqual(['typeflux-theme'])
  })
  it('registers, rejects weak/mismatched passwords, activates and requires fresh password login', async () => {
    await render(); await enter('register')
    await fill('#password', 'weak'); await submit()
    expect(api.email).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Use 8–72')
    await fill('#password', 'Example123'); await fill('#confirm-password', 'Different123'); await submit()
    expect(container.textContent).toContain('Passwords do not match')
    await fill('#confirm-password', 'Example123'); await fill('[name="name"]', 'Lin'); await submit()
    expect(api.email).toHaveBeenCalledWith('register', { email: 'lin@example.com', password: 'Example123', name: 'Lin' }, expect.any(Object), expect.any(AbortSignal))
    expect(title()).toBe('Verify your email')
    expect(container.querySelector('[name="code"]').autocomplete).toBe('one-time-code')
    await fill('[name="code"]', '12ab'); await submit()
    expect(container.textContent).toContain('Enter the 6-digit code')
    await fill('[name="code"]', '123456')
    expect(api.email).toHaveBeenLastCalledWith('activate', { email: 'lin@example.com', code: '123456' }, expect.any(Object), expect.any(AbortSignal))
    expect(title()).toBe('Enter your password')
    expect(container.querySelector('#password').value).toBe('')
    expect(container.textContent).toContain('Email verified')
    expect(api.complete).not.toHaveBeenCalled()
  })
  it('resends activation with a freshly entered password; no password retained across steps', async () => {
    await render(); await enter('register')
    await fill('#password', 'Example123'); await fill('#confirm-password', 'Example123'); await submit()
    await click(button('Resend activation code'))
    expect(container.querySelector('#password').value).toBe('')
    await fill('#password', 'Example123'); await submit()
    expect(api.email).toHaveBeenLastCalledWith('resend-activation', { email: 'lin@example.com', password: 'Example123' }, expect.any(Object), expect.any(AbortSignal))
    expect(title()).toBe('Verify your email')
    expect(container.textContent).toContain('Code sent')
  })
  it('resends using the submitted password for an inactive login, then activates', async () => {
    api.email.mockRejectedValueOnce(new AuthApiError('AUTH_USER_NOT_ACTIVE', 403))
    await render(); await enter(); await fill('#password', 'Example123'); await submit()
    expect(api.email.mock.calls.map(x => x[0])).toEqual(['login', 'resend-activation'])
    expect(title()).toBe('Verify your email')
  })
  it('supports forgot/reset, requires matching passwords, and returns to password login', async () => {
    await render(); await enter(); await click(button('Forgot password?'))
    await submit(); expect(title()).toBe('New password')
    await fill('[name="code"]', '123456')
    expect(api.email).toHaveBeenCalledTimes(1)
    await fill('#password', 'Changed123'); await fill('#confirm-password', 'Changed123'); await submit()
    expect(api.email).toHaveBeenLastCalledWith('reset-password', { email: 'lin@example.com', code: '123456', new_password: 'Changed123' }, expect.any(Object), expect.any(AbortSignal))
    expect(title()).toBe('Enter your password')
    expect(container.textContent).toContain('Password updated')
    expect(container.querySelector('#password').value).toBe('')
  })
  it('clears and focuses wrong passwords but preserves input on network failures', async () => {
    await render(); await enter(); await fill('#password', 'Wrong123')
    api.email.mockRejectedValueOnce(new AuthApiError('AUTH_INVALID_CREDENTIALS', 401)); await submit()
    expect(container.querySelector('#password').value).toBe('')
    expect(document.activeElement.id).toBe('password')
    await fill('#password', 'Example123')
    api.email.mockRejectedValueOnce(new AuthApiError('NETWORK_ERROR')); await submit()
    expect(container.querySelector('#password').value).toBe('Example123')
    await act(async () => window.dispatchEvent(new Event('offline')))
    expect(container.textContent).toContain('Connection interrupted')
    await act(async () => window.dispatchEvent(new Event('online')))
    expect(api.email).toHaveBeenCalledTimes(2)
  })
  it('returns via change/back without changing authenticated server identities', async () => {
    await render(); await enter(); await click(button('Change'))
    expect(title()).toBe('Sign in to Typeflux')
    api.enterEmail.mockResolvedValue('register')
    await submit(); await click(button('Back to sign in'))
    expect(title()).toBe('Sign in to Typeflux')
  })
  it('offers existing provider sign-in and password recovery for a passwordless account', async () => {
    await render(); await enter(); await fill('#password', 'Example123')
    expect(button('Continue with Google')).toBeUndefined()
    api.email.mockRejectedValueOnce(new AuthApiError('AUTH_OAUTH_USER_NO_PASSWORD', 400)); await submit()
    expect(container.textContent).toContain('This account has no password')
    expect(button('Continue with Google')).toBeTruthy()
    await click(button('Forgot password?'))
    expect(title()).toBe('Reset your password')
  })
})

describe('provider callback, linking and recovery', () => {
  it.each(['Google', 'GitHub', 'Apple'])('starts %s and recovers a blocked provider redirect', async provider => {
    vi.useFakeTimers(); await render(); await agree(); await click(button(`Continue with ${provider}`))
    expect(api.provider).toHaveBeenCalledWith(provider.toLowerCase(), expect.objectContaining({ csrf_token: 'csrf' }), expect.any(AbortSignal))
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(button(`Redirecting to ${provider}…`).disabled).toBe(true)
    await act(async () => vi.advanceTimersByTimeAsync(8000))
    expect(container.textContent).toContain('Nothing happening?')
    expect(button(`Continue with ${provider}`).disabled).toBe(false)
  })
  it('renders pending/cancelled on /login/complete and hides unconfigured methods', async () => {
    window.history.replaceState({}, '', '/login/complete')
    session.providers = ['password', 'apple']; session.error_code = 'AUTH_OAUTH_CANCELLED'
    await render()
    expect(title()).toBe('Sign in to Typeflux')
    expect(container.textContent).toContain('Sign-in was cancelled')
    expect(button('Continue with Google')).toBeUndefined()
    expect(button('Continue with Apple')).toBeTruthy()
    expect(api.complete).not.toHaveBeenCalled()
  })
  it('requires old account authentication and explicit provider link consent', async () => {
    session.status = 'link_required'; session.link_provider = 'apple'
    window.history.replaceState({}, '', '/login/complete')
    await render()
    expect(title()).toBe('Confirm it is your account')
    await agree(); await fill('[name="email"]', 'lin@example.com'); await fill('#password', 'Example123'); await submit()
    expect(title()).toBe('Continue to Typeflux?')
    expect([...container.querySelectorAll('input[type="checkbox"]')].map(input => input.checked)).toEqual([false, true])
    await click(button('Continue')); expect(api.complete).not.toHaveBeenCalled()
    expect(container.textContent).toContain('Please confirm account linking')
    await click(container.querySelector('input[type="checkbox"]'))
    await click(button('Continue'))
    expect(api.complete).toHaveBeenCalledWith(expect.objectContaining({ link_provider: 'apple' }), true, expect.any(AbortSignal), true)
  })
  it('keeps terms checked after an OAuth callback and allows an explicit opt-out', async () => {
    session.status = 'authenticated'; session.email = 'lin@example.com'
    await render()
    const terms = container.querySelector('input[type="checkbox"]')
    expect(terms.checked).toBe(true)
    await click(terms); await click(button('Continue'))
    expect(api.complete).not.toHaveBeenCalled(); expect(document.activeElement).toBe(terms)
    await click(terms); await click(button('Continue'))
    expect(api.complete).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenCalledWith(redirect)
  })
  it('abandons linking only by restarting in App, including after back from recovery', async () => {
    session.status = 'link_required'; session.link_provider = 'google'
    await render(); await click(button('Forgot password?')); await click(button('Back to sign in'))
    expect(title()).toBe('Confirm it is your account')
    await click(button('Use a different account'))
    expect(title()).toBe('Start a new sign-in from Typeflux')
  })
  it('keeps a wrong-account linking attempt unverified', async () => {
    session.status = 'link_required'; session.link_provider = 'google'
    await render(); await agree(); await fill('[name="email"]', 'wrong@example.com'); await fill('#password', 'Example123')
    api.email.mockRejectedValueOnce(new AuthApiError('AUTH_ACCOUNT_LINK_MISMATCH', 409)); await submit()
    expect(title()).toBe('Confirm it is your account')
    expect(container.textContent).toContain('Use the original account')
    expect(api.complete).not.toHaveBeenCalled()
  })
  it('refreshes CSRF without automatically replaying writes', async () => {
    await render(); await enter(); await fill('#password', 'Example123')
    session.csrf_token = 'new-csrf'
    api.email.mockRejectedValueOnce(new AuthApiError('AUTH_CSRF_INVALID', 403)); await submit()
    expect(api.email).toHaveBeenCalledTimes(1)
    expect(api.session).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Session security was refreshed')
    expect(title()).toBe('Sign in to Typeflux')
    await submit(); await fill('#password', 'Example123'); await submit()
    expect(api.email.mock.calls[1][2].csrf_token).toBe('new-csrf')
  })
  it.each(['AUTH_TRANSACTION_STATE', 'AUTH_ACCOUNT_LINK_REQUIRED'])('reads state after %s', async code => {
    await render(); await enter(); await fill('#password', 'Example123')
    session.status = 'link_required'; session.link_provider = 'google'
    api.email.mockRejectedValueOnce(new AuthApiError(code, 409)); await submit()
    expect(title()).toBe('Confirm it is your account')
  })
  it('falls back safely if CSRF recovery cannot read the session', async () => {
    await render(); await enter(); await fill('#password', 'Example123')
    api.email.mockRejectedValueOnce(new AuthApiError('AUTH_CSRF_INVALID'))
    api.session.mockRejectedValueOnce(new AuthApiError('AUTH_BROWSER_MISMATCH'))
    await submit(); expect(container.textContent).toContain('Use the original browser')
  })
  it.each(['AUTH_TRANSACTION_INVALID', 'AUTH_GRANT_INVALID', 'AUTH_BROWSER_MISMATCH'])('offers App recovery for %s', async code => {
    api.session.mockRejectedValue(new AuthApiError(code)); await render()
    expect(title()).toBe('Start a new sign-in from Typeflux')
    expect(container.querySelector('form')).toBeNull()
  })
  it('retries initial network failures and respects server rate limits for email only', async () => {
    vi.useFakeTimers()
    api.session.mockRejectedValueOnce(new AuthApiError('NETWORK_ERROR')); await render()
    expect(container.textContent).toContain('Connection interrupted')
    await click(button('Try again')); await agree(); await fill('[name="email"]', 'lin@example.com')
    api.enterEmail.mockRejectedValueOnce(new AuthApiError('RATE_LIMITED', 429, 3)); await submit()
    expect(button('Continue').disabled).toBe(true)
    expect(button('Continue with Apple').disabled).toBe(false)
    await submit(); expect(api.enterEmail).toHaveBeenCalledTimes(1)
    await act(async () => vi.advanceTimersByTimeAsync(3000))
    expect(button('Continue').disabled).toBe(false)
  })
  it.each(['code_issued', 'revoked', 'consumed'])('recovers persisted %s without issuing another code', async status => {
    session.status = status; session.email = 'lin@example.com'; await render()
    expect(title()).toBe(status === 'consumed' ? 'Signed in successfully' : 'Start a new sign-in from Typeflux')
    expect(api.complete).not.toHaveBeenCalled()
    expect(container.querySelector('a[href^="ai.gulu"]')).toBeNull()
  })
  it('does not contact the API without a transaction or when the feature is disabled', async () => {
    await render({ transaction: '' }); expect(title()).toBe('Sign in from the Typeflux app'); expect(api.session).not.toHaveBeenCalled()
    act(() => root.unmount()); root = null
    await render({ enabled: false }); expect(container.textContent).toContain('not available yet'); expect(api.session).not.toHaveBeenCalled()
  })
})

describe('handoff safety, expiry and localization', () => {
  async function confirmed() {
    session.status = 'authenticated'; session.email = 'lin@example.com'
    await render(); await click(button('Continue'))
  }
  it('keeps a manual link after blocked launch, polls actual state and never infers success from blur', async () => {
    vi.useFakeTimers(); navigate.mockImplementation(() => { throw new Error('blocked') })
    await confirmed()
    await act(async () => { window.dispatchEvent(new Event('blur')); await vi.advanceTimersByTimeAsync(4000) })
    expect(title()).toBe('Opening Typeflux')
    expect(container.textContent).toContain('Typeflux did not open?')
    expect(container.querySelector('a[href^="ai.gulu"]').href).toBe(redirect)
    expect(navigate).toHaveBeenCalledTimes(1)
    session.status = 'consumed'
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(title()).toBe('Signed in successfully')
    expect(container.textContent).toContain('Return to Typeflux to get started.')
    expect(container.querySelector('a[href^="ai.gulu"]')).toBeNull()
    expect(api.complete).toHaveBeenCalledTimes(1)
  })
  it('expires the in-memory code and never reissues it', async () => {
    vi.useFakeTimers(); await confirmed()
    await act(async () => vi.advanceTimersByTimeAsync(60000))
    expect(title()).toBe('Start a new sign-in from Typeflux')
    expect(container.textContent).toContain('expired')
    expect(container.querySelector('a[href^="ai.gulu"]')).toBeNull()
    expect(api.complete).toHaveBeenCalledTimes(1)
  })
  it('suspends hidden-page polling and removes revoked handoff links', async () => {
    vi.useFakeTimers(); await confirmed()
    const visible = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    const reads = api.session.mock.calls.length
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(api.session).toHaveBeenCalledTimes(reads)
    visible.mockReturnValue('visible'); session.status = 'revoked'
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(title()).toBe('Start a new sign-in from Typeflux')
    expect(container.querySelector('a[href^="ai.gulu"]')).toBeNull()
  })
  it('keeps a manual handoff after a poll network error and recovers server expiry', async () => {
    vi.useFakeTimers(); await confirmed()
    api.session.mockRejectedValueOnce(new AuthApiError('NETWORK_ERROR'))
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(title()).toBe('Opening Typeflux')
    api.session.mockRejectedValueOnce(new AuthApiError('AUTH_TRANSACTION_INVALID'))
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(title()).toBe('Start a new sign-in from Typeflux')
    expect(container.querySelector('a[href^="ai.gulu"]')).toBeNull()
  })
  it('expires pending transactions before further writes', async () => {
    vi.useFakeTimers(); session.expires_at = Date.now() / 1000 + 2; await render()
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(title()).toBe('Start a new sign-in from Typeflux')
    expect(api.enterEmail).not.toHaveBeenCalled()
  })
  it('handles a lost complete response without retry', async () => {
    api.complete.mockRejectedValue(new AuthApiError('NETWORK_ERROR')); await confirmed()
    expect(container.textContent).toContain('confirmation result could not be received')
    expect(api.complete).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
  })
  it('prevents concurrent submissions', async () => {
    let resolve
    api.enterEmail.mockImplementation(() => new Promise(done => { resolve = done }))
    await render(); await agree(); await fill('[name="email"]', 'lin@example.com')
    await submit(); await submit()
    expect(api.enterEmail).toHaveBeenCalledTimes(1)
    await act(async () => resolve('login'))
  })
  it('changes language in-place on the complete route without losing transaction, inputs or consent', async () => {
    window.history.replaceState({}, '', '/login/complete')
    await render({}, true); await enter(); await fill('#password', 'Example123')
    const langLink = [...container.querySelectorAll('a')].find(x => x.getAttribute('hreflang') === 'ja')
    await click(langLink)
    expect(location.pathname).toBe('/ja/login/complete'); expect(location.search).toBe('')
    expect(title()).toBe('パスワードを入力')
    expect(container.querySelector('#password').value).toBe('Example123')
    expect(container.querySelector('input[type="checkbox"]')).toBeNull()
    await submit(); expect(title()).toBe('Typeflux に進みますか？')
    expect(container.querySelector('input[type="checkbox"]').checked).toBe(true)
    expect(api.session).toHaveBeenCalledWith(transaction, expect.any(AbortSignal))
    expect([...Array(localStorage.length)].map((_, i) => localStorage.getItem(localStorage.key(i))).join()).not.toContain(transaction)
  })
  it.each(['en', 'zh-CN', 'zh-TW', 'ja', 'ko'])('has complete %s copy without untranslated keys', async lang => {
    window.history.replaceState({}, '', lang === 'en' ? '/login' : `/${lang}/login`)
    await render()
    expect(title()).toBe(authText(lang, 'entryTitle'))
    for (const key of Object.keys(authCopy)) expect(authText(lang, key, { provider: 'Apple', seconds: 2 })).not.toMatch(/undefined|\{\w+\}/)
  })
  it('uses safe fallback copy for unknown server codes/locales', () => {
    expect(errorKey({ code: 'unknown', status: 429 })).toBe('limited')
    expect(errorKey({ code: 'unknown' })).toBe('generic')
    expect(authText('unknown', 'missing')).toBe(authCopy.generic[0])
    expect(authText('en', 'provider')).toBe('Continue with ')
  })
})

describe('website sign-in (no App transaction)', () => {
  const webSession = () => ({ ...baseSession(), mode: 'web', next: '/account/usage' })
  beforeEach(() => {
    session = webSession()
    api.startWeb = vi.fn(async () => transaction)
    api.complete = vi.fn(async () => ({ mode: 'web', next: '/account/usage', expires_at: Date.now() / 1000 + 3600 }))
  })

  it('starts once, reuses the login steps and returns to the requested page', async () => {
    await render({ transaction: '', next: '/account/usage' })
    expect(api.startWeb).toHaveBeenCalledTimes(1)
    expect(api.startWeb).toHaveBeenCalledWith('/account/usage', undefined)
    expect(api.session).toHaveBeenCalledWith(transaction, undefined)
    expect(title()).toBe('Sign in to Typeflux')
    await enter(); await fill('#password', 'Example123'); await submit()
    expect(title()).toBe('Continue with this account?')
    expect(container.textContent).toContain(authCopy.webConfirmSub[0])
    expect(button('Use a different account')).toBeTruthy()
    const remember = [...container.querySelectorAll('label')].find(x => x.textContent.includes('Keep me signed in on this browser')).querySelector('input')
    expect(remember.checked).toBe(true)
    await click(remember)
    await click(button('Continue'))
    expect(api.complete).toHaveBeenCalledWith(expect.objectContaining({ status: 'authenticated' }), false, expect.any(AbortSignal), false)
    expect(navigate).toHaveBeenCalledWith('/account/usage')
    expect(title()).toBe('You are signed in')
  })

  it('defaults the return page to the localized dashboard', async () => {
    window.history.replaceState({}, '', '/ko/login')
    await render({ transaction: '', next: '' })
    expect(api.startWeb).toHaveBeenCalledWith('/ko/account', undefined)
  })

  it('offers a fresh website sign-in instead of an App restart', async () => {
    vi.useFakeTimers(); session.expires_at = Date.now() / 1000 + 2
    await render({ transaction: '', next: '/account/billing' })
    await act(async () => vi.advanceTimersByTimeAsync(2000))
    expect(title()).toBe('Sign-in expired')
    const again = [...container.querySelectorAll('a')].find(x => x.textContent === 'Sign in again')
    expect(again.getAttribute('href')).toBe('/login?next=%2Faccount%2Fbilling')
  })

  it('retries a failed start from the beginning', async () => {
    api.startWeb.mockRejectedValueOnce(new AuthApiError('NETWORK_ERROR'))
    await render({ transaction: '', next: '' })
    expect(container.textContent).toContain('Connection interrupted')
    await click(button('Try again'))
    expect(api.startWeb).toHaveBeenCalledTimes(2)
    expect(title()).toBe('Sign in to Typeflux')
  })

  it('simplifies only App confirmation while keeping the current account and default completion behavior', async () => {
    session = baseSession()
    api.complete = vi.fn(async () => ({ mode: 'app', redirect_url: redirect, expires_at: Date.now() / 1000 + 60 }))
    await render()
    await enter(); await fill('#password', 'Example123'); await submit()
    expect(container.textContent).not.toContain(authCopy.confirmSub[0])
    expect(container.textContent).not.toContain(authCopy.rememberApp[0])
    expect(container.textContent).not.toContain(authCopy.rememberNote[0])
    expect(button('Use a different account')).toBeUndefined()
    expect(container.textContent).toContain('lin@example.com')
    expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(1)
    await click(button('Continue'))
    expect(api.complete).toHaveBeenCalledWith(expect.anything(), false, expect.any(AbortSignal), true)
    expect(navigate).toHaveBeenCalledWith(redirect)
  })
})
