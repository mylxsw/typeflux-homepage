import { SITE_ORIGIN } from './site'

const PRODUCTION_APP_CALLBACK = 'ai.gulu.app.typeflux://auth/callback'

export function buildWebAuthEnabled() {
  return import.meta.env.VITE_WEB_AUTH_ENABLED === 'true'
}

export function webAuthEnabled(origin = globalThis.location?.origin) {
  return origin === SITE_ORIGIN || buildWebAuthEnabled()
}

export function webAuthAppRedirects(origin = globalThis.location?.origin) {
  if (origin === SITE_ORIGIN) return PRODUCTION_APP_CALLBACK
  return import.meta.env.VITE_WEB_AUTH_APP_REDIRECTS || PRODUCTION_APP_CALLBACK
}
