import { parsePath } from './localePath'
import { safeNextPath } from './authApi'

export function isAuthRoute(pathname) {
  const { route } = parsePath(pathname)
  return route.toLowerCase() === '/login' || route.toLowerCase() === '/login/complete'
}

// Capture before React (including StrictMode) or language preferences run.
// This value never leaves the current document's memory.
let transaction = ''
let next = ''
export function captureAuthTransaction(browser = window) {
  transaction = ''
  next = ''
  if (!isAuthRoute(browser.location.pathname)) return
  const params = new URLSearchParams(browser.location.search)
  const ids = params.getAll('transaction')
  if (ids.length === 1 && /^[A-Za-z0-9_-]{43}$/.test(ids[0])) transaction = ids[0]
  // A website sign-in may name the account page to return to.
  const targets = params.getAll('next')
  if (targets.length === 1) next = safeNextPath(targets[0], '')
  browser.history.replaceState(null, '', browser.location.pathname)
}

export function getAuthTransaction() { return transaction }
export function getLoginNext() { return next }
