import { afterEach, expect, it, vi } from 'vitest'
import { webAuthEnabled } from './authConfig'
import { SITE_ORIGIN } from './site'

afterEach(() => vi.unstubAllEnvs())

it.each([undefined, 'false', 'invalid'])('keeps production sign-in on with flag %s', (flag) => {
  vi.stubEnv('VITE_WEB_AUTH_ENABLED', flag)
  expect(webAuthEnabled(SITE_ORIGIN)).toBe(true)
  expect(webAuthEnabled('https://preview.typeflux.app')).toBe(false)
  expect(webAuthEnabled('https://typeflux.app.example')).toBe(false)
})

it('honors the build flag on local and preview origins', () => {
  vi.stubEnv('VITE_WEB_AUTH_ENABLED', 'true')
  expect(webAuthEnabled('http://localhost:5174')).toBe(true)
  expect(webAuthEnabled('https://preview.typeflux.app')).toBe(true)
})
