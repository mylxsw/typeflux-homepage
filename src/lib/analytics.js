const VISITOR_COOKIE = 'tf_vid'
const SESSION_COOKIE = 'tf_sid'
const SESSION_ACTIVITY_KEY = 'tf_sid_last'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const CONSENT_KEY = 'typeflux-cookie-consent'
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function apiURL(path) {
  return `${API_BASE}${path}`
}

export function hasAnalyticsConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'accepted'
}

export function clearAnalyticsIdentity() {
  localStorage.removeItem(SESSION_ACTIVITY_KEY)
  expireCookie(VISITOR_COOKIE)
  expireCookie(SESSION_COOKIE)
}

export function getAnalyticsIdentity(now = Date.now()) {
  let visitorId = readCookie(VISITOR_COOKIE)
  if (!isUUID(visitorId)) {
    visitorId = crypto.randomUUID()
    writeCookie(VISITOR_COOKIE, visitorId, 180 * 24 * 60 * 60)
  }
  const lastActivity = Number(localStorage.getItem(SESSION_ACTIVITY_KEY) || 0)
  let sessionId = readCookie(SESSION_COOKIE)
  if (!isUUID(sessionId) || now - lastActivity > SESSION_TIMEOUT_MS) {
    sessionId = crypto.randomUUID()
  }
  writeCookie(SESSION_COOKIE, sessionId, SESSION_TIMEOUT_MS / 1000)
  localStorage.setItem(SESSION_ACTIVITY_KEY, String(now))
  return { visitorId, sessionId }
}

export function createWebEvent(eventName, fields = {}) {
  const { visitorId, sessionId } = getAnalyticsIdentity()
  const query = new URLSearchParams(window.location.search)
  return {
    event_id: fields.event_id || crypto.randomUUID(), event_name: eventName, source: 'web',
    occurred_at: new Date().toISOString(), visitor_id: visitorId, session_id: sessionId,
    page_path: window.location.pathname, referrer: document.referrer || '',
    utm_source: query.get('utm_source') || '', utm_medium: query.get('utm_medium') || '',
    utm_campaign: query.get('utm_campaign') || '',
    properties: { language: navigator.language || '', ...(fields.properties || {}) }, ...fields,
  }
}

export function sendEvents(events) {
  if (!events.length || !hasAnalyticsConsent()) return
  const body = JSON.stringify({ events })
  const endpoint = apiURL('/api/v1/analytics/events/batch')
  if (navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }))) return
  void fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {})
}

export function trackPageView() {
  if (!hasAnalyticsConsent()) return
  const events = [createWebEvent('page_view')]
  if (window.location.pathname === '/releases') events.push(createWebEvent('download_page_view'))
  sendEvents(events)
}

export function trackedRedirect(event, eventName, path, placement, fields = {}) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const target = new URL(apiURL(path), window.location.origin)
  if (hasAnalyticsConsent()) {
    const clickId = crypto.randomUUID()
    sendEvents([createWebEvent(eventName, { event_id: clickId, placement, ...fields })])
    target.searchParams.set('click_id', clickId)
  }
  target.searchParams.set('placement', placement)
  if (event.currentTarget?.target === '_blank') {
    event.currentTarget.href = target.toString()
    return
  }
  event.preventDefault()
  window.location.assign(target.toString())
}

function readCookie(name) {
  const prefix = `${name}=`
  return document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix))?.slice(prefix.length) || ''
}

function writeCookie(name, value, maxAge) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const configuredDomain = (import.meta.env.VITE_ANALYTICS_COOKIE_DOMAIN || '').trim()
  const inferredDomain = window.location.hostname === 'typeflux.app' || window.location.hostname.endsWith('.typeflux.app') ? '.typeflux.app' : ''
  const domain = configuredDomain || inferredDomain
  const domainAttribute = domain ? `; Domain=${domain}` : ''
  document.cookie = `${name}=${value}; Max-Age=${Math.floor(maxAge)}; Path=/; SameSite=Lax${secure}${domainAttribute}`
}

function expireCookie(name) {
  const configuredDomain = (import.meta.env.VITE_ANALYTICS_COOKIE_DOMAIN || '').trim()
  const inferredDomain = window.location.hostname === 'typeflux.app' || window.location.hostname.endsWith('.typeflux.app') ? '.typeflux.app' : ''
  const domain = configuredDomain || inferredDomain
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
  if (domain) document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}; SameSite=Lax`
}

function isUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '')
}
