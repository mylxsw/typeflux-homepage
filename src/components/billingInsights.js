// Pure helpers that turn billing data into the plain-language figures shown on
// /billing/plans (dictation hours, usage estimates, plan recommendations).

// Cloud speech recognition is billed per started audio second
// (typeflux-api DefaultASRAudioSecondCreditCost).
export const CREDITS_PER_AUDIO_SECOND = 1
export const DAYS_PER_MONTH = 30
export const AI_USAGE_LEVELS = [
  { key: 'none', overhead: 0 },
  { key: 'some', overhead: 0.25 },
  { key: 'heavy', overhead: 0.6 },
]

export function isUnlimited(credits) {
  return credits === -1
}

// Dictation hours a credit amount covers when spent only on cloud audio.
export function dictationHours(credits) {
  if (!Number.isFinite(credits) || credits <= 0) return 0
  return credits / CREDITS_PER_AUDIO_SECOND / 3600
}

export function dailyDictationMinutes(monthlyCredits) {
  return dictationHours(monthlyCredits) * 60 / DAYS_PER_MONTH
}

export function formatHours(hours, lang) {
  return formatNumber(hours, lang, hours >= 10 ? 0 : 1)
}

export function estimateMonthlyCredits(dailyMinutes, aiOverhead) {
  const minutes = Math.max(0, Number(dailyMinutes) || 0)
  const overhead = Math.max(0, Number(aiOverhead) || 0)
  return Math.round(minutes * 60 * CREDITS_PER_AUDIO_SECOND * DAYS_PER_MONTH * (1 + overhead))
}

// Picks the smallest paid plan whose monthly allowance covers the estimate.
// When none does, the largest plan is returned with the monthly shortfall.
export function recommendPlan(plans, neededCredits) {
  const candidates = plans
    .filter((plan) => plan.paid && (plan.monthlyCredits > 0 || isUnlimited(plan.monthlyCredits)))
    .sort((a, b) => allowance(a) - allowance(b))
  if (candidates.length === 0) return null

  const fit = candidates.find((plan) => allowance(plan) >= neededCredits)
  if (fit) {
    const usedPercent = isUnlimited(fit.monthlyCredits)
      ? 0
      : Math.min(100, Math.round(neededCredits / fit.monthlyCredits * 100))
    return { plan: fit, fits: true, usedPercent, shortfall: 0 }
  }
  const largest = candidates[candidates.length - 1]
  return { plan: largest, fits: false, usedPercent: 100, shortfall: neededCredits - largest.monthlyCredits }
}

export function usagePercent(neededCredits, monthlyCredits) {
  if (isUnlimited(monthlyCredits)) return 0
  if (!(monthlyCredits > 0)) return Infinity
  return Math.round(neededCredits / monthlyCredits * 100)
}

// Summarizes the credit balance returned by the credit-packs endpoint for the
// compact status chip above the plan cards.
export function creditStatus(credits) {
  if (!credits) return null
  if (credits.unlimited || credits.limit < 0) {
    return { unlimited: true, remaining: 0, usedRatio: 0, addon: Math.max(0, credits.addon?.remaining || 0) }
  }
  const limit = Math.max(0, credits.limit)
  const remaining = Math.max(0, credits.remaining)
  const usedRatio = limit > 0 ? Math.min(1, Math.max(0, (limit - remaining) / limit)) : 0
  return {
    unlimited: false,
    remaining,
    usedRatio,
    addon: Math.max(0, credits.addon?.remaining || 0),
  }
}

export function maxYearlyDiscount(plans) {
  return plans.reduce((best, plan) => Math.max(
    best,
    ...plan.prices.map((price) => (isYearlyInterval(price.interval) ? price.discountPercent || 0 : 0)),
  ), 0)
}

export function isYearlyInterval(interval = '') {
  const value = interval.toLowerCase()
  return value === 'year' || value === 'yearly'
}

export function isMonthlyInterval(interval = '') {
  const value = interval.toLowerCase()
  return value === 'month' || value === 'monthly'
}

export function formatNumber(value, lang, maximumFractionDigits = 0) {
  try {
    return new Intl.NumberFormat(lang, { maximumFractionDigits }).format(value)
  } catch {
    return String(Math.round(value))
  }
}

function allowance(plan) {
  return isUnlimited(plan.monthlyCredits) ? Infinity : plan.monthlyCredits
}
