// External script permits a strict script-src 'self' on authentication pages.
try {
  const saved = localStorage.getItem('typeflux-theme')
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.dataset.theme = saved === 'light' || saved === 'dark' ? saved : dark ? 'dark' : 'light'
} catch { /* A disabled storage preference must not prevent sign-in. */ }
