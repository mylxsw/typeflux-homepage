import { describe, expect, it } from 'vitest'
import { isPublicRoute, PUBLIC_ROUTES } from './routes'

describe('routes', () => {
  it('marks the prerendered public routes', () => {
    expect(PUBLIC_ROUTES).toEqual(['/', '/releases', '/privacy', '/terms'])
    for (const route of PUBLIC_ROUTES) {
      expect(isPublicRoute(route)).toBe(true)
    }
  })

  it('excludes billing and unknown routes from prerendering', () => {
    expect(isPublicRoute('/billing/plans')).toBe(false)
    expect(isPublicRoute('/billing/success')).toBe(false)
    expect(isPublicRoute('/settings/billing')).toBe(false)
    expect(isPublicRoute('/does-not-exist')).toBe(false)
  })
})
