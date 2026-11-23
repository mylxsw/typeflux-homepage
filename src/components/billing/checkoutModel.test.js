import { describe, expect, it } from 'vitest'
import {
  defaultMethod,
  membershipBlock,
  membershipMethods,
  membershipTerms,
  methodLabel,
  normalizeTerm,
  orderPhase,
  packMethods,
  packPrice,
  packValue,
  planPrice,
  planSavings,
  purchasablePlans,
  subscriptionState,
  termSavings,
} from './checkoutModel'
import { formatDate, formatMessage, formatNumber, formatPrice } from './format'

const stripeMonth = { interval: 'month', priceId: 'p_m', priceCents: 399, currency: 'USD' }
const stripeYear = { interval: 'year', priceId: 'p_y', priceCents: 3999, currency: 'USD', discountPercent: 16 }
const cny = (interval, priceCents, channels = ['alipay_page', 'wechat_native']) => ({ provider: 'aidea', interval, priceCents, currency: 'CNY', channels })
const pro = { code: 'pro', paid: true, prices: [stripeMonth, stripeYear, cny('month', 1900), cny('quarter', 4900), cny('year', 16900, ['alipay_page'])] }
const free = { code: 'free', paid: false, prices: [] }

describe('membership offers', () => {
  it('normalizes billing intervals', () => {
    expect(['monthly', 'Quarterly', 'annual', 'year', 'week'].map(normalizeTerm)).toEqual(['month', 'quarter', 'year', 'year', ''])
  })

  it('selects the price of one payment method and term', () => {
    expect(planPrice(pro, 'stripe', 'month')).toBe(stripeMonth)
    expect(planPrice(pro, 'stripe', 'quarter')).toBeNull()
    expect(planPrice(pro, 'wechat_native', 'quarter').priceCents).toBe(4900)
    expect(planPrice(pro, 'wechat_native', 'year')).toBeNull()
    expect(planPrice(pro, 'alipay_page', 'year').priceCents).toBe(16900)
    expect(planPrice(pro, 'paypal', 'month')).toBeNull()
    expect(planPrice(null, 'stripe', 'month')).toBeNull()
  })

  it('lists purchasable plans, methods and terms', () => {
    expect(purchasablePlans([free, pro])).toEqual([pro])
    expect(membershipMethods([pro])).toEqual(['stripe', 'alipay_page', 'wechat_native'])
    expect(membershipTerms([pro], 'stripe')).toEqual(['month', 'year'])
    expect(membershipTerms([pro], 'wechat_native')).toEqual(['month', 'quarter'])
    expect(membershipMethods()).toEqual([])
  })

  it('computes savings against the same method monthly price', () => {
    expect(planSavings(pro, 'alipay_page', 'quarter')).toBe(14)
    expect(planSavings(pro, 'alipay_page', 'month')).toBe(0)
    expect(planSavings(pro, 'stripe', 'year')).toBe(16)
    expect(planSavings({ prices: [stripeYear] }, 'stripe', 'year')).toBe(16)
    expect(planSavings(pro, 'stripe', 'quarter')).toBe(0)
    expect(termSavings([pro, free], 'alipay_page', 'year')).toBe(26)
  })
})

describe('credit pack offers', () => {
  const packs = [
    { code: 's', credits: 100, prices: [{ provider: 'stripe', priceCents: 100, currency: 'USD' }, { provider: 'aidea', priceCents: 700, currency: 'CNY', channels: ['wechat_native'] }] },
    { code: 'm', credits: 250, prices: [{ provider: 'stripe', priceCents: 200, currency: 'USD' }] },
    { code: 'legacy', credits: 50, available: true, priceCents: 90, currency: 'USD' },
    { code: 'off', credits: 50, available: false, priceCents: 90, currency: 'USD' },
  ]

  it('reads provider offers and legacy Stripe prices', () => {
    expect(packPrice(packs[0], 'wechat_native')).toEqual({ priceCents: 700, currency: 'CNY' })
    expect(packPrice(packs[0], 'alipay_page')).toBeNull()
    expect(packPrice(packs[1], 'stripe')).toEqual({ priceCents: 200, currency: 'USD' })
    expect(packPrice(packs[2], 'stripe')).toEqual({ priceCents: 90, currency: 'USD' })
    expect(packPrice(packs[2], 'wechat_native')).toBeNull()
    expect(packPrice(packs[3], 'stripe')).toBeNull()
    expect(packMethods(packs)).toEqual(['stripe', 'wechat_native'])
  })

  it('ranks bonus and best value within one method', () => {
    expect(packValue(packs, 'stripe')).toEqual({ bonus: { s: 0, m: 25, legacy: 0 }, bestValue: 'm' })
    expect(packValue(packs, 'wechat_native')).toEqual({ bonus: { s: 0 }, bestValue: '' })
    expect(packValue([], 'stripe')).toEqual({ bonus: {}, bestValue: '' })
  })
})

describe('eligibility', () => {
  const stripeSub = { paid: true, active: true, billing_mode: 'subscription', plan_code: 'pro', current_period_end: '2026-11-01T00:00:00Z' }
  const prepaidSub = { paid: true, active: true, billing_mode: 'prepaid', plan_code: 'pro', current_period_end: '2026-12-01T00:00:00Z' }

  it('summarizes the active subscription', () => {
    expect(subscriptionState(null)).toEqual({ stripe: false, prepaid: false, planCode: '', periodEnd: '' })
    expect(subscriptionState(stripeSub)).toMatchObject({ stripe: true, planCode: 'pro' })
    expect(subscriptionState(prepaidSub)).toMatchObject({ prepaid: true, periodEnd: '2026-12-01T00:00:00Z' })
    expect(subscriptionState({ ...stripeSub, active: false }).stripe).toBe(false)
  })

  it('explains why a membership purchase is blocked', () => {
    const premium = { code: 'premium' }
    expect(membershipBlock({ subscription: null, plan: pro, method: 'stripe' })).toBe('')
    expect(membershipBlock({ subscription: stripeSub, plan: pro, method: 'stripe' })).toBe('currentPlan')
    expect(membershipBlock({ subscription: stripeSub, plan: premium, method: 'stripe' })).toBe('stripeManage')
    expect(membershipBlock({ subscription: stripeSub, plan: premium, method: 'wechat_native' })).toBe('stripeActive')
    expect(membershipBlock({ subscription: prepaidSub, plan: pro, method: 'stripe' })).toBe('stripeAfterPrepaid')
    expect(membershipBlock({ subscription: prepaidSub, plan: pro, method: 'alipay_page' })).toBe('')
    expect(membershipBlock({ subscription: prepaidSub, plan: premium, method: 'alipay_page' })).toBe('prepaidOtherPlan')
  })

  it('prefers the payment method that fits the account and language', () => {
    const all = ['stripe', 'alipay_page', 'wechat_native']
    expect(defaultMethod(all, { lang: 'en' })).toBe('stripe')
    expect(defaultMethod(all, { lang: 'zh-CN' })).toBe('wechat_native')
    expect(defaultMethod(['stripe', 'alipay_page'], { lang: 'zh-TW' })).toBe('alipay_page')
    expect(defaultMethod(all, { lang: 'zh-CN', subscription: stripeSub })).toBe('stripe')
    expect(defaultMethod(['alipay_page'], { lang: 'en', subscription: stripeSub })).toBe('alipay_page')
    expect(defaultMethod(all, { lang: 'en', subscription: prepaidSub })).toBe('wechat_native')
    expect(defaultMethod()).toBe('')
  })
})

describe('order presentation', () => {
  it('maps order states to dialog phases', () => {
    const base = { status: 'pending', fulfillment: 'pending' }
    expect(orderPhase(null)).toBe('none')
    expect(orderPhase(base)).toBe('preparing')
    expect(orderPhase({ ...base, pay_url: 'weixin://wxpay/x', action: 'qr_code' })).toBe('qr')
    expect(orderPhase({ ...base, pay_url: 'https://alipay', action: 'redirect' })).toBe('redirect')
    expect(orderPhase({ ...base, status: 'paid' })).toBe('fulfilling')
    expect(orderPhase({ ...base, status: 'closed' })).toBe('closed')
    expect(orderPhase({ ...base, fulfillment: 'review' })).toBe('review')
    expect(orderPhase({ ...base, fulfillment: 'refunded' })).toBe('refunded')
    expect(orderPhase({ ...base, status: 'paid', fulfillment: 'granted' })).toBe('granted')
  })

  it('labels payment methods', () => {
    const copy = { order: { stripe: 'Stripe', alipay: 'Alipay', wechat: 'WeChat Pay' } }
    expect(['stripe', 'alipay_page', 'wechat_native'].map((method) => methodLabel(method, copy))).toEqual(['Stripe', 'Alipay', 'WeChat Pay'])
  })

  it('formats money, numbers, dates and messages defensively', () => {
    expect(formatPrice(1900, 'CNY', 'zh-CN')).toBe('¥19')
    expect(formatPrice(1633, 'CNY', 'zh-CN')).toBe('¥16.33')
    expect(formatPrice(100, 'NOT-A-CURRENCY', 'en')).toBe('NOT-A-CURRENCY 1.00')
    expect(formatNumber(1234567, 'en')).toBe('1,234,567')
    expect(formatNumber(1.5, 'bad-locale-!!', 1)).toBe('2')
    expect(formatDate('2027-01-18T00:00:00Z', 'en')).toContain('2027')
    expect(formatDate('nope', 'en')).toBe('')
    expect(formatDate('2027-01-18T00:00:00Z', 'bad-locale-!!')).toBe('2027-01-18')
    expect(formatMessage('{a} and {a}, {b}', { a: 1, b: 'x' })).toBe('1 and 1, x')
    expect(formatMessage(undefined)).toBe('')
  })
})

it('routes managed Stripe changes to application quotes, including interval changes', () => {
  const subscription = { active: true, paid: true, provider: 'stripe', billing_mode: 'recurring', plan_code: 'pro', billing_interval: 'month', stripe_subscription_id: 'sub' }
  expect(membershipBlock({ subscription, plan: pro, method: 'stripe', term: 'month', changesEnabled: true })).toBe('currentPlan')
  expect(membershipBlock({ subscription, plan: pro, method: 'stripe', term: 'year', changesEnabled: true })).toBe('stripeChange')
  expect(membershipBlock({ subscription, plan: { code: 'premium' }, method: 'stripe', term: 'month', changesEnabled: true })).toBe('stripeChange')
})
