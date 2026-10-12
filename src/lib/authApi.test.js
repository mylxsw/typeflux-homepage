// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authApi, AuthApiError, retryAfterSeconds, safeAppURL, safeProviderURL } from './authApi'
import { captureAuthTransaction, getAuthTransaction, isAuthRoute } from './authNavigation'
import { passwordRules, validPassword } from './password'

const id = 'T'.repeat(43)
const session = { transaction_id: id, status: 'pending', csrf_token: 'csrf-secret', expires_at: 2000000000, providers: ['password', 'google'] }
const redirect = `ai.gulu.app.typeflux://auth/callback?code=${'C'.repeat(43)}&state=${'S'.repeat(32)}`
const respond = (data, status = 200, code = 'OK', headers = {}) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code, data }), { status, headers })))
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('same-origin web auth contract', () => {
  it('binds and reads only the frozen flat session fields', async () => {
    respond({ ...session, access_token: 'never-retain', providers: ['password', 'google', 'unknown'] })
    expect(await authApi.session(id)).toEqual({ ...session, email: '', link_provider: '', error_code: '' })
    expect(fetch).toHaveBeenCalledWith(`/api/v1/auth/web/session?transaction=${id}`, expect.objectContaining({ credentials: 'same-origin', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer', method: 'GET' }))
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })
  it.each([
    { transaction_id: 'other' }, { status: 'exchanged' }, { expires_at: 'tomorrow' }, { csrf_token: '' },
    { providers: {} }, { email: 42 }, { link_provider: 'evil' },
    { status: 'authenticated', email: '' },
  ])('rejects malformed session %j', async patch => {
    respond({ ...session, ...patch })
    await expect(authApi.session(id)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
  it('accepts revoked session without CSRF and stable provider/link error fields', async () => {
    respond({ ...session, status: 'revoked', csrf_token: '', email: 'test@example.com', link_provider: 'apple', error_code: 'AUTH_USER_NOT_ACTIVE' })
    expect(await authApi.session(id)).toMatchObject({ status: 'revoked', csrf_token: '', email: 'test@example.com', link_provider: 'apple', error_code: 'AUTH_USER_NOT_ACTIVE' })
  })
  it('uses the precise legacy email routing endpoint without treating it as authentication', async () => {
    respond({ next: 'register', exists: false })
    expect(await authApi.enterEmail('user@example.com')).toBe('register')
    expect(fetch).toHaveBeenCalledWith('/api/v1/auth/enter-email', expect.objectContaining({ method: 'POST', body: '{"email":"user@example.com"}' }))
    respond({ next: 'complete' })
    await expect(authApi.enterEmail('user@example.com')).rejects.toBeInstanceOf(AuthApiError)
  })
  it.each(['login', 'register', 'activate', 'resend-activation', 'forgot-password', 'reset-password'])('sends Cookie/CSRF with %s', async action => {
    respond({ next: 'login' })
    await authApi.email(action, { email: 'u@example.com', password: 'Example123', code: '123456' }, session)
    expect(fetch).toHaveBeenCalledWith(`/api/v1/auth/web/email/${action}`, expect.objectContaining({ headers: expect.objectContaining({ 'X-CSRF-Token': 'csrf-secret' }), body: JSON.stringify({ email: 'u@example.com', password: 'Example123', code: '123456', transaction_id: id }) }))
  })
  it('rejects missing CSRF, unsupported actions and unexpected next values', async () => {
    respond({ next: 'invalid' })
    await expect(authApi.email('logout', {}, session)).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    await expect(authApi.email('login', {}, { ...session, csrf_token: '' })).rejects.toMatchObject({ code: 'AUTH_CSRF_INVALID' })
    expect(fetch).not.toHaveBeenCalled()
    await expect(authApi.email('login', {}, session)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
  it.each([['google', 'accounts.google.com'], ['github', 'github.com'], ['apple', 'appleid.apple.com']])('starts %s only on its HTTPS host', async (provider, host) => {
    respond({ authorization_url: `https://${host}/authorize?state=provider-state` })
    expect(await authApi.provider(provider, session)).toBe(`https://${host}/authorize?state=provider-state`)
    expect(fetch.mock.calls[0][0]).toBe(`/api/v1/auth/web/oauth/${provider}/start`)
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ transaction_id: id })
  })
  it('rejects unknown providers and hostile navigation URLs', async () => {
    await expect(authApi.provider('evil', session)).rejects.toMatchObject({ code: 'AUTH_PROVIDER_UNAVAILABLE' })
    for (const url of ['bad', 'javascript:alert(1)', 'http://accounts.google.com/', 'https://accounts.google.com.evil.test/', 'https://u@accounts.google.com/', 'https://accounts.google.com:999/']) expect(() => safeProviderURL(url, 'google')).toThrow()
    for (const url of ['invalid', 'javascript:alert(1)', redirect.replace('ai.gulu.app.typeflux', 'evil'), `${redirect}&state=duplicate`, `${redirect}#hash`, redirect.replace('code=', 'token='), redirect.replace('auth/', 'u@auth/')]) expect(() => safeAppURL(url)).toThrow()
    expect(safeAppURL(redirect)).toBe(redirect)
    expect(safeAppURL(redirect.replace('typeflux:', 'typeflux.dev:'), 'ai.gulu.app.typeflux.dev://auth/callback')).toContain('typeflux.dev:')
  })
  it.each([false, true])('requires explicit confirmation and optional linking (%s)', async link => {
    respond({ redirect_url: redirect, expires_at: 2000000000, access_token: 'ignored' })
    expect(await authApi.complete(session, link)).toEqual({ redirect_url: redirect, expires_at: 2000000000 })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ transaction_id: id, confirm: true, ...(link ? { link_provider: true } : {}) })
    respond({ redirect_url: redirect })
    await expect(authApi.complete(session, link)).rejects.toThrow('INVALID_RESPONSE')
  })
  it('surfaces stable errors and server retry headers, never server messages', async () => {
    respond(null, 429, 'RATE_LIMITED', { 'Retry-After': '17' })
    await expect(authApi.session(id)).rejects.toMatchObject({ code: 'RATE_LIMITED', status: 429, retryAfter: 17 })
    respond(null)
    await expect(authApi.session(id)).rejects.toThrow('INVALID_RESPONSE')
    respond({}, 500, null)
    await expect(authApi.session(id)).rejects.toThrow('INVALID_RESPONSE')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>upstream failure</html>', { status: 502 })))
    await expect(authApi.session(id)).rejects.toThrow('INVALID_RESPONSE')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('contains secrets')))
    await expect(authApi.session(id)).rejects.toThrow('NETWORK_ERROR')
  })
  it('bounds hanging requests and preserves explicit cancellation', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn((_, { signal }) => new Promise((resolve, reject) => {
      if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'))
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
    })))
    const pending = expect(authApi.session(id)).rejects.toThrow('NETWORK_ERROR')
    await vi.advanceTimersByTimeAsync(10000)
    await pending
    const controller = new AbortController()
    const aborted = expect(authApi.session(id, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
    controller.abort(); await aborted
    await expect(authApi.session(id, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })
})

it('handles numeric/date Retry-After without inventing cooldowns', () => {
  expect(retryAfterSeconds(null)).toBe(0)
  expect(retryAfterSeconds('10')).toBe(10)
  expect(retryAfterSeconds('garbage')).toBe(0)
  expect(retryAfterSeconds('Thu, 01 Jan 1970 00:00:10 GMT', 5000)).toBe(5)
  expect(retryAfterSeconds('Thu, 01 Jan 1970 00:00:10 GMT', 20000)).toBe(0)
})

it('captures only a single opaque transaction, erasing all query/hash state without storage', () => {
  localStorage.clear(); sessionStorage.clear()
  window.history.replaceState({}, '', `/ja/login/complete?transaction=${id}&access_token=evil#refresh_token=evil`)
  captureAuthTransaction()
  expect(getAuthTransaction()).toBe(id)
  expect(location.href).not.toContain('?')
  expect(location.hash).toBe('')
  expect(localStorage.length + sessionStorage.length).toBe(0)
  captureAuthTransaction()
  expect(getAuthTransaction()).toBe('')
  for (const query of ['transaction=bad', `transaction=${id}&transaction=${id}`, 'code=code']) {
    window.history.replaceState({}, '', `/login?${query}`); captureAuthTransaction(); expect(getAuthTransaction()).toBe('')
  }
  window.history.replaceState({}, '', '/blog?utm_source=test'); captureAuthTransaction()
  expect(location.search).toBe('?utm_source=test')
  expect(isAuthRoute('/zh-TW/login/complete/')).toBe(true)
  expect(isAuthRoute('/login/other')).toBe(false)
})

it('matches Unicode Go password strength and bcrypt byte limits', () => {
  expect(validPassword('Abcdefg1')).toBe(true)
  expect(validPassword('Äbcdefg١')).toBe(true)
  expect(validPassword('Abc1')).toBe(false)
  expect(validPassword('A1' + 'é'.repeat(35))).toBe(true)
  expect(validPassword('A1' + 'é'.repeat(36))).toBe(false)
  expect(passwordRules('password')).toEqual([true, false, true, false, true])
})
