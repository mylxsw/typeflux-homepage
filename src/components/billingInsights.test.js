import { describe, expect, it } from 'vitest'
import {
  creditStatus,
  dailyDictationMinutes,
  dictationHours,
  estimateMonthlyCredits,
  formatHours,
  formatNumber,
  isMonthlyInterval,
  isYearlyInterval,
  maxYearlyDiscount,
  recommendPlan,
  usagePercent,
} from './billingInsights'

const plans = [
  { code: 'free', paid: false, monthlyCredits: 60000, prices: [] },
  { code: 'premium', paid: true, monthlyCredits: 1000000, prices: [{ interval: 'year', discountPercent: 40 }] },
  { code: 'pro', paid: true, monthlyCredits: 300000, prices: [{ interval: 'month' }, { interval: 'YEAR', discountPercent: 50 }] },
]

describe('billing insights', () => {
  it('converts credits into dictation time', () => {
    expect(dictationHours(300000)).toBeCloseTo(83.33, 2)
    expect(dictationHours(0)).toBe(0)
    expect(dictationHours(-1)).toBe(0)
    expect(dictationHours(Number.NaN)).toBe(0)
    expect(dailyDictationMinutes(300000)).toBeCloseTo(166.67, 2)
    expect(formatHours(83.33, 'en')).toBe('83')
    expect(formatHours(2.71, 'en')).toBe('2.7')
  })

  it('estimates monthly credits from daily minutes and AI usage', () => {
    expect(estimateMonthlyCredits(30, 0.25)).toBe(67500)
    expect(estimateMonthlyCredits(30, 0)).toBe(54000)
    expect(estimateMonthlyCredits(-5, -1)).toBe(0)
    expect(estimateMonthlyCredits('x', undefined)).toBe(0)
  })

  it('recommends the smallest paid plan that fits, or the largest with a shortfall', () => {
    expect(recommendPlan(plans, 10000)).toMatchObject({ plan: { code: 'pro' }, fits: true, usedPercent: 3 })
    expect(recommendPlan(plans, 300000)).toMatchObject({ plan: { code: 'pro' }, fits: true, usedPercent: 100 })
    expect(recommendPlan(plans, 300001)).toMatchObject({ plan: { code: 'premium' }, fits: true })
    expect(recommendPlan(plans, 1200000)).toMatchObject({ plan: { code: 'premium' }, fits: false, shortfall: 200000 })
    expect(recommendPlan([plans[0]], 1)).toBeNull()
    expect(recommendPlan([{ code: 'max', paid: true, monthlyCredits: -1 }], 9e9)).toMatchObject({ fits: true, usedPercent: 0 })
  })

  it('computes usage percentages for limited, unlimited, and empty allowances', () => {
    expect(usagePercent(150000, 300000)).toBe(50)
    expect(usagePercent(1, -1)).toBe(0)
    expect(usagePercent(1, 0)).toBe(Infinity)
  })

  it('summarizes the credit balance for the status chip', () => {
    expect(creditStatus(null)).toBeNull()
    expect(creditStatus({ limit: 1000, remaining: 250, addon: { remaining: 40 } }))
      .toEqual({ unlimited: false, remaining: 250, usedRatio: 0.75, addon: 40 })
    expect(creditStatus({ limit: 0, remaining: -5, addon: null }))
      .toEqual({ unlimited: false, remaining: 0, usedRatio: 0, addon: 0 })
    expect(creditStatus({ limit: 100, remaining: 500, addon: { remaining: 0 } }).usedRatio).toBe(0)
    expect(creditStatus({ limit: -1, unlimited: false, remaining: 0, addon: { remaining: 7 } }))
      .toEqual({ unlimited: true, remaining: 0, usedRatio: 0, addon: 7 })
  })

  it('finds the largest yearly discount and classifies intervals', () => {
    expect(maxYearlyDiscount(plans)).toBe(50)
    expect(maxYearlyDiscount([])).toBe(0)
    expect(isYearlyInterval('yearly')).toBe(true)
    expect(isYearlyInterval()).toBe(false)
    expect(isMonthlyInterval('Monthly')).toBe(true)
    expect(isMonthlyInterval('year')).toBe(false)
  })

  it('formats numbers with a safe fallback for unsupported locales', () => {
    expect(formatNumber(1234.56, 'en', 1)).toBe('1,234.6')
    expect(formatNumber(12.4, 'not a locale!!')).toBe('12')
  })
})
