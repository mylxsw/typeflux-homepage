// Pure view-model helpers for the account area. Kept free of React so each
// branch is unit tested directly.

export const FEATURES = ['voice', 'rewrite', 'ask']

const toNumber = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0)

// creditSummary normalizes the API credit summary (plan + add-on credits).
export function creditSummary(credits) {
  const c = credits || {}
  const limit = Math.max(0, toNumber(c.limit))
  const planLeft = Math.max(0, toNumber(c.remaining))
  const addon = Math.max(0, toNumber(c.addon?.remaining))
  const total = c.total_remaining == null ? planLeft + addon : Math.max(0, toNumber(c.total_remaining))
  const capacity = limit + addon
  return {
    unlimited: Boolean(c.unlimited),
    total,
    limit,
    planLeft,
    used: Math.max(0, toNumber(c.used)),
    addon,
    addonExpiry: c.addon?.next_expiry?.expires_at || '',
    // Shares of the meter: plan credits left, add-on credits left, the rest is used.
    planShare: capacity > 0 ? (planLeft / capacity) * 100 : 0,
    addonShare: capacity > 0 ? (addon / capacity) * 100 : 0,
    low: !c.unlimited && capacity > 0 && total / capacity < 0.1,
  }
}

// planState describes the subscription for display and actions.
export function planState(sub) {
  const s = sub || {}
  const paid = Boolean(s.paid)
  const prepaid = s.billing_mode === 'prepaid'
  let status = 'free'
  if (paid) {
    if (['past_due', 'unpaid', 'incomplete'].includes(s.status)) status = 'pastDue'
    else if (s.cancel_at_period_end) status = 'canceling'
    else if (s.active === false) status = 'inactive'
    else status = 'active'
  }
  let channel = ''
  if (paid) {
    if (prepaid) channel = s.payment_channel === 'wechat_native' ? 'wechat' : 'alipay'
    else if (s.payment_provider === 'apple' || s.period_source === 'apple') channel = 'apple'
    else channel = 'stripe'
  }
  return {
    paid,
    prepaid,
    status,
    name: s.plan_name || s.plan_code || '',
    interval: s.billing_interval || '',
    periodEnd: s.current_period_end || '',
    autoRenew: Boolean(s.auto_renew),
    channel,
    // portal: Stripe customer portal; renew: prepaid renewal on /billing/plans.
    action: channel === 'apple' ? '' : s.management_action || '',
  }
}

// dailySeries fills the breakdown into one row per day with a total.
export function dailySeries(breakdown) {
  const days = Array.isArray(breakdown?.days) ? breakdown.days : []
  return days
    .filter((d) => typeof d?.date === 'string')
    .map((d) => {
      const row = { date: d.date }
      for (const f of FEATURES) row[f] = Math.max(0, toNumber(d[f]))
      row.total = FEATURES.reduce((sum, f) => sum + row[f], 0)
      return row
    })
}

export function featureTotals(breakdown) {
  const totals = {}
  for (const f of FEATURES) totals[f] = Math.max(0, toNumber(breakdown?.[f]))
  totals.total = FEATURES.reduce((sum, f) => sum + totals[f], 0)
  return totals
}

// niceMax rounds a chart maximum up so four gridlines land on round numbers.
export function niceMax(value) {
  if (!(value > 0)) return 4
  const rough = value / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rough)
  return step * 4
}

export function formatDuration(ms) {
  const seconds = Math.max(0, Math.round(toNumber(ms) / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}

// paymentRows merges credit-pack grants and prepaid orders into one history,
// newest first. Grants are billingApi-normalized; orders are raw API items. A
// prepaid credit-pack order and its grant share an ID; the order (which knows
// its payment channel and status) wins.
export function paymentRows({ grants = [], orders = [] } = {}) {
  const rows = []
  const seen = new Set()
  for (const o of orders) {
    if (!o?.id) continue
    seen.add(o.id)
    rows.push({
      id: o.id,
      date: o.paid_at || o.created_at || '',
      kind: o.kind === 'credit_pack' ? 'pack' : 'membership',
      credits: toNumber(o.credits),
      plan: o.plan_code || '',
      months: toNumber(o.months),
      method: o.channel === 'wechat_native' ? 'wechat' : 'alipay',
      status: o.fulfillment === 'refunded' ? 'refunded' : o.fulfillment === 'review' ? 'review' : o.status || '',
      amountCents: toNumber(o.amount_fen),
      currency: o.currency || 'CNY',
    })
  }
  for (const g of grants) {
    if (!g?.id || seen.has(g.id)) continue
    rows.push({
      id: g.id,
      date: g.grantedAt || '',
      kind: 'pack',
      credits: toNumber(g.credits),
      plan: '',
      months: 0,
      method: g.source === 'apple' ? 'apple' : g.source === 'stripe' ? 'stripe' : g.source === 'admin' ? 'manual' : 'alipay',
      status: g.status === 'revoked' ? 'refunded' : g.status === 'frozen' ? 'review' : 'paid',
      amountCents: toNumber(g.amountCents),
      currency: (g.currency || 'usd').toUpperCase(),
    })
  }
  return rows.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0))
}

// recordFeature attributes a usage record the same way the server's credit
// breakdown does: speech is voice input, "ask*" scenarios are Ask, the rest rewrite.
export function recordFeature(record) {
  if (record?.type === 'asr') return 'voice'
  return String(record?.scenario || '').startsWith('ask') ? 'ask' : 'rewrite'
}

// displayName prefers the profile name, then the email's local part.
export function displayName(user) {
  if (user?.name) return user.name
  return String(user?.email || '').split('@')[0]
}
