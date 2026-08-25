// Lets the prerenderer inject the current request path when no `window` exists.
// In the browser everything reads from `window.location` as before.

let ssrPath = '/'

export function setSSRPath(path) {
  ssrPath = path || '/'
}

export function getPathname() {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.pathname
  }

  return ssrPath
}
