// @vitest-environment jsdom
import React, { act, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import OrderPanel from './OrderPanel'
import { checkoutCopy } from './checkoutCopy'
import { readPackSelection, stripeErrorKey, useStripeCheckout, waitFor, writePackSelection } from './useStripeCheckout'
import { readIntent, sameSelection, writeIntent } from './usePrepaidOrder'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
globalThis.React = React

let root
let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('OrderPanel', () => {
  it('shows a checkout bar while the order is off screen', async () => {
    let report
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback) { report = callback }
      observe = observe
      disconnect = disconnect
    })
    const onClick = vi.fn()
    await act(async () => {
      root.render(<OrderPanel copy={checkoutCopy('en')} title="Pro · 1 month" total="" action={{ label: 'Pay', onClick }} />)
    })
    expect(observe).toHaveBeenCalled()
    expect(container.textContent).toContain('—')
    await act(async () => report([{ isIntersecting: false }]))
    const panel = container.querySelector('aside')
    panel.scrollIntoView = vi.fn()
    const bar = [...container.querySelectorAll('button')].find((node) => node.textContent === 'Checkout')
    await act(async () => bar.click())
    expect(panel.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
    await act(async () => report([{ isIntersecting: true }]))
    expect(container.textContent).not.toContain('Checkout')
  })
})

describe('Stripe checkout helpers', () => {
  it('maps failures to messages', () => {
    expect(stripeErrorKey({ kind: 'conflict' })).toBe('conflict')
    expect(stripeErrorKey({ kind: 'checkout_pending' })).toBe('pending')
    expect(stripeErrorKey({ kind: 'reconciliation_required' })).toBe('reconciliation')
    expect(stripeErrorKey({ kind: 'rate_limited' }, 'credits')).toBe('rateLimited')
    expect(stripeErrorKey({ kind: 'rate_limited' })).toBe('failed')
    expect(stripeErrorKey({ code: 'CREDIT_PACK_REQUEST_EXPIRED' })).toBe('requestExpired')
    expect(stripeErrorKey({ kind: 'billing_disabled' })).toBe('billingDisabled')
    expect(stripeErrorKey(null)).toBe('failed')
  })

  it('waits and aborts the backoff', async () => {
    const controller = new AbortController()
    await expect(waitFor(1, controller.signal)).resolves.toBeUndefined()
    const pending = waitFor(1000, controller.signal)
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    await expect(waitFor(1, controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('stores pack selections best effort', () => {
    const storage = { items: {}, getItem(key) { return this.items[key] ?? null }, setItem(key, value) { this.items[key] = value }, removeItem(key) { delete this.items[key] } }
    writePackSelection('pack_s', storage)
    expect(readPackSelection(storage)).toBe('pack_s')
    writePackSelection('', storage)
    expect(readPackSelection(storage)).toBe('')
    const broken = { getItem() { throw new Error('denied') }, setItem() { throw new Error('denied') } }
    expect(() => writePackSelection('pack_s', broken)).not.toThrow()
    expect(readPackSelection(broken)).toBe('')
  })

  it('ignores stale responses, expiry and back-forward restores', async () => {
    let resolve
    const createMembershipCheckout = vi.fn(() => new Promise((next) => { resolve = next }))
    const redirect = vi.fn()
    const onExpired = vi.fn()
    const latest = {}
    function Harness({ token }) {
      const value = useStripeCheckout({ token, createMembershipCheckout, redirect, onExpired })
      useEffect(() => { latest.checkout = value })
      return <span>{value.busyKey}</span>
    }
    const checkout = new Proxy({}, { get: (_, key) => latest.checkout[key] })
    await act(async () => root.render(<Harness token="a" />))
    await act(async () => { checkout.subscribe('pro', 'month') })
    expect(container.textContent).toBe('plan:pro:month')
    await act(async () => { checkout.subscribe('pro', 'year') })
    expect(createMembershipCheckout).toHaveBeenCalledTimes(1)

    await act(async () => window.dispatchEvent(Object.assign(new Event('pageshow'), { persisted: true })))
    expect(container.textContent).toBe('')
    await act(async () => resolve('https://checkout.stripe.com/old'))
    expect(redirect).not.toHaveBeenCalled()

    createMembershipCheckout.mockRejectedValueOnce({ kind: 'expired_token' })
    await act(async () => { await checkout.subscribe('pro', 'month') })
    expect(onExpired).toHaveBeenCalled()
    await act(async () => root.render(<Harness token="" />))
    await act(async () => { await checkout.subscribe('pro', 'month') })
    expect(createMembershipCheckout).toHaveBeenCalledTimes(2)
  })
})

describe('prepaid intent storage', () => {
  it('validates stored intents', () => {
    const storage = { value: null, getItem() { return this.value }, setItem(_, value) { this.value = value }, removeItem() { this.value = null } }
    writeIntent({ request_id: 'r', plan_code: 'pro', billing_interval: 'quarter', channel: 'wechat_native' }, storage)
    expect(readIntent(storage)).toMatchObject({ request_id: 'r' })
    writeIntent({ request_id: 'r', plan_code: 'pro', billing_interval: 'week', channel: 'wechat_native' }, storage)
    expect(readIntent(storage)).toBeNull()
    writeIntent({ request_id: 'r', pack_code: 'pack_s', channel: 'stripe' }, storage)
    expect(readIntent(storage)).toBeNull()
    storage.value = '{bad json'
    expect(readIntent(storage)).toBeNull()
    writeIntent(null, storage)
    expect(storage.value).toBeNull()
    expect(() => writeIntent({}, { setItem() { throw new Error('denied') } })).not.toThrow()
  })

  it('compares purchase selections', () => {
    const intent = { request_id: 'r', plan_code: 'pro', billing_interval: 'month', channel: 'alipay_page' }
    expect(sameSelection(intent, { plan_code: 'pro', billing_interval: 'month', channel: 'alipay_page' })).toBe(true)
    expect(sameSelection(intent, { plan_code: 'pro', billing_interval: 'year', channel: 'alipay_page' })).toBe(false)
    expect(sameSelection(intent, { plan_code: 'pro', billing_interval: 'month', channel: 'wechat_native' })).toBe(false)
    expect(sameSelection({ pack_code: 'a', channel: 'alipay_page' }, { pack_code: 'a', channel: 'alipay_page' })).toBe(true)
    expect(sameSelection(null, intent)).toBe(false)
  })
})
