// @vitest-environment jsdom
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBillingAccess, parseBillingHandoff } from './useBillingAccess'
import { isSessionCredential } from '../../lib/billingApi'
import { mount } from '../account/testUtils'

const code = 'H'.repeat(43)
let view, exchange, seen
function Probe() {
  const access = useBillingAccess({ exchange })
  useEffect(() => { seen = access })
  return <div>
    <output>{access.status}|{access.source}|{isSessionCredential(access.token) ? `session:${access.token.csrf}` : access.token}</output>
    {access.status === 'mismatch' && <><button onClick={() => access.choose(true)}>switch</button><button onClick={() => access.choose(false)}>keep</button></>}
  </div>
}
const out = () => view.container.querySelector('output').textContent

beforeEach(() => { sessionStorage.clear(); exchange = vi.fn() })
afterEach(() => { view?.unmount(); view = null })

const at = (hash) => window.history.replaceState({}, '', `/billing/plans${hash}`)

describe('useBillingAccess', () => {
  it('parses only well-formed handoff codes', () => {
    expect(parseBillingHandoff(`#t=x&h=${code}`)).toBe(code)
    expect(parseBillingHandoff('#h=short')).toBe('')
    expect(parseBillingHandoff('')).toBe('')
  })
  it('uses the App page token when there is no handoff code', async () => {
    at('#t=page-token')
    view = await mount(<Probe />).render()
    expect(out()).toBe('ready|page|page-token')
    expect(location.hash).toBe('')
  })
  it('signs in from a handoff code, strips it and uses the session', async () => {
    at(`?tab=credits#t=page-token&h=${code}`)
    exchange.mockResolvedValue({ status: 'created', target: 'plans' })
    view = await mount(<Probe />).render()
    expect(exchange).toHaveBeenCalledTimes(1)
    expect(exchange).toHaveBeenCalledWith(code)
    expect(out()).toBe('ready|session|session:csrf-1')
    expect(location.hash).toBe('')
    expect(location.search).toBe('?tab=credits')
  })
  it('falls back to the page token when the code is spent', async () => {
    at(`#t=page-token&h=${code}`)
    exchange.mockRejectedValue(new Error('AUTH_HANDOFF_INVALID'))
    view = await mount(<Probe />).render()
    expect(out()).toBe('ready|page|page-token')
  })
  it('asks before replacing another signed-in account', async () => {
    at(`#h=${code}`)
    exchange.mockResolvedValueOnce({ status: 'mismatch', target: 'plans', email: 'app@x.y', currentEmail: 'web@x.y' })
    view = await mount(<Probe />).render()
    expect(out()).toBe('mismatch||')
    expect(seen.mismatch.result.currentEmail).toBe('web@x.y')
    exchange.mockRejectedValueOnce(new Error('offline'))
    await view.click(view.find('button', 'switch'))
    expect(seen.mismatch.failed).toBe(true)
    exchange.mockResolvedValueOnce({ status: 'switched', target: 'plans' })
    await view.click(view.find('button', 'switch'))
    expect(exchange).toHaveBeenLastCalledWith(code, { replace: true })
    expect(out()).toBe('ready|session|session:csrf-1')
  })
  it('keeps the browser account when chosen', async () => {
    at(`#h=${code}`)
    exchange.mockResolvedValueOnce({ status: 'mismatch', target: 'plans', email: 'app@x.y', currentEmail: 'web@x.y' })
    view = await mount(<Probe />).render()
    await view.click(view.find('button', 'keep'))
    expect(out()).toBe('ready|session|session:csrf-1')
  })
  it('uses an existing session, waits while it loads, or has nothing', async () => {
    at('')
    view = await mount(<Probe />, { load: () => new Promise(() => {}) }).render()
    expect(out()).toBe('resolving||')
    view.unmount()
    view = await mount(<Probe />).render()
    expect(out()).toBe('ready|session|session:csrf-1')
    view.unmount()
    view = await mount(<Probe />, { session: { authenticated: false } }).render()
    expect(out()).toBe('ready||')
  })
  it('ignores handoff codes when website sessions are disabled', async () => {
    at(`#t=page-token&h=${code}`)
    view = await mount(<Probe />, { enabled: false }).render()
    expect(exchange).not.toHaveBeenCalled()
    expect(out()).toBe('ready|page|page-token')
  })
})
