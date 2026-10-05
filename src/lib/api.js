const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export function apiURL(path) {
  if (/^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path}`
}
