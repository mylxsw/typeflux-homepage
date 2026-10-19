import { localizedPath } from './localePath'
import { handoffRoute, parseHandoffFragment } from './accountApi'

// Language-neutral routes of the signed-in account area.
export const ACCOUNT_ROUTES = ['/account', '/account/usage', '/account/billing']
export const HANDOFF_ROUTE = '/account/handoff'

// Read and strip the one-time App handoff code before anything else can observe
// the URL. The value lives only in this module's memory for the current document.
let captured = null
export function captureHandoff(browser = window) {
  if (captured) return captured
  captured = parseHandoffFragment(browser.location.hash)
  browser.history.replaceState(null, '', browser.location.pathname)
  return captured
}

export function resetHandoffCapture() {
  captured = null
}

// handoffDestination resolves the localized page to open after a handoff.
export function handoffDestination(lang, target) {
  const [path, query] = handoffRoute(target).split('?')
  return `${localizedPath(lang, path)}${query ? `?${query}` : ''}`
}

// loginURL sends a signed-out visitor to the website sign-in, returning to next.
export function loginURL(lang, next) {
  return `${localizedPath(lang, '/login')}?next=${encodeURIComponent(next)}`
}
