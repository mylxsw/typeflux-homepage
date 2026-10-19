const BASE = '/api/v1/auth/web'
const STATES = ['pending', 'link_required', 'authenticated', 'code_issued', 'consumed', 'revoked']
export const PROVIDERS = ['google', 'github', 'apple']
const ACTIONS = ['login', 'register', 'activate', 'resend-activation', 'forgot-password', 'reset-password']
const HOSTS = { google: 'accounts.google.com', github: 'github.com', apple: 'appleid.apple.com' }

export class AuthApiError extends Error {
  constructor(code, status = 0, retryAfter = 0) {
    super(code)
    this.code = code
    this.status = status
    this.retryAfter = retryAfter
  }
}

export function retryAfterSeconds(value, now = Date.now()) {
  if (!value) return 0
  const seconds = /^\d+$/.test(value) ? Number(value) : (Date.parse(value) - now) / 1000
  return Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : 0
}

function invalid() { throw new AuthApiError('INVALID_RESPONSE') }

// Only starting a website sign-in is a write without a transaction CSRF token;
// the server protects it with the exact-Origin check instead.
async function request(path, { body, csrf, signal, anonymous = false } = {}) {
  if (body && path.startsWith(BASE) && !csrf && !anonymous) throw new AuthApiError('AUTH_CSRF_INVALID', 403)
  const controller = new AbortController()
  const abort = () => controller.abort()
  if (signal?.aborted) abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timeout = setTimeout(abort, 10000)
  try {
    const response = await fetch(path, {
      method: body ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
      redirect: 'error', referrerPolicy: 'no-referrer', signal: controller.signal,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(csrf ? { 'X-CSRF-Token': csrf } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const envelope = await response.json().catch(invalid)
    if (!response.ok || envelope?.code !== 'OK') {
      throw new AuthApiError(typeof envelope?.code === 'string' ? envelope.code : 'INVALID_RESPONSE', response.status, retryAfterSeconds(response.headers.get('Retry-After')))
    }
    if (!envelope.data || typeof envelope.data !== 'object') invalid()
    return envelope.data
  } catch (error) {
    if (error instanceof AuthApiError) throw error
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    throw new AuthApiError('NETWORK_ERROR')
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', abort)
  }
}

export function safeProviderURL(value, provider) {
  try {
    const url = new URL(value)
    if (url.protocol === 'https:' && url.hostname === HOSTS[provider] && !url.port && !url.username && !url.password) return url.href
  } catch { /* Reject malformed server responses without reflecting them. */ }
  return invalid()
}

export function safeAppURL(value, redirects = import.meta.env.VITE_WEB_AUTH_APP_REDIRECTS || 'ai.gulu.app.typeflux://auth/callback') {
  try {
    const url = new URL(value)
    const base = `${url.protocol}//${url.host}${url.pathname}`
    if (redirects.split(',').map(x => x.trim()).includes(base) && !url.username && !url.password && !url.hash &&
      /^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get('code') || '') &&
      /^[A-Za-z0-9._~-]{16,256}$/.test(url.searchParams.get('state') || '') &&
      url.searchParams.size === 2) return url.href
  } catch { /* Never navigate an unrecognized URL. */ }
  return invalid()
}

// Website sign-ins may only return to these same-origin pages.
const NEXT_PATH = /^\/(?:(?:zh-CN|zh-TW|ja|ko)\/)?(?:account(?:\/(?:usage|billing))?|billing\/plans)$/
export function safeNextPath(value, fallback = '/account') {
  return typeof value === 'string' && NEXT_PATH.test(value) ? value : fallback
}

export const authApi = {
  async session(transaction, signal) {
    const data = await request(`${BASE}/session?transaction=${encodeURIComponent(transaction)}`, { signal })
    if (data.transaction_id !== transaction || !STATES.includes(data.status) || !Number.isFinite(data.expires_at) ||
      typeof data.csrf_token !== 'string' || !Array.isArray(data.providers) ||
      (data.status !== 'revoked' && !data.csrf_token) ||
      (data.status === 'authenticated' && !data.email) ||
      (data.email != null && typeof data.email !== 'string') ||
      (data.link_provider && !PROVIDERS.includes(data.link_provider))) invalid()
    // Deliberately select only contract fields; no token-like extras reach UI.
    return { transaction_id: transaction, status: data.status, expires_at: data.expires_at, csrf_token: data.csrf_token,
      providers: data.providers.filter(p => ['password', ...PROVIDERS].includes(p)), email: data.email || '',
      link_provider: data.link_provider || '', error_code: typeof data.error_code === 'string' ? data.error_code : '',
      mode: data.mode === 'web' ? 'web' : 'app', next: data.mode === 'web' ? safeNextPath(data.next) : '' }
  },
  async enterEmail(email, signal) {
    const data = await request('/api/v1/auth/enter-email', { body: { email }, signal })
    if (!['login', 'register'].includes(data.next)) invalid()
    return data.next
  },
  async email(action, fields, session, signal) {
    if (!ACTIONS.includes(action)) throw new AuthApiError('BAD_REQUEST')
    const data = await request(`${BASE}/email/${action}`, { body: { ...fields, transaction_id: session.transaction_id }, csrf: session.csrf_token, signal })
    if (!['login', 'activate', 'reset-password', 'complete'].includes(data.next)) invalid()
    return data.next
  },
  async provider(provider, session, signal) {
    if (!PROVIDERS.includes(provider)) throw new AuthApiError('AUTH_PROVIDER_UNAVAILABLE')
    const data = await request(`${BASE}/oauth/${provider}/start`, { body: { transaction_id: session.transaction_id }, csrf: session.csrf_token, signal })
    return safeProviderURL(data.authorization_url, provider)
  },
  // remember signs this browser in to the website too (always for website sign-ins,
  // where it selects a remembered rather than browser-session cookie).
  async complete(session, link, signal, remember = false) {
    const data = await request(`${BASE}/complete`, { body: { transaction_id: session.transaction_id, confirm: true,
      ...(link ? { link_provider: true } : {}), ...(remember ? { remember_browser: true } : {}) }, csrf: session.csrf_token, signal })
    if (!Number.isFinite(data.expires_at)) invalid()
    if (data.mode === 'web') return { mode: 'web', next: safeNextPath(data.next), expires_at: data.expires_at }
    return { mode: 'app', redirect_url: safeAppURL(data.redirect_url), expires_at: data.expires_at }
  },
  // startWeb creates a website sign-in transaction (no App involved).
  async startWeb(next, signal) {
    const data = await request(`${BASE}/transactions`, { body: { persistent: false, next: safeNextPath(next) }, anonymous: true, signal })
    if (!/^[A-Za-z0-9_-]{43}$/.test(data.transaction_id || '')) invalid()
    return data.transaction_id
  },
}
