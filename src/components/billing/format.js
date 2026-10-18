// Locale-aware formatting shared by the billing page components.

export function formatPrice(cents, currency, lang) {
  const amount = Number(cents) || 0
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency,
      minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount / 100)
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`
  }
}

export function formatNumber(value, lang, maximumFractionDigits = 0) {
  try {
    return new Intl.NumberFormat(lang, { maximumFractionDigits }).format(value)
  } catch {
    return String(Math.round(value))
  }
}

export function formatDate(value, lang) {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return ''
  try {
    return new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' }).format(time)
  } catch {
    return new Date(time).toISOString().slice(0, 10)
  }
}

export function formatMessage(template, values = {}) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    String(template ?? ''),
  )
}
