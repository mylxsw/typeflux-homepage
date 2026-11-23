// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AccountApiError,
  accountRequest,
  browserTimeZone,
  exchangeHandoff,
  fetchAccountSession,
  fetchSubscription,
  fetchUsageBreakdown,
  fetchUsageRecords,
  fetchUsageStats,
  handoffRoute,
  logoutAccount,
  parseHandoffFragment,
  confirmWithPassword,
  deleteAccount,
  parseSecurityReturn,
  startProviderFlow,
  unlinkProvider,
} from './accountApi'
import { captureHandoff, handoffDestination, loginURL, resetHandoffCapture } from './accountNavigation'

const code = 'C'.repeat(43)
const respond = (data, status = 200, envelopeCode = 'OK') => vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: envelopeCode, data }), { status })))
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('accountRequest', () => {
  it('reads same-origin with the cookie and never sends tokens', async () => {
    respond({ ok: true })
    expect(await accountRequest('/api/v1/auth/web/account/x')).toEqual({ ok: true })
    const [path, init] = fetch.mock.calls[0]
    expect(path).toBe('/api/v1/auth/web/account/x')
    expect(init).toMatchObject({ method: 'GET', credentials: 'same-origin', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer' })
    expect(init.headers).toEqual({ Accept: 'application/json' })
    expect(init.body).toBeUndefined()
  })
  it('writes JSON with the session CSRF token', async () => {
    respond({})
    await accountRequest('/p', { method: 'POST', body: { a: 1 }, csrf: 'csrf-1' })
    expect(fetch.mock.calls[0][1]).toMatchObject({ method: 'POST', body: '{"a":1}', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'csrf-1' } })
    respond({})
    await accountRequest('/p', { method: 'POST' })
    expect(fetch.mock.calls[0][1].body).toBe('{}')
    expect(fetch.mock.calls[0][1].headers['X-CSRF-Token']).toBeUndefined()
  })
  it('maps failures to stable codes', async () => {
    respond(null, 401, 'AUTH_REQUIRED')
    await expect(accountRequest('/p')).rejects.toMatchObject({ code: 'AUTH_REQUIRED', status: 401 })
    respond(null, 500, 42)
    await expect(accountRequest('/p')).rejects.toMatchObject({ code: 'INVALID_RESPONSE', status: 500 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>', { status: 502 })))
    await expect(accountRequest('/p')).rejects.toMatchObject({ code: 'HTTP_502', status: 502 })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 200 })))
    await expect(accountRequest('/p')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    await expect(accountRequest('/p')).rejects.toBeInstanceOf(AccountApiError)
    const abort = new DOMException('Aborted', 'AbortError')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abort))
    await expect(accountRequest('/p')).rejects.toBe(abort)
  })
})

describe('account session', () => {
  it('reports signed out without throwing', async () => {
    respond({ authenticated: false })
    expect(await fetchAccountSession()).toEqual({ authenticated: false })
    respond(null)
    expect(await fetchAccountSession()).toEqual({ authenticated: false })
  })
  it('normalizes a signed-in session and selects only known fields', async () => {
    respond({ authenticated: true, user: { id: 'u1', email: 'a@b.c', name: 'Ann', providers: ['google', 3], has_password: true, token: 'x' }, csrf_token: 'csrf', persistent: true, expires_at: 9, reauth_until: 99, reauth_provider: 'apple', linkable_providers: ['google', 'facebook'] })
    expect(await fetchAccountSession()).toEqual({ authenticated: true, user: { id: 'u1', email: 'a@b.c', name: 'Ann', providers: ['google'], hasPassword: true }, csrf: 'csrf', persistent: true, expiresAt: 9, reauthUntil: 99, reauthProvider: 'apple', linkableProviders: ['google'] })
    respond({ authenticated: true, user: { email: 'a@b.c' }, csrf_token: 'csrf', reauth_provider: 7 })
    expect(await fetchAccountSession()).toMatchObject({ user: { id: '', name: '', providers: [], hasPassword: false }, persistent: false, expiresAt: 0, reauthUntil: 0, reauthProvider: '', linkableProviders: [] })
  })
  it.each([{ user: {}, csrf_token: 'c' }, { user: { email: 'a@b.c' }, csrf_token: '' }, { csrf_token: 'c' }])('rejects a malformed signed-in session %j', async (patch) => {
    respond({ authenticated: true, ...patch })
    await expect(fetchAccountSession()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
  it('logs out with CSRF', async () => {
    respond({})
    await logoutAccount('csrf')
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/web/account/logout')
    expect(fetch.mock.calls[0][1].headers['X-CSRF-Token']).toBe('csrf')
  })
})

describe('App handoff', () => {
  it('exchanges a code, optionally replacing the browser account', async () => {
    respond({ status: 'mismatch', target: 'usage', email: 'app@x.y', current_email: 'web@x.y' })
    expect(await exchangeHandoff(code)).toEqual({ status: 'mismatch', target: 'usage', email: 'app@x.y', currentEmail: 'web@x.y' })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ code, replace: false })
    respond({ status: 'switched', target: 'plans' })
    expect(await exchangeHandoff(code, { replace: true })).toEqual({ status: 'switched', target: 'plans', email: '', currentEmail: '' })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ code, replace: true })
  })
  it.each([{ status: 'other', target: 'usage' }, { status: 'same', target: 'https://evil.test' }])('rejects unknown outcomes %j', async (data) => {
    respond(data)
    await expect(exchangeHandoff(code)).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
  it('parses only well-formed fragments', () => {
    expect(parseHandoffFragment(`#code=${code}&to=billing`)).toEqual({ code, target: 'billing' })
    expect(parseHandoffFragment(`code=${code}`)).toEqual({ code, target: 'account' })
    expect(parseHandoffFragment('#code=short&to=evil')).toEqual({ code: '', target: 'account' })
    expect(parseHandoffFragment()).toEqual({ code: '', target: 'account' })
  })
  it('maps targets to fixed routes', () => {
    expect(['account', 'usage', 'billing', 'plans', 'credits', 'x'].map(handoffRoute)).toEqual(['/account', '/account/usage', '/account/billing', '/billing/plans', '/billing/plans?tab=credits', '/account'])
    expect(handoffDestination('zh-CN', 'credits')).toBe('/zh-CN/billing/plans?tab=credits')
    expect(handoffDestination('en', 'usage')).toBe('/account/usage')
    expect(loginURL('ja', '/ja/account')).toBe('/ja/login?next=%2Fja%2Faccount')
  })
  it('captures the code once and strips the fragment', () => {
    resetHandoffCapture()
    window.history.replaceState({}, '', `/account/handoff#code=${code}&to=usage`)
    expect(captureHandoff()).toEqual({ code, target: 'usage' })
    expect(location.hash).toBe('')
    expect(location.pathname).toBe('/account/handoff')
    window.history.replaceState({}, '', '/account/handoff#code=other')
    expect(captureHandoff()).toEqual({ code, target: 'usage' })
    resetHandoffCapture()
  })
})

describe('usage and billing reads', () => {
  it('calls the cookie-authenticated mirrors of the App APIs', async () => {
    for (const [call, path] of [
      [() => fetchUsageStats(), '/api/v1/auth/web/account/usage/current-period/stats'],
      [() => fetchUsageBreakdown({ timeZone: 'Asia/Shanghai' }), '/api/v1/auth/web/account/usage/current-period/breakdown?tz=Asia%2FShanghai'],
      [() => fetchUsageBreakdown(), '/api/v1/auth/web/account/usage/current-period/breakdown'],
      [() => fetchSubscription(), '/api/v1/auth/web/account/billing/subscription'],
    ]) {
      respond({ value: 1 })
      expect(await call()).toEqual({ value: 1 })
      expect(fetch.mock.calls[0][0]).toBe(path)
    }
  })
  it('reads the unwrapped records response and still maps enveloped errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ records: [{ id: 'r1' }], total: 1 }))))
    expect(await fetchUsageRecords()).toEqual({ records: [{ id: 'r1' }], total: 1 })
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/web/account/usage/records?limit=10&offset=0')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ total: 1 }))))
    await expect(fetchUsageRecords()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    respond(null, 401, 'AUTH_REQUIRED')
    await expect(fetchUsageRecords()).rejects.toMatchObject({ code: 'AUTH_REQUIRED', status: 401 })
    respond({ records: [] })
    expect(await fetchUsageRecords()).toEqual({ records: [] })
    // Enveloped endpoints never accept a bare body.
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ records: [] }))))
    await expect(fetchUsageStats()).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
  })
  it('reads the browser time zone', () => {
    expect(browserTimeZone()).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(() => { throw new Error('unsupported') })
    expect(browserTimeZone()).toBe('')
  })
})

describe('sign-in methods and deletion', () => {
  it('confirms with a password and deletes with CSRF', async () => {
    respond({})
    await confirmWithPassword('csrf', 'Password1')
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/web/account/reauth/password')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ password: 'Password1' })
    expect(fetch.mock.calls[0][1].headers['X-CSRF-Token']).toBe('csrf')
    respond({ deleted: true })
    await deleteAccount('csrf', 'a@b.c')
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/web/account/delete')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ email: 'a@b.c' })
  })
  it('unlinks with DELETE and no body', async () => {
    respond({})
    await unlinkProvider('csrf', 'github')
    const [path, init] = fetch.mock.calls[0]
    expect(path).toBe('/api/v1/auth/web/account/providers/github')
    expect(init.method).toBe('DELETE')
    expect(init.body).toBeUndefined()
    expect(init.headers).toEqual({ Accept: 'application/json', 'X-CSRF-Token': 'csrf' })
    await expect(unlinkProvider('csrf', 'password')).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
  it('starts provider round trips only toward the real providers', async () => {
    respond({ authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth?state=x' })
    expect(await startProviderFlow('csrf', 'link', 'google', '/account/security')).toBe('https://accounts.google.com/o/oauth2/v2/auth?state=x')
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/web/account/link/google/start')
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({ next: '/account/security' })
    respond({ authorization_url: 'https://appleid.apple.com/auth/authorize?x' })
    await startProviderFlow('csrf', 'reauth', 'apple', '/ja/account/security')
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/auth/web/account/reauth/apple/start')
    for (const url of ['https://evil.test/', 'javascript:alert(1)', 'https://accounts.google.com.evil.test/', undefined]) {
      respond({ authorization_url: url })
      await expect(startProviderFlow('csrf', 'link', 'github', '/account')).rejects.toMatchObject({ code: 'INVALID_RESPONSE' })
    }
    await expect(startProviderFlow('csrf', 'login', 'github', '/')).rejects.toMatchObject({ code: 'BAD_REQUEST' })
    await expect(startProviderFlow('csrf', 'link', 'facebook', '/')).rejects.toMatchObject({ code: 'BAD_REQUEST' })
  })
  it.each([
    ['?linked=google', { type: 'linked', provider: 'google' }],
    ['?linked=facebook', null],
    ['?reauth=ok', { type: 'reauth' }],
    ['?link_error=AUTH_PROVIDER_IN_USE', { type: 'error', code: 'AUTH_PROVIDER_IN_USE' }],
    ['?reauth_error=<script>', { type: 'error', code: 'INTERNAL' }],
    ['', null],
  ])('reads the provider outcome %s', (search, expected) => {
    expect(parseSecurityReturn(search)).toEqual(expected)
  })
})
