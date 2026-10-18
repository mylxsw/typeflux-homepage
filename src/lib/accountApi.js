// Website account session API (GUL-422). Every call is same-origin and relative:
// the session lives in an HttpOnly cookie behind the /api/v1/auth/web/ proxy, so
// it deliberately ignores VITE_API_BASE_URL and never handles a token in JS.
const ACCOUNT_BASE = '/api/v1/auth/web/account'

export const HANDOFF_TARGETS = ['account', 'usage', 'billing', 'plans', 'credits']

export class AccountApiError extends Error {
  constructor(code, status = 0) {
    super(code)
    this.name = 'AccountApiError'
    this.code = code
    this.status = status
  }
}

// bare marks the few legacy endpoints whose success body is not wrapped in the
// {code, data} envelope (their errors still are).
export async function accountRequest(path, { method = 'GET', body, csrf = '', signal, bare = false } = {}) {
  const write = method !== 'GET'
  let response
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      signal,
      headers: {
        Accept: 'application/json',
        ...(write ? { 'Content-Type': 'application/json' } : {}),
        ...(write && csrf ? { 'X-CSRF-Token': csrf } : {}),
      },
      ...(write ? { body: JSON.stringify(body || {}) } : {}),
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new AccountApiError('NETWORK_ERROR')
  }
  let envelope
  try {
    envelope = await response.json()
  } catch {
    throw new AccountApiError(response.ok ? 'INVALID_RESPONSE' : `HTTP_${response.status}`, response.status)
  }
  if (bare && response.ok && envelope && typeof envelope === 'object' && !('code' in envelope)) return envelope
  if (!response.ok || envelope?.code !== 'OK') {
    throw new AccountApiError(typeof envelope?.code === 'string' ? envelope.code : 'INVALID_RESPONSE', response.status)
  }
  return envelope.data
}

// fetchAccountSession never throws for a signed-out browser.
export async function fetchAccountSession({ signal } = {}) {
  const data = await accountRequest(`${ACCOUNT_BASE}/session`, { signal })
  if (!data?.authenticated) return { authenticated: false }
  const user = data.user || {}
  if (typeof user.email !== 'string' || !user.email || typeof data.csrf_token !== 'string' || !data.csrf_token) {
    throw new AccountApiError('INVALID_RESPONSE')
  }
  return {
    authenticated: true,
    user: {
      id: String(user.id || ''),
      email: user.email,
      name: typeof user.name === 'string' ? user.name : '',
      providers: Array.isArray(user.providers) ? user.providers.filter((p) => typeof p === 'string') : [],
    },
    csrf: data.csrf_token,
    persistent: Boolean(data.persistent),
    expiresAt: Number(data.expires_at) || 0,
  }
}

export function logoutAccount(csrf, { signal } = {}) {
  return accountRequest(`${ACCOUNT_BASE}/logout`, { method: 'POST', csrf, signal })
}

const HANDOFF_STATUSES = ['created', 'same', 'switched', 'mismatch']

export async function exchangeHandoff(code, { replace = false, signal } = {}) {
  const data = await accountRequest(`${ACCOUNT_BASE}/handoff`, { method: 'POST', body: { code, replace }, signal })
  if (!HANDOFF_STATUSES.includes(data?.status) || !HANDOFF_TARGETS.includes(data?.target)) {
    throw new AccountApiError('INVALID_RESPONSE')
  }
  return {
    status: data.status,
    target: data.target,
    email: String(data.email || ''),
    currentEmail: String(data.current_email || ''),
  }
}

// parseHandoffFragment reads `code` and `to` from /account/handoff#code=..&to=..
export function parseHandoffFragment(hash = '') {
  const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  const code = params.get('code') || ''
  const target = params.get('to') || 'account'
  return {
    code: /^[A-Za-z0-9_-]{43}$/.test(code) ? code : '',
    target: HANDOFF_TARGETS.includes(target) ? target : 'account',
  }
}

// handoffRoute maps a handoff target to its language-neutral website route.
export function handoffRoute(target) {
  return {
    account: '/account',
    usage: '/account/usage',
    billing: '/account/billing',
    plans: '/billing/plans',
    credits: '/billing/plans?tab=credits',
  }[target] || '/account'
}

export function fetchUsageStats({ signal } = {}) {
  return accountRequest(`${ACCOUNT_BASE}/usage/current-period/stats`, { signal })
}

export function fetchUsageBreakdown({ timeZone = '', signal } = {}) {
  const query = timeZone ? `?tz=${encodeURIComponent(timeZone)}` : ''
  return accountRequest(`${ACCOUNT_BASE}/usage/current-period/breakdown${query}`, { signal })
}

// /usage/records predates the envelope; the App depends on that shape.
export async function fetchUsageRecords({ limit = 10, signal } = {}) {
  const data = await accountRequest(`${ACCOUNT_BASE}/usage/records?limit=${encodeURIComponent(limit)}&offset=0`, { signal, bare: true })
  if (!Array.isArray(data?.records)) throw new AccountApiError('INVALID_RESPONSE')
  return data
}

export function fetchSubscription({ signal } = {}) {
  return accountRequest(`${ACCOUNT_BASE}/billing/subscription`, { signal })
}

// The usage breakdown follows the viewer's own calendar days.
export function browserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
  } catch {
    return ''
  }
}
