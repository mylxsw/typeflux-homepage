import { describe, expect, it } from 'vitest'
import { needsConfirmation, signInState, creditSummary, dailySeries, displayName, featureTotals, formatDuration, niceMax, paymentRows, planState, recordFeature } from './accountModel'
import { ACCOUNT_LANGS, accountCopy, accountText } from './accountCopy'

describe('creditSummary', () => {
  it('splits plan and add-on credits for the meter', () => {
    const c = creditSummary({ limit: 5000, used: 3180, remaining: 1820, total_remaining: 3020, addon: { remaining: 1200, next_expiry: { expires_at: '2026-12-01T00:00:00Z' } } })
    expect(c).toMatchObject({ total: 3020, limit: 5000, planLeft: 1820, used: 3180, addon: 1200, addonExpiry: '2026-12-01T00:00:00Z', low: false, unlimited: false })
    expect(c.planShare).toBeCloseTo((1820 / 6200) * 100)
    expect(c.addonShare).toBeCloseTo((1200 / 6200) * 100)
  })
  it('flags low balances and tolerates missing or bad fields', () => {
    expect(creditSummary({ limit: 1000, remaining: 50, used: 950 })).toMatchObject({ total: 50, low: true, addon: 0, addonExpiry: '' })
    expect(creditSummary(null)).toMatchObject({ total: 0, planShare: 0, addonShare: 0, low: false })
    expect(creditSummary({ limit: 'x', remaining: -5, unlimited: true })).toMatchObject({ limit: 0, planLeft: 0, unlimited: true, low: false })
  })
})

describe('planState', () => {
  it('describes free accounts', () => {
    expect(planState(null)).toMatchObject({ paid: false, status: 'free', channel: '', action: '' })
  })
  it.each([
    [{ status: 'active' }, 'active'], [{ status: 'past_due' }, 'pastDue'], [{ status: 'unpaid' }, 'pastDue'],
    [{ status: 'active', cancel_at_period_end: true }, 'canceling'], [{ status: 'active', active: false }, 'inactive'],
  ])('maps Stripe status %j', (patch, status) => {
    expect(planState({ paid: true, billing_mode: 'subscription', management_action: 'portal', ...patch }).status).toBe(status)
  })
  it('identifies the payment channel and the action', () => {
    expect(planState({ paid: true, billing_mode: 'subscription', management_action: 'portal', plan_name: 'Pro', billing_interval: 'month', current_period_end: 'x', auto_renew: true }))
      .toEqual({ paid: true, prepaid: false, status: 'active', name: 'Pro', interval: 'month', periodEnd: 'x', autoRenew: true, channel: 'stripe', action: 'portal' })
    expect(planState({ paid: true, billing_mode: 'prepaid', payment_channel: 'wechat_native', management_action: 'renew', plan_code: 'pro' })).toMatchObject({ prepaid: true, channel: 'wechat', action: 'renew', name: 'pro' })
    expect(planState({ paid: true, billing_mode: 'prepaid', payment_channel: 'alipay_page' }).channel).toBe('alipay')
    expect(planState({ paid: true, payment_provider: 'apple', management_action: 'portal' })).toMatchObject({ channel: 'apple', action: '' })
  })
})

describe('usage series', () => {
  const breakdown = { voice: 10, rewrite: 5, ask: '2', days: [{ date: '2026-10-01', voice: 3, rewrite: 1, ask: 0 }, { date: '2026-10-02', voice: -1, rewrite: 'x' }, { nope: true }] }
  it('builds one row per day with totals', () => {
    expect(dailySeries(breakdown)).toEqual([
      { date: '2026-10-01', voice: 3, rewrite: 1, ask: 0, total: 4 },
      { date: '2026-10-02', voice: 0, rewrite: 0, ask: 0, total: 0 },
    ])
    expect(dailySeries(null)).toEqual([])
    expect(featureTotals(breakdown)).toEqual({ voice: 10, rewrite: 5, ask: 2, total: 17 })
    expect(featureTotals(undefined)).toEqual({ voice: 0, rewrite: 0, ask: 0, total: 0 })
  })
  it.each([[0, 4], [-1, 4], [3, 4], [17, 20], [233, 400], [999, 1000], [1234, 2000]])('rounds %s up to a gridline-friendly %s', (value, expected) => {
    expect(niceMax(value)).toBe(expected)
  })
  it('attributes records like the server breakdown', () => {
    expect(recordFeature({ type: 'asr', scenario: 'dictation' })).toBe('voice')
    expect(recordFeature({ type: 'chat', scenario: 'ask' })).toBe('ask')
    expect(recordFeature({ type: 'chat', scenario: 'ask_title' })).toBe('ask')
    expect(recordFeature({ type: 'chat', scenario: 'rewrite' })).toBe('rewrite')
    expect(recordFeature({ type: 'chat' })).toBe('rewrite')
    expect(recordFeature(null)).toBe('rewrite')
  })
  it('formats durations', () => {
    expect(formatDuration(75_400)).toBe('1:15')
    expect(formatDuration(-1)).toBe('0:00')
    expect(formatDuration('x')).toBe('0:00')
  })
})

describe('paymentRows', () => {
  it('merges orders and grants newest first, preferring the order for shared IDs', () => {
    const rows = paymentRows({
      orders: [
        { id: 'o1', kind: 'credit_pack', credits: 500, channel: 'wechat_native', status: 'paid', fulfillment: 'granted', amount_fen: 1200, currency: 'CNY', paid_at: '2026-10-15T00:00:00Z' },
        { id: 'o2', kind: 'membership', plan_code: 'pro', months: 3, channel: 'alipay_page', status: 'pending', fulfillment: 'pending', amount_fen: 19900, created_at: '2026-10-16T00:00:00Z' },
        { id: 'o3', status: 'paid', fulfillment: 'refunded', created_at: '2026-01-01T00:00:00Z' },
        { id: 'o4', status: 'paid', fulfillment: 'review' },
        {},
      ],
      grants: [
        { id: 'o1', source: 'alipay', credits: 500 },
        { id: 'g1', source: 'stripe', credits: 1500, amountCents: 499, currency: 'usd', status: 'active', grantedAt: '2026-09-21T00:00:00Z' },
        { id: 'g2', source: 'apple', status: 'revoked', grantedAt: '2026-08-01T00:00:00Z' },
        { id: 'g3', source: 'admin', status: 'frozen', grantedAt: '2026-07-01T00:00:00Z' },
        { id: 'g4', source: 'wechat' },
        { source: 'stripe' },
      ],
    })
    expect(rows.map((r) => r.id)).toEqual(['o2', 'o1', 'g1', 'g2', 'g3', 'o3', 'o4', 'g4'])
    expect(rows[0]).toEqual({ id: 'o2', date: '2026-10-16T00:00:00Z', kind: 'membership', credits: 0, plan: 'pro', months: 3, method: 'alipay', status: 'pending', amountCents: 19900, currency: 'CNY' })
    expect(rows[1]).toMatchObject({ kind: 'pack', method: 'wechat', status: 'paid', amountCents: 1200 })
    expect(rows[2]).toMatchObject({ method: 'stripe', status: 'paid', amountCents: 499, currency: 'USD' })
    expect(rows.find((r) => r.id === 'g2')).toMatchObject({ method: 'apple', status: 'refunded' })
    expect(rows.find((r) => r.id === 'g3')).toMatchObject({ method: 'manual', status: 'review' })
    expect(rows.find((r) => r.id === 'g4')).toMatchObject({ method: 'alipay', currency: 'USD' })
    expect(rows.find((r) => r.id === 'o3').status).toBe('refunded')
    expect(rows.find((r) => r.id === 'o4').status).toBe('review')
    expect(paymentRows()).toEqual([])
  })
})

describe('copy', () => {
  it('names people by profile name or email', () => {
    expect(displayName({ name: 'Ann', email: 'a@b.c' })).toBe('Ann')
    expect(displayName({ email: 'lin.zhou@example.com' })).toBe('lin.zhou')
    expect(displayName(null)).toBe('')
  })
  it('has the same keys in every language and resolves placeholders', () => {
    const shape = (node, prefix = '') => Object.entries(node).flatMap(([k, v]) => (typeof v === 'object' ? shape(v, `${prefix}${k}.`) : [`${prefix}${k}`])).sort()
    const english = shape(accountCopy('en'))
    for (const lang of ACCOUNT_LANGS) expect(shape(accountCopy(lang))).toEqual(english)
    expect(accountCopy('fr')).toBe(accountCopy('en'))
    expect(accountText('zh-CN', 'overview.greeting', { name: 'Lin' })).toBe('你好，Lin')
    expect(accountText('en', 'missing.key')).toBe('missing.key')
  })
})

describe('sign-in state', () => {
  const session = (patch = {}) => ({ user: { providers: ['password', 'google', 'apple'], hasPassword: true }, linkableProviders: ['google', 'github'], reauthUntil: 0, reauthProvider: '', ...patch })
  it('lists configured or linked providers and counts ways to sign in', () => {
    expect(signInState(session())).toEqual({ providers: ['google', 'github', 'apple'], linked: ['google', 'apple'], linkable: ['google', 'github'], hasPassword: true, methods: 3 })
    expect(signInState({ user: { providers: ['github'] } })).toMatchObject({ providers: ['github'], methods: 1, hasPassword: false, linkable: [] })
  })
  it('asks for confirmation unless a fitting window is open', () => {
    const now = 1_000_000
    expect(needsConfirmation({ type: 'link' }, session(), now)).toBe(true)
    const open = session({ reauthUntil: now / 1000 + 60, reauthProvider: 'password' })
    expect(needsConfirmation({ type: 'link' }, open, now)).toBe(false)
    expect(needsConfirmation({ type: 'delete' }, open, now)).toBe(true)
    expect(needsConfirmation({ type: 'delete' }, { ...open, reauthProvider: 'apple' }, now)).toBe(false)
    expect(needsConfirmation({ type: 'delete' }, { ...open, user: { providers: ['password'] } }, now)).toBe(false)
    expect(needsConfirmation({ type: 'link' }, session({ reauthUntil: now / 1000 - 1 }), now)).toBe(true)
  })
})
