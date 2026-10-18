import { dailyDictationMinutes, dictationHours, formatHours, formatNumber, isMonthlyInterval, isUnlimited, isYearlyInterval } from './billingInsights'
import styles from './BillingPlansPage.module.css'

export default function BillingPlanCard({
  plan,
  lang,
  t,
  copy,
  maxCredits,
  selectedInterval,
  billingCurrency,
  billingEnabled,
  checkoutKey,
  pulse,
  onCheckout,
  prepaid,
}) {
  const selectedPrice = plan.prices.find((price) => price.interval === selectedInterval)
  const monthlyPrice = plan.prices.find((price) => isMonthlyInterval(price.interval))
  const yearlySelected = isYearlyInterval(selectedInterval)
  const months = prepaid && selectedInterval === 'quarter' ? 3 : yearlySelected ? 12 : 1
  const priceCents = yearlySelected && !prepaid && selectedPrice
    ? selectedPrice.priceCents / 12
    : selectedPrice?.priceCents ?? plan.priceCents
  const currency = selectedPrice?.currency || plan.currency
  const originalPriceCents = prepaid && monthlyPrice && selectedPrice
    ? monthlyPrice.priceCents * months > selectedPrice.priceCents ? monthlyPrice.priceCents * months : 0
    : yearlySelected && monthlyPrice?.priceCents > priceCents ? monthlyPrice.priceCents : 0
  const isCheckingOut = checkoutKey === `${plan.code}:${selectedInterval}`
  const isFree = plan.code === 'free'
  const displayedPriceCents = isFree ? 0 : priceCents
  const displayedCurrency = isFree ? billingCurrency : currency
  const disabled = !billingEnabled || (!prepaid && plan.currentPlan) || Boolean(checkoutKey) || (prepaid ? !selectedPrice : plan.prices.length > 0 && !selectedPrice) || (prepaid && isFree)
  const text = copy.card

  let priceNote = ''
  if (prepaid && !isFree && !selectedPrice) {
    priceNote = prepaid.unavailableTerm
  } else if (isFree || plan.prices.length === 0) {
    priceNote = text.freeForever
  } else if (prepaid && selectedPrice) {
    priceNote = formatMessage(prepaid.totalNote, { price: formatPrice(selectedPrice.priceCents, selectedPrice.currency, lang), term: prepaid.terms[selectedInterval] })
  } else if (yearlySelected && selectedPrice) {
    priceNote = formatMessage(text.billedYearly, { price: formatPrice(selectedPrice.priceCents, selectedPrice.currency, lang) })
  } else if (selectedPrice) {
    priceNote = text.billedMonthly
  }
  const savePercent = prepaid && monthlyPrice?.priceCents > 0 && selectedPrice && months > 1
    ? Math.max(0, Math.round((1 - selectedPrice.priceCents / (monthlyPrice.priceCents * months)) * 100))
    : yearlySelected ? selectedPrice?.discountPercent || 0 : 0

  return (
    <article
      id={planAnchor(plan.code)}
      className={[
        styles.planCard,
        plan.highlight ? styles.highlighted : '',
        pulse ? styles.pulse : '',
      ].filter(Boolean).join(' ')}
    >
      {plan.highlight && <span className={styles.mostPopular}>{t('billingPlans.mostPopular')}</span>}
      {plan.currentPlan && <span className={styles.currentBadge}>{t('billingPlans.currentPlan')}</span>}
      <div className={styles.planHeader}>
        <h2>{plan.name || plan.code}</h2>
        {plan.tagline && <p>{plan.tagline}</p>}
      </div>
      <div className={styles.price}>
        <div className={styles.priceAmount}>
          {prepaid && !isFree && !selectedPrice ? <span className={styles.unavailablePrice}>{prepaid.unavailableTerm}</span> : <>
            <span>{formatPrice(displayedPriceCents, displayedCurrency, lang)}</span>
            {(isFree || selectedInterval) && <small>/ {prepaid && !isFree ? prepaid.terms[selectedInterval] : t('billingPlans.perMonth')}</small>}
          </>}
        </div>
        <div className={styles.priceComparison}>
          {originalPriceCents > 0 && (
            <del className={styles.originalPrice}>{formatPrice(originalPriceCents, monthlyPrice.currency, lang)}</del>
          )}
          {savePercent > 0 && <span className={styles.save}>{formatMessage(text.save, { percent: savePercent })}</span>}
          {priceNote && <span>{priceNote}</span>}
        </div>
      </div>

      <button
        className={`btn ${styles.checkoutButton} ${plan.highlight ? styles.featuredCheckoutButton : styles.standardCheckoutButton}`}
        type="button"
        disabled={disabled}
        onClick={() => onCheckout(plan.code, selectedInterval)}
      >
        {prepaid && !isFree
          ? formatMessage(plan.currentPlan ? prepaid.renewPlan : prepaid.choosePlan, { plan: plan.name || plan.code })
          : plan.currentPlan
          ? t('billingPlans.currentPlan')
          : isCheckingOut
            ? t('billingPlans.choosingPlan')
            : isFree
              ? formatMessage(t('billingPlans.choosePlan'), { plan: plan.name || plan.code })
              : t(yearlySelected ? 'billingPlans.subscribeYearly' : 'billingPlans.subscribeMonthly')}
      </button>

      <PlanAllowance plan={plan} lang={lang} copy={copy} maxCredits={maxCredits} />

      {plan.features?.length > 0 && (
        <ul className={styles.featureList}>
          {plan.features.map((feature, index) => (
            <li key={`${plan.code}:${index}`}><CheckIcon /><span>{feature}</span></li>
          ))}
        </ul>
      )}
    </article>
  )
}

// Leads with what the allowance buys (dictation hours) for plans that include
// cloud speech recognition; other plans show the raw monthly credits.
function PlanAllowance({ plan, lang, copy, maxCredits }) {
  const text = copy.card
  const unlimited = isUnlimited(plan.monthlyCredits)
  const hasAllowance = unlimited || plan.monthlyCredits > 0
  if (!hasAllowance && !plan.usageSummary) return null

  const showHours = plan.paid && !unlimited && plan.monthlyCredits > 0
  const fill = unlimited ? 100 : maxCredits > 0 ? Math.max(6, plan.monthlyCredits / maxCredits * 100) : 0
  return (
    <div className={styles.allowance}>
      {hasAllowance && (
        <>
          <div className={styles.allowanceValue}>
            {showHours ? (
              <>
                {formatMessage(text.dictation, { hours: formatHours(dictationHours(plan.monthlyCredits), lang) })}
                <small>{text.dictationUnit}</small>
              </>
            ) : plan.monthlyCreditsLabel}
          </div>
          {showHours && (
            <div className={styles.allowanceDetail}>
              {formatMessage(text.daily, {
                minutes: formatNumber(dailyDictationMinutes(plan.monthlyCredits), lang),
                credits: formatNumber(plan.monthlyCredits, lang),
              })}
            </div>
          )}
          <div className={styles.allowanceBar} aria-hidden="true"><i style={{ width: `${fill}%` }} /></div>
        </>
      )}
      {plan.usageSummary && <p className={styles.usageSummary}>{plan.usageSummary}</p>}
    </div>
  )
}

function CheckIcon() {
  return (
    <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="m3.75 9 3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function planAnchor(code) {
  return `plan-${code}`
}

function formatPrice(priceCents, currency, lang) {
  try {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency,
      minimumFractionDigits: priceCents % 100 === 0 ? 0 : 2,
    }).format(priceCents / 100)
  } catch {
    return `${currency} ${(priceCents / 100).toFixed(2)}`
  }
}


function formatMessage(template, values) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template,
  )
}
