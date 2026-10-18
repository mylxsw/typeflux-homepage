// Shared rendering helpers for account component tests.
import { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, vi } from 'vitest'
import { I18nProvider } from '../../i18n/index.jsx'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { AccountSessionProvider } from '../../contexts/AccountSessionContext.jsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

export const signedIn = { authenticated: true, user: { id: 'u1', email: 'lin@example.com', name: '', providers: ['password'] }, csrf: 'csrf-1', persistent: true, expiresAt: 0 }

export function mount(children, { session = signedIn, enabled = true, logout = vi.fn(async () => ({})), load } = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const loader = load || vi.fn(async () => session)
  const view = {
    container,
    load: loader,
    logout,
    async render(node = children) {
      await act(async () => {
        root.render(<StrictMode><ThemeProvider><I18nProvider><AccountSessionProvider enabled={enabled} load={loader} logout={logout}>{node}</AccountSessionProvider></I18nProvider></ThemeProvider></StrictMode>)
      })
      await flush()
      return view
    },
    unmount() {
      act(() => root.unmount())
      container.remove()
    },
    text: () => container.textContent,
    find(selector, text) {
      return [...container.querySelectorAll(selector)].find((node) => text === undefined || node.textContent.includes(text))
    },
    async click(node) {
      expect(node).toBeTruthy()
      await act(async () => node.click())
      await flush()
    },
  }
  return view
}

export async function flush() {
  for (let i = 0; i < 5; i += 1) await act(async () => { await Promise.resolve() })
}

// routeFetch answers fetch calls by path prefix with an API envelope.
export function routeFetch(routes) {
  const fetchMock = vi.fn(async (path, init = {}) => {
    const key = Object.keys(routes).sort((a, b) => b.length - a.length).find((prefix) => String(path).startsWith(prefix))
    if (!key) return new Response(JSON.stringify({ code: 'NOT_FOUND' }), { status: 404 })
    const value = typeof routes[key] === 'function' ? await routes[key](path, init) : routes[key]
    if (value instanceof Response) return value
    return new Response(JSON.stringify({ code: 'OK', data: value }), { status: 200 })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function apiError(code, status) {
  return new Response(JSON.stringify({ code }), { status })
}
