// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createWebEvent, getAnalyticsIdentity, sendEvents, trackedRedirect } from './analytics'

describe('web analytics', () => {
  beforeEach(() => {
    document.cookie = 'tf_vid=; Max-Age=0; Path=/'
    document.cookie = 'tf_sid=; Max-Age=0; Path=/'
    localStorage.clear()
  })

  it('keeps the visitor and rotates the session after inactivity', () => {
    const first = getAnalyticsIdentity(1_000)
    const active = getAnalyticsIdentity(1_000 + 10_000)
    const expired = getAnalyticsIdentity(1_000 + 31 * 60 * 1000)
    expect(active.visitorId).toBe(first.visitorId)
    expect(active.sessionId).toBe(first.sessionId)
    expect(expired.visitorId).toBe(first.visitorId)
    expect(expired.sessionId).not.toBe(first.sessionId)
  })

  it('builds a valid anonymous page event', () => {
    const event = createWebEvent('page_view')
    expect(event.event_name).toBe('page_view')
    expect(event.source).toBe('web')
    expect(event.visitor_id).toMatch(/^[0-9a-f-]{36}$/)
    expect(event.session_id).toMatch(/^[0-9a-f-]{36}$/)
  })

  it('falls back to keepalive fetch when sendBeacon declines the payload', async () => {
	localStorage.setItem('typeflux-cookie-consent', 'accepted')
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: vi.fn(() => false) })
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 202 }))
    sendEvents([{ event_id: crypto.randomUUID() }])
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/analytics/events/batch', expect.objectContaining({ method: 'POST', keepalive: true }))
  })

  it('does not send or create identity cookies before consent', () => {
    const beacon = vi.fn(() => true)
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: beacon })
    sendEvents([{ event_id: crypto.randomUUID() }])
    expect(beacon).not.toHaveBeenCalled()
    expect(document.cookie).not.toContain('tf_vid=')
    expect(document.cookie).not.toContain('tf_sid=')
  })

  it('keeps tracked external links in a new tab and adds the click context', () => {
    localStorage.setItem('typeflux-cookie-consent', 'accepted')
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: vi.fn(() => true) })
    const anchor = document.createElement('a')
    anchor.target = '_blank'
    anchor.href = '/go/github/repository'
    const preventDefault = vi.fn()

    trackedRedirect({ currentTarget: anchor, preventDefault, defaultPrevented: false, button: 0 }, 'github_click', '/go/github/repository', 'test', { asset_key: 'repository' })

    expect(preventDefault).not.toHaveBeenCalled()
    expect(anchor.href).toContain('/go/github/repository?')
    expect(anchor.href).toContain('click_id=')
    expect(anchor.href).toContain('placement=test')
  })
})
