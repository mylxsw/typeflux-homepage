import { apiURL } from './api'

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

export function clearBillingPageToken(location = window.location, history = window.history) {
  history.replaceState(history.state, '', `${location.pathname}${location.search}`)
}

export async function fetchBillingPlans(token, { signal } = {}) {
  const data = await request('/api/v1/billing/plans', token, { signal })
  if (!data || !Array.isArray(data.plans)) {
    throw new BillingApiError('invalid_response')
  }

  return {
    billingEnabled: Boolean(data.billing_enabled),
    plans: data.plans.map(normalizePlan).filter((plan) => plan.code),
    currentSubscription: data.current_subscription || null,
  }
}

export async function createBillingCheckoutSession(token, planCode, { signal } = {}) {
  const data = await request('/api/v1/billing/web-checkout-session', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan_code: planCode }),
    signal,
  })

  if (!data?.url) {
    throw new BillingApiError('invalid_response')
  }

  return validateCheckoutURL(data.url)
}

async function request(path, token, options = {}) {
  if (!token) {
    throw new BillingApiError('missing_token')
  }

  let response
  try {
    response = await fetch(apiURL(path), {
      ...options,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
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
  if (status === 409) {
    return new BillingApiError('conflict', { code, status })
  }
  if (status >= 500) {
    return new BillingApiError('unavailable', { code, status })
  }
  return new BillingApiError('request', { code, status })
}

function normalizePlan(plan) {
  return {
    code: String(plan?.code || ''),
    name: String(plan?.name || ''),
    description: String(plan?.description || ''),
    interval: String(plan?.interval || ''),
    features: Array.isArray(plan?.features) ? plan.features.map(String) : [],
    highlight: Boolean(plan?.highlight),
    sortOrder: Number(plan?.sort_order || 0),
    priceCents: Number(plan?.price_cents || 0),
    currency: String(plan?.currency || 'usd').toUpperCase(),
    currentPlan: Boolean(plan?.current_plan),
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
  if (!allowed) {
    throw new BillingApiError('invalid_response')
  }
  return url.toString()
}
