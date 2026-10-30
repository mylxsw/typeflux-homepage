// @vitest-environment jsdom
import { useEffect } from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act } from 'react'
import { useSubscriptionChanges } from './useSubscriptionChanges'
import { mount, flush } from '../account/testUtils'

let view, flow, options
function Probe({ token = 'owner' }) {
  const state = useSubscriptionChanges({ ...options, token, enabled: true })
  useEffect(() => { flow = state })
  return <output>{state.order?.id || ''}|{state.order?.status || ''}|{state.quote?.quote_token || ''}</output>
}
const quote = { kind: 'upgrade', plan_code: 'premium', billing_interval: 'month', quote_token: 'reviewed', credits_delta: 300 }
const deferred = () => { let resolve; const promise = new Promise((done) => { resolve = done }); return { resolve, promise } }

beforeEach(() => {
  window.history.replaceState({}, '', '/billing/plans')
  options = { fetchChange: vi.fn(async () => null), previewChange: vi.fn(async () => quote), confirmChange: vi.fn(), cancelChange: vi.fn(), onComplete: vi.fn(), onExpired: vi.fn(), redirect: vi.fn() }
})
afterEach(() => { view?.unmount(); view = null; vi.restoreAllMocks() })

it('recovers an ambiguous confirm response without another payment request', async () => {
  let pending = null
  options.fetchChange = vi.fn(async () => pending)
  options.confirmChange = vi.fn(async () => { pending = { id: 'pending', status: 'open', url: 'https://checkout.stripe.com/pay' }; throw new Error('lost response') })
  view = mount(<Probe />); await view.render()
  await act(async () => flow.preview('premium', 'month')); await flush()
  await act(async () => flow.confirm()); await flush()
  expect(flow.order.status).toBe('open'); expect(flow.quote).toBeNull(); expect(options.confirmChange).toHaveBeenCalledTimes(1)
  await act(async () => flow.resume())
  expect(options.redirect).toHaveBeenCalledWith('https://checkout.stripe.com/pay')
})

it('ignores a late preview from a replaced account', async () => {
  const pending = deferred()
  options.previewChange.mockReturnValue(pending.promise)
  view = mount(<Probe />); await view.render()
  let request
  await act(async () => { request = flow.preview('premium', 'month') })
  await view.render(<Probe token="new-owner" />)
  await act(async () => { pending.resolve(quote); await request }); await flush()
  expect(flow.quote).toBeNull(); expect(flow.order).toBeNull()
  expect(options.confirmChange).not.toHaveBeenCalled()
})

it('prioritizes a current pending change over an older return URL', async () => {
  window.history.replaceState({}, '', '/billing/plans?change_order=old-applied')
  options.fetchChange = vi.fn(async () => ({ id: 'new-schedule', status: 'scheduled' }))
  view = mount(<Probe />); await view.render()
  expect(flow.order.id).toBe('new-schedule')
  expect(options.fetchChange).not.toHaveBeenCalledWith('owner', 'old-applied', expect.anything())
})

it('reports an expired billing credential without continuing payment', async () => {
  options.previewChange.mockRejectedValue({ kind: 'expired_token' })
  view = mount(<Probe />); await view.render()
  await act(async () => flow.preview('premium', 'month')); await flush()
  expect(options.onExpired).toHaveBeenCalledTimes(1)
  expect(options.redirect).not.toHaveBeenCalled()
})
