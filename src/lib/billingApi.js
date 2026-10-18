import { apiURL } from './api'

export const BILLING_PAGE_TOKEN_STORAGE_KEY = 'typeflux.billingPageToken'

export class BillingApiError extends Error {
  constructor(kind, { code = '', status = 0 } = {}) {
    super(kind)
    this.name = 'BillingApiError'
    this.kind = kind
    this.code = code
    this.status = status
  }
}

export function parseBillingPageToken(hash = '') {
  const value = hash.startsWith('#') ? hash.slice(1) : hash
  return new URLSearchParams(value).get('t')?.trim() || ''
}

export function resolveBillingPageToken(hash = '', storage) {
  const token = parseBillingPageToken(hash)
  if (token) {
    return {
      token,
      fromHash: true,
      persisted: writeStoredBillingPageToken(token, storage),
    }
  }

  return {
    token: readStoredBillingPageToken(storage),
    fromHash: false,
    persisted: false,
  }
}

export function clearStoredBillingPageToken(storage) {
  try {
    resolveSessionStorage(storage)?.removeItem(BILLING_PAGE_TOKEN_STORAGE_KEY)
  } catch {
    // Storage can be disabled by privacy settings. There is nothing to clear.
  }
}

export function clearBillingPageToken(location = window.location, history = window.history) {
  history.replaceState(history.state, '', `${location.pathname}${location.search}`)
}

export async function fetchBillingPlans(token, { signal, lang = '' } = {}) {
  const query = new URLSearchParams()
  if (lang) query.set('lang', lang)
  const suffix = query.size > 0 ? `?${query}` : ''
  const data = await request(`/api/v1/billing/plans${suffix}`, token, { signal })
  if (!data || !Array.isArray(data.plans)) {
    throw new BillingApiError('invalid_response')
  }

  return {
    billingEnabled: Boolean(data.billing_enabled),
    plans: data.plans.map(normalizePlan).filter((plan) => plan.code),
    currentSubscription: data.current_subscription || null,
  }
}

export async function createBillingCheckoutSession(token, planCode, billingInterval, { signal } = {}) {
  const data = await request('/api/v1/billing/web-checkout-session', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_code: planCode, billing_interval: billingInterval }),
    signal,
  })

  if (!data?.url) {
    throw new BillingApiError('invalid_response')
  }

  return validateCheckoutURL(data.url)
}

export async function fetchCreditPacks(token, { signal, lang = '' } = {}) {
  const query = new URLSearchParams()
  if (lang) query.set('lang', lang)
  const suffix = query.size > 0 ? `?${query}` : ''
  const data = await request(`/api/v1/billing/credit-packs${suffix}`, token, { signal })
  if (!data || !Array.isArray(data.packs)) {
    throw new BillingApiError('invalid_response')
  }

  return {
    billingEnabled: Boolean(data.billing_enabled),
    packs: data.packs
      .map(normalizeCreditPack)
      .filter((pack) => pack.code)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    credits: normalizeCreditSummary(data.credits),
  }
}

// requestId identifies one purchase. Reuse it when retrying the same purchase
// after a transient failure; the server keys Stripe idempotency on it.
export async function createCreditPackCheckoutSession(token, packCode, requestId, { signal } = {}) {
  const data = await request('/api/v1/billing/web-credit-pack-checkout-session', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pack_code: packCode, request_id: requestId }),
    signal,
  })

  if (!data?.url) {
    throw new BillingApiError('invalid_response')
  }

  return { id: String(data.id || ''), url: validateCheckoutURL(data.url) }
}

export async function fetchCreditGrants(token, { cursor = '', limit = 20, signal } = {}) {
  const query = new URLSearchParams()
  if (cursor) query.set('cursor', cursor)
  query.set('limit', String(limit))
  const data = await request(`/api/v1/billing/credit-grants?${query}`, token, { signal })
  if (!data || (data.items != null && !Array.isArray(data.items))) {
    throw new BillingApiError('invalid_response')
  }

  return {
    items: (data.items || []).map(normalizeCreditGrant).filter((grant) => grant.id),
    nextCursor: String(data.next_cursor || ''),
  }
}

export async function fetchCheckoutSessionStatus(token, sessionId, { signal } = {}) {
  if (!sessionId) {
    throw new BillingApiError('invalid_request')
  }
  const data = await request(
    `/api/v1/billing/checkout-sessions/${encodeURIComponent(sessionId)}/status`,
    token,
    { signal },
  )
  const status = String(data?.status || '')
  if (!CHECKOUT_STATUSES.has(status)) {
    throw new BillingApiError('invalid_response')
  }
  return { id: String(data.id || sessionId), status }
}

export function createRequestId(cryptoImpl = globalThis.crypto) {
  if (typeof cryptoImpl?.randomUUID === 'function') return cryptoImpl.randomUUID()

  const bytes = new Uint8Array(16)
  if (typeof cryptoImpl?.getRandomValues === 'function') {
    cryptoImpl.getRandomValues(bytes)
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256)
  }
  // RFC 4122 version 4 layout.
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

const CHECKOUT_STATUSES = new Set(['pending', 'granted', 'failed'])

// sessionCredential lets every billing call run on the website account session
// instead of an App-issued billing-page token. The same API paths are served
// same-origin under the cookie-authenticated /api/v1/auth/web/account prefix.
export function sessionCredential(csrf) {
  return Object.freeze({ kind: 'session', csrf: String(csrf || '') })
}

export function isSessionCredential(token) {
  return Boolean(token && typeof token === 'object' && token.kind === 'session')
}

async function request(path, token, options = {}) {
  if (!token) {
    throw new BillingApiError('missing_token')
  }

  const session = isSessionCredential(token)
  const write = Boolean(options.method && options.method !== 'GET')
  let response
  try {
    response = await fetch(session ? path.replace(/^\/api\/v1\//, '/api/v1/auth/web/account/') : apiURL(path), {
      ...options,
      ...(session ? { credentials: 'same-origin', cache: 'no-store' } : {}),
      headers: {
        Accept: 'application/json',
        ...(session
          ? (write && token.csrf ? { 'X-CSRF-Token': token.csrf } : {})
          : { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new BillingApiError('network')
  }

  let envelope
  try {
    envelope = await response.json()
  } catch {
    if (!response.ok) {
      throw httpError(response.status)
    }
    throw new BillingApiError('invalid_response', { status: response.status })
  }

  if (!response.ok || envelope?.code !== 'OK') {
    throw httpError(response.status, envelope?.code)
  }
  if (!Object.prototype.hasOwnProperty.call(envelope, 'data')) {
    throw new BillingApiError('invalid_response', { status: response.status })
  }

  return envelope.data
}

function httpError(status, code = '') {
  if (status === 401 || status === 403 || code === 'AUTH_INVALID_TOKEN' || code === 'AUTH_REQUIRED') {
    return new BillingApiError('expired_token', { code, status })
  }
  if (code === 'BILLING_DISABLED') {
    return new BillingApiError('billing_disabled', { code, status })
  }
  // The server keeps an unresolved subscription checkout reserved. Retry the
  // same selection later; never start a different purchase around it.
  if (code === 'BILLING_CHECKOUT_PENDING') {
    return new BillingApiError('checkout_pending', { code, status })
  }
  // Changing plans cannot fix a customer that needs operator reconciliation.
  if (code === 'BILLING_CUSTOMER_RECONCILIATION_REQUIRED') {
    return new BillingApiError('reconciliation_required', { code, status })
  }
  if (status === 409) {
    return new BillingApiError('conflict', { code, status })
  }
  if (status === 429) {
    return new BillingApiError('rate_limited', { code, status })
  }
  if (status >= 500) {
    return new BillingApiError('unavailable', { code, status })
  }
  return new BillingApiError('request', { code, status })
}

function normalizePlan(plan) {
  const prices = Array.isArray(plan?.prices)
    ? plan.prices.map(normalizePrice).filter((price) => price.interval && (price.priceId || (price.provider === 'aidea' && price.priceCents > 0)))
    : []
  const features = Array.isArray(plan?.features)
    ? plan.features
      .filter((feature) => typeof feature === 'string' && feature.trim())
      .map((feature) => feature.trim())
    : []
  const selectedPrice = prices.find((price) => price.current)
    || prices.find((price) => price.default)
    || prices[0]
  return {
    code: String(plan?.code || ''),
    name: String(plan?.name || ''),
    description: String(plan?.description || ''),
    tagline: String(plan?.tagline || ''),
    usageSummary: String(plan?.usage_summary || '').trim(),
    features,
    interval: String(selectedPrice?.interval || plan?.interval || ''),
    prices,
    highlight: Boolean(plan?.highlight),
    // Older API versions omit `paid`; a plan with Stripe prices is a paid plan.
    paid: typeof plan?.paid === 'boolean' ? plan.paid : prices.length > 0,
    sortOrder: Number(plan?.sort_order || 0),
    monthlyCredits: Number(plan?.monthly_credits || 0),
    priceCents: Number(selectedPrice?.priceCents ?? plan?.price_cents ?? 0),
    currency: String(selectedPrice?.currency || plan?.currency || 'usd').toUpperCase(),
    currentPlan: Boolean(plan?.current_plan),
  }
}

function normalizePrice(price) {
  const discountPercent = Number(price?.discount_percent)
  return {
    ...(price?.provider === 'aidea' ? { provider: 'aidea', billingMode: 'prepaid', channels: Array.isArray(price?.channels) ? price.channels.filter((channel) => ['alipay_page', 'wechat_native'].includes(channel)) : [] } : {}),
    interval: String(price?.interval || ''),
    priceId: String(price?.price_id || ''),
    priceCents: Number(price?.price_cents || 0),
    currency: String(price?.currency || 'usd').toUpperCase(),
    default: Boolean(price?.default),
    current: Boolean(price?.current),
    discountPercent: Number.isFinite(discountPercent)
      ? Math.min(100, Math.max(0, Math.round(discountPercent)))
      : 0,
  }
}

function normalizeCreditPack(pack) {
  const validDays = Number(pack?.valid_days)
  return {
    code: String(pack?.code || ''),
    name: String(pack?.name || ''),
    description: String(pack?.description || ''),
    credits: finiteNumber(pack?.credits),
    validDays: Number.isFinite(validDays) && validDays > 0 ? validDays : 0,
    sortOrder: finiteNumber(pack?.sort_order),
    highlight: Boolean(pack?.highlight),
    available: Boolean(pack?.available),
    priceCents: finiteNumber(pack?.price_cents),
    currency: String(pack?.currency || 'usd').toUpperCase(),
    ...(Array.isArray(pack?.prices) ? { prices: pack.prices
      .filter((price) => ['stripe','aidea'].includes(price?.provider) && (price.provider !== 'aidea' || String(price.currency).toUpperCase() === 'CNY') && Number.isSafeInteger(price.price_cents) && price.price_cents > 0)
      .map((price) => ({ provider:price.provider, priceCents:price.price_cents, currency:String(price.currency).toUpperCase(), channels:Array.isArray(price.channels) ? price.channels.filter((channel) => ['wechat_native','alipay_page'].includes(channel)) : [] })) } : {}),
  }
}

function normalizeCreditSummary(credits) {
  const nextExpiry = credits?.addon?.next_expiry
  return {
    limit: finiteNumber(credits?.limit),
    used: finiteNumber(credits?.used),
    remaining: finiteNumber(credits?.remaining),
    unlimited: Boolean(credits?.unlimited),
    totalRemaining: finiteNumber(credits?.total_remaining),
    addon: {
      balance: finiteNumber(credits?.addon?.balance),
      usedThisPeriod: finiteNumber(credits?.addon?.used_this_period),
      remaining: finiteNumber(credits?.addon?.remaining),
      nextExpiry: nextExpiry?.expires_at
        ? { credits: finiteNumber(nextExpiry.credits), expiresAt: String(nextExpiry.expires_at) }
        : null,
    },
  }
}

function normalizeCreditGrant(grant) {
  return {
    id: String(grant?.id || ''),
    source: String(grant?.source || ''),
    packCode: String(grant?.pack_code || ''),
    credits: finiteNumber(grant?.credits),
    remaining: finiteNumber(grant?.remaining),
    amountCents: finiteNumber(grant?.amount_cents),
    currency: String(grant?.currency || '').toUpperCase(),
    sessionId: String(grant?.stripe_checkout_session_id || ''),
    status: String(grant?.status || ''),
    grantedAt: String(grant?.granted_at || ''),
    expiresAt: String(grant?.expires_at || ''),
  }
}

function finiteNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

function readStoredBillingPageToken(storage) {
  try {
    return resolveSessionStorage(storage)?.getItem(BILLING_PAGE_TOKEN_STORAGE_KEY)?.trim() || ''
  } catch {
    return ''
  }
}

function writeStoredBillingPageToken(token, storage) {
  try {
    const target = resolveSessionStorage(storage)
    if (!target) return false
    target.setItem(BILLING_PAGE_TOKEN_STORAGE_KEY, token)
    return true
  } catch {
    return false
  }
}

function resolveSessionStorage(storage) {
  if (storage !== undefined) return storage
  try {
    return globalThis.sessionStorage
  } catch {
    return null
  }
}

function validateCheckoutURL(value) {
  let url
  try {
    url = new URL(value, globalThis.location?.origin || 'http://localhost')
  } catch {
    throw new BillingApiError('invalid_response')
  }

  const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
  const allowed = url.protocol === 'https:' || (url.protocol === 'http:' && localHosts.has(url.hostname))
  if (!allowed || url.username || url.password) {
    throw new BillingApiError('invalid_response')
  }
  return url.toString()
}

export async function createPrepaidOrder(token, purchase, { signal } = {}) {
  return normalizePrepaidOrder(await request('/api/v1/billing/prepaid-orders', token, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(purchase), signal,
  }))
}

export async function fetchPrepaidOrder(token, id, { signal } = {}) {
  return normalizePrepaidOrder(await request(`/api/v1/billing/prepaid-orders/${encodeURIComponent(id)}`, token, { signal }))
}

export async function closePrepaidOrder(token, id, { signal } = {}) {
  return normalizePrepaidOrder(await request(`/api/v1/billing/prepaid-orders/${encodeURIComponent(id)}/close`, token, { method: 'POST', signal }))
}

export async function fetchPrepaidOrders(token, { signal } = {}) {
  const data = await request('/api/v1/billing/prepaid-orders?limit=20', token, { signal })
  if (!Array.isArray(data?.items)) throw new BillingApiError('invalid_response')
  return data.items
}

export async function openBillingManagement(token, { signal } = {}) {
  const data = await request('/api/v1/billing/web-portal-session', token, { method: 'POST', signal })
  if (!data?.url) throw new BillingApiError('invalid_response')
  return validateCheckoutURL(data.url)
}

function normalizePrepaidOrder(data) {
  if (data?.kind === 'credit_pack' && (!data.pack_code || !Number.isSafeInteger(data.credits) || data.credits <= 0 || !Number.isInteger(data.valid_days) || data.valid_days < 1 || data.valid_days > 3650)) throw new BillingApiError('invalid_response')
  if (!data?.id || !['creating', 'pending', 'init_failed', 'paid', 'closed'].includes(data.status)
    || !['pending', 'granted', 'review', 'refunded'].includes(data.fulfillment)
    || data.currency !== 'CNY' || !Number.isSafeInteger(data.amount_fen) || data.amount_fen <= 0) {
    throw new BillingApiError('invalid_response')
  }
  if (data.pay_url) {
    let url
    try { url = new URL(data.pay_url) } catch { throw new BillingApiError('invalid_response') }
    if (url.username || url.password || (data.action === 'qr_code'
      ? url.protocol !== 'weixin:' || url.hostname !== 'wxpay'
      : data.action !== 'redirect' || url.protocol !== 'https:')) {
      throw new BillingApiError('invalid_response')
    }
  }
  return data
}
