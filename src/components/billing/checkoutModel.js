// Pure purchase rules for /billing/plans. Every price the page shows comes
// from the offer of the selected payment method, so a card never shows one
// currency while the order charges another.

export const PREPAID_METHODS = ['alipay_page', 'wechat_native']
export const METHOD_ORDER = ['stripe', ...PREPAID_METHODS]
export const TERM_ORDER = ['month', 'quarter', 'year']
export const TERM_MONTHS = { month: 1, quarter: 3, year: 12 }
export const RETURN_TO_APP_URL = 'typeflux://billing/return'

export function normalizeTerm(interval = '') {
  const value = String(interval).toLowerCase()
  if (value === 'month' || value === 'monthly') return 'month'
  if (value === 'quarter' || value === 'quarterly') return 'quarter'
  if (value === 'year' || value === 'yearly' || value === 'annual') return 'year'
  return ''
}

export function isPrepaidMethod(method) {
  return PREPAID_METHODS.includes(method)
}

function acceptsChannel(price, method) {
  return !price.channels?.length || price.channels.includes(method)
}

// The membership price a payment method offers for one term, or null.
export function planPrice(plan, method, term) {
  return (plan?.prices || []).find((price) => {
    if (normalizeTerm(price.interval) !== term) return false
    if (method === 'stripe') return price.provider !== 'aidea'
    return price.provider === 'aidea' && isPrepaidMethod(method) && acceptsChannel(price, method)
  }) || null
}

export function purchasablePlans(plans = []) {
  return plans.filter((plan) => plan.paid && (plan.prices || []).length > 0)
}

export function membershipMethods(plans = []) {
  return METHOD_ORDER.filter((method) => plans.some((plan) => TERM_ORDER.some((term) => planPrice(plan, method, term))))
}

export function membershipTerms(plans = [], method = '') {
  return TERM_ORDER.filter((term) => plans.some((plan) => planPrice(plan, method, term)))
}

// Percent saved against paying the same method's monthly price every month.
export function planSavings(plan, method, term) {
  const price = planPrice(plan, method, term)
  if (!price || term === 'month') return 0
  const monthly = planPrice(plan, method, 'month')
  if (monthly?.priceCents > 0 && monthly.currency === price.currency) {
    const full = monthly.priceCents * TERM_MONTHS[term]
    return Math.max(0, Math.round((1 - price.priceCents / full) * 100))
  }
  return price.discountPercent || 0
}

export function termSavings(plans = [], method = '', term = '') {
  return plans.reduce((best, plan) => Math.max(best, planSavings(plan, method, term)), 0)
}

// The add-on price a payment method offers for a pack, or null. Packs from
// older APIs carry only the legacy Stripe price fields.
export function packPrice(pack, method) {
  if (Array.isArray(pack?.prices)) {
    const provider = method === 'stripe' ? 'stripe' : 'aidea'
    const price = pack.prices.find((offer) => (
      offer.provider === provider && (provider === 'stripe' || (isPrepaidMethod(method) && acceptsChannel(offer, method)))
    ))
    return price ? { priceCents: price.priceCents, currency: price.currency } : null
  }
  if (method === 'stripe' && pack?.available && pack.priceCents > 0) {
    return { priceCents: pack.priceCents, currency: pack.currency }
  }
  return null
}

export function packMethods(packs = []) {
  return METHOD_ORDER.filter((method) => packs.some((pack) => packPrice(pack, method)))
}

// Extra credits per unit of money relative to the first priced pack, plus the
// pack with the lowest price per credit, both for one payment method.
export function packValue(packs = [], method = '') {
  const priced = packs
    .map((pack) => ({ pack, price: packPrice(pack, method) }))
    .filter(({ pack, price }) => price && price.priceCents > 0 && pack.credits > 0)
  const base = priced[0]
  const bonus = {}
  let best = base
  priced.forEach((entry) => {
    if (!base || entry.price.currency !== base.price.currency) return
    const ratio = (entry.pack.credits / entry.price.priceCents) / (base.pack.credits / base.price.priceCents)
    bonus[entry.pack.code] = entry === base ? 0 : Math.max(0, Math.round((ratio - 1) * 100))
    if (entry.price.priceCents / entry.pack.credits < best.price.priceCents / best.pack.credits) best = entry
  })
  return { bonus, bestValue: best && best !== base ? best.pack.code : '' }
}

export function subscriptionState(subscription) {
  const active = Boolean(subscription?.paid && subscription?.active)
  return {
    stripe: active && subscription.billing_mode !== 'prepaid',
    prepaid: active && subscription.billing_mode === 'prepaid',
    planCode: active ? String(subscription.plan_code || '') : '',
    periodEnd: active ? String(subscription.current_period_end || '') : '',
  }
}

// Why a membership purchase is not allowed, or '' when it is. Mirrors the
// server rules so the page explains a refusal before the user tries to pay.
export function membershipBlock({ subscription, plan, method, term, changesEnabled = false }) {
  const state = subscriptionState(subscription)
  if (method === 'stripe') {
    if (state.prepaid) return 'stripeAfterPrepaid'
    if (state.stripe && changesEnabled) {
      const currentInterval = normalizeTerm(subscription?.billing_interval)
      if (state.planCode === plan?.code && currentInterval === term) return 'currentPlan'
      return 'stripeChange'
    }
    if (state.stripe && (state.planCode === plan?.code || plan?.currentPlan)) return 'currentPlan'
    if (state.stripe) return 'stripeManage'
    return ''
  }
  if (state.stripe) return 'stripeActive'
  if (state.prepaid && state.planCode && state.planCode !== plan?.code) return 'prepaidOtherPlan'
  return ''
}

export function methodLabel(method, copy) {
  if (method === 'alipay_page') return copy.order.alipay
  if (method === 'wechat_native') return copy.order.wechat
  return copy.order.stripe
}

// Which step of an Alipay/WeChat order the payment dialog shows.
export function orderPhase(order) {
  if (!order) return 'none'
  if (order.fulfillment === 'granted') return 'granted'
  if (order.fulfillment === 'refunded') return 'refunded'
  if (order.fulfillment === 'review') return 'review'
  if (order.status === 'closed') return 'closed'
  if (order.status === 'paid') return 'fulfilling'
  if (!order.pay_url) return 'preparing'
  return order.action === 'qr_code' ? 'qr' : 'redirect'
}

export function defaultMethod(methods = [], { lang = '', subscription } = {}) {
  const state = subscriptionState(subscription)
  const chinese = String(lang).toLowerCase().startsWith('zh')
  const preference = state.stripe
    ? ['stripe']
    : state.prepaid || chinese
      ? ['wechat_native', 'alipay_page', 'stripe']
      : ['stripe', 'alipay_page', 'wechat_native']
  return preference.find((method) => methods.includes(method)) || methods[0] || ''
}
