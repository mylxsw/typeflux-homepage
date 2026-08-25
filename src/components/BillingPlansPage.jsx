import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import {
  clearStoredBillingPageToken,
  clearBillingPageToken,
  createBillingCheckoutSession,
  fetchBillingPlans,
  resolveBillingPageToken,
} from '../lib/billingApi'
import styles from './BillingPlansPage.module.css'

export default function BillingPlansPage({
  loadPlans = fetchBillingPlans,
  createCheckout = createBillingCheckoutSession,
  redirect = (url) => window.location.assign(url),
}) {
  const { lang, t } = useI18n()
  const [tokenState] = useState(() => resolveBillingPageToken(window.location.hash))
  const token = tokenState.token
  const [reloadKey, setReloadKey] = useState(0)
  const [view, setView] = useState(() => token
    ? { status: 'loading', plans: [], billingEnabled: true }
    : { status: 'missing-token', plans: [], billingEnabled: false })
  const [checkoutKey, setCheckoutKey] = useState('')
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    if (tokenState.fromHash && tokenState.persisted) clearBillingPageToken()
  }, [tokenState])

  useEffect(() => {
    if (!token) return undefined

    const controller = new AbortController()
    setView((current) => ({ ...current, status: 'loading' }))
    loadPlans(token, { signal: controller.signal, lang })
      .then((result) => {
        setView({ status: 'ready', ...result })
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.kind === 'expired_token') clearStoredBillingPageToken()
        setView({
          status: error?.kind === 'expired_token' ? 'expired-token' : 'error',
          plans: [],
          billingEnabled: false,
        })
      })

    return () => controller.abort()
  }, [lang, loadPlans, reloadKey, token])

  const localizedPlans = useMemo(
    () => view.plans.map((plan) => localizePlan(plan, lang, t)),
    [lang, t, view.plans],
  )
  const billingIntervals = useMemo(
    () => collectBillingIntervals(localizedPlans),
    [localizedPlans],
  )
  const billingCurrency = useMemo(
    () => preferredBillingCurrency(localizedPlans),
    [localizedPlans],
  )
  const [requestedInterval, setRequestedInterval] = useState('')
  const selectedInterval = billingIntervals.includes(requestedInterval)
    ? requestedInterval
    : preferredBillingInterval(localizedPlans, billingIntervals)

  const handleCheckout = useCallback(async (planCode, billingInterval) => {
    if (!token || checkoutKey) return
    setCheckoutKey(`${planCode}:${billingInterval}`)
    setCheckoutError('')
    try {
      const url = await createCheckout(token, planCode, billingInterval)
      redirect(url)
    } catch (error) {
      if (error?.kind === 'expired_token') {
        clearStoredBillingPageToken()
        setView({ status: 'expired-token', plans: [], billingEnabled: false })
        setCheckoutKey('')
        return
      }
      setCheckoutError(error?.kind === 'conflict' ? 'conflict' : 'failed')
      setCheckoutKey('')
    }
  }, [checkoutKey, createCheckout, redirect, token])

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>{t('billingPlans.eyebrow')}</p>
          <h1>{t('billingPlans.title')}</h1>
        </div>
      </section>

      <section className={styles.content}>
        <div className="container">
          {view.status === 'loading' && <StatusPanel title={t('billingPlans.loadingTitle')} summary={t('billingPlans.loadingSummary')} busy />}
          {view.status === 'missing-token' && <StatusPanel title={t('billingPlans.missingTitle')} summary={t('billingPlans.missingSummary')} />}
          {view.status === 'expired-token' && <StatusPanel title={t('billingPlans.expiredTitle')} summary={t('billingPlans.expiredSummary')} />}
          {view.status === 'error' && (
            <StatusPanel title={t('billingPlans.errorTitle')} summary={t('billingPlans.errorSummary')}>
              <button className="btn btn-primary" type="button" onClick={() => setReloadKey((key) => key + 1)}>
                {t('billingPlans.retry')}
              </button>
            </StatusPanel>
          )}
          {view.status === 'ready' && (
            <>
              {!view.billingEnabled && <div className={styles.notice} role="status">{t('billingPlans.billingUnavailable')}</div>}
              {checkoutError && (
                <div className={styles.errorNotice} role="alert">
                  {t(checkoutError === 'conflict' ? 'billingPlans.checkoutConflict' : 'billingPlans.checkoutFailed')}
                </div>
              )}
              {localizedPlans.length === 0 ? (
                <StatusPanel title={t('billingPlans.emptyTitle')} summary={t('billingPlans.emptySummary')} />
              ) : (
                <div className={styles.planGrid}>
                  {localizedPlans.map((plan) => (
                    <PlanCard
                      key={plan.code}
                      plan={plan}
                      lang={lang}
                      t={t}
                      selectedInterval={selectedInterval}
                      billingCurrency={billingCurrency}
                      billingEnabled={view.billingEnabled}
                      checkoutKey={checkoutKey}
                      onIntervalChange={setRequestedInterval}
                      onCheckout={handleCheckout}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function StatusPanel({ title, summary, busy = false, children }) {
  return (
    <div className={styles.statusPanel} role={busy ? 'status' : 'alert'} aria-live="polite">
      {busy && <span className={styles.spinner} aria-hidden="true" />}
      <h2>{title}</h2>
      <p>{summary}</p>
      {children && <div className={styles.statusActions}>{children}</div>}
    </div>
  )
}

function PlanCard({
  plan,
  lang,
  t,
  selectedInterval,
  billingCurrency,
  billingEnabled,
  checkoutKey,
  onIntervalChange,
  onCheckout,
}) {
  const selectedPrice = plan.prices.find((price) => price.interval === selectedInterval)
  const monthlyPrice = plan.prices.find((price) => isMonthly(price.interval))
  const yearlyPrice = plan.prices.find((price) => isYearly(price.interval))
  const yearlySelected = isYearly(selectedInterval)
  const priceCents = yearlySelected && selectedPrice
    ? selectedPrice.priceCents / 12
    : selectedPrice?.priceCents ?? plan.priceCents
  const currency = selectedPrice?.currency || plan.currency
  const originalPriceCents = yearlySelected
    && monthlyPrice?.priceCents > priceCents
    ? monthlyPrice.priceCents
    : 0
  const isCheckingOut = checkoutKey === `${plan.code}:${selectedInterval}`
  const isFree = plan.code === 'free'
  const displayedPriceCents = isFree ? 0 : priceCents
  const displayedCurrency = isFree ? billingCurrency : currency
  const showIntervalPicker = Boolean(monthlyPrice && yearlyPrice)
  const disabled = !billingEnabled || plan.currentPlan || Boolean(checkoutKey) || (plan.prices.length > 0 && !selectedPrice)

  return (
    <article className={`${styles.planCard} ${plan.highlight ? styles.highlighted : ''}`}>
      {plan.highlight && <span className={styles.mostPopular}>{t('billingPlans.mostPopular')}</span>}
      <div className={styles.planHeader}>
        <h2>{plan.name || plan.code}</h2>
        {plan.tagline && <p>{plan.tagline}</p>}
      </div>
      <div className={styles.price}>
        <div className={styles.priceRow}>
          <div className={styles.priceAmount}>
            <span>{formatPrice(displayedPriceCents, displayedCurrency, lang)}</span>
            {(isFree || selectedInterval) && <small>/ {t('billingPlans.perMonth')}</small>}
          </div>
        </div>
        <div className={styles.priceComparison}>
          {originalPriceCents > 0 && (
            <del className={styles.originalPrice}>{formatPrice(originalPriceCents, monthlyPrice.currency, lang)}</del>
          )}
        </div>
      </div>

      {showIntervalPicker && (
        <div className={styles.intervalPicker} role="group" aria-label={t('billingPlans.billingInterval')}>
          <button
            className={yearlySelected ? styles.selectedInterval : ''}
            type="button"
            aria-pressed={yearlySelected}
            aria-label={yearlyPrice.discountPercent > 0
              ? formatMessage(t('billingPlans.billedYearlyDiscount'), { percent: yearlyPrice.discountPercent })
              : t('billingPlans.billedYearly')}
            disabled={Boolean(checkoutKey)}
            onClick={() => onIntervalChange(yearlyPrice.interval)}
          >
            <span>{t('billingPlans.billedYearly')}</span>
            {yearlyPrice.discountPercent > 0 && (
              <span className={styles.intervalDiscount}>
                {formatMessage(t('billingPlans.savePercent'), { percent: yearlyPrice.discountPercent })}
              </span>
            )}
          </button>
          <button
            className={!yearlySelected ? styles.selectedInterval : ''}
            type="button"
            aria-pressed={!yearlySelected}
            disabled={Boolean(checkoutKey)}
            onClick={() => onIntervalChange(monthlyPrice.interval)}
          >
            {t('billingPlans.billedMonthly')}
          </button>
        </div>
      )}

      <button
        className={`btn ${styles.checkoutButton} ${plan.highlight ? styles.featuredCheckoutButton : styles.standardCheckoutButton}`}
        type="button"
        disabled={disabled}
        onClick={() => onCheckout(plan.code, selectedInterval)}
      >
        {plan.currentPlan
          ? t('billingPlans.currentPlan')
          : isCheckingOut
            ? t('billingPlans.choosingPlan')
            : isFree
              ? formatMessage(t('billingPlans.choosePlan'), { plan: plan.name || plan.code })
              : t(yearlySelected ? 'billingPlans.subscribeYearly' : 'billingPlans.subscribeMonthly')}
      </button>

      {(plan.monthlyCreditsLabel || plan.usageSummary) && (
        <div className={styles.allowance}>
          {plan.monthlyCreditsLabel && (
            <div className={styles.creditAllowance}>
              <span className={styles.creditMark} aria-hidden="true">✦</span>
              <span>{plan.monthlyCreditsLabel}</span>
            </div>
          )}
          {plan.usageSummary && <p className={styles.usageSummary}>{plan.usageSummary}</p>}
        </div>
      )}

      {plan.features.length > 0 && (
        <ul className={styles.featureList}>
          {plan.features.map((feature, index) => (
            <li key={`${plan.code}:${index}`}><CheckIcon /><span>{feature}</span></li>
          ))}
        </ul>
      )}
    </article>
  )
}

function CheckIcon() {
  return (
    <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="m3.75 9 3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
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

function isYearly(interval) {
  const value = interval.toLowerCase()
  return value === 'year' || value === 'yearly'
}

function isMonthly(interval) {
  const value = interval.toLowerCase()
  return value === 'month' || value === 'monthly'
}

function collectBillingIntervals(plans) {
  return plans.reduce((intervals, plan) => {
    plan.prices.forEach((price) => {
      if (price.interval && !intervals.includes(price.interval)) intervals.push(price.interval)
    })
    return intervals
  }, [])
}

function preferredBillingInterval(plans, intervals) {
  const preferred = plans.find((plan) => (
    plan.prices.some((price) => price.interval === plan.interval)
  ))?.interval
  return preferred || intervals[0] || ''
}

function preferredBillingCurrency(plans) {
  return plans.find((plan) => plan.prices[0]?.currency)?.prices[0].currency
    || plans.find((plan) => plan.currency)?.currency
    || 'USD'
}

function localizePlan(plan, lang, t) {
  const monthlyCredits = Number.isFinite(plan.monthlyCredits) ? plan.monthlyCredits : 0
  const localizedMetadata = {
    usageSummary: String(plan.usageSummary || '').trim(),
    features: Array.isArray(plan.features) ? plan.features : [],
  }
  const monthlyCreditsLabel = monthlyCredits === -1
    ? t('billingPlans.unlimitedCreditsPerMonth')
    : monthlyCredits > 0
      ? formatMessage(t('billingPlans.creditsPerMonth'), {
          credits: new Intl.NumberFormat(lang).format(monthlyCredits),
        })
      : ''

  if (lang === 'en' || lang === 'zh-CN' || (plan.code !== 'free' && plan.code !== 'pro')) {
    return { ...plan, ...localizedMetadata, monthlyCreditsLabel }
  }

  const translationRoot = `billingPlans.catalog.plans.${plan.code}`
  const name = translatedValue(t, `${translationRoot}.name`, plan.name)
  const tagline = translatedValue(t, `${translationRoot}.tagline`, plan.tagline)
  const description = translatedValue(t, `${translationRoot}.description`, plan.description)
  return { ...plan, ...localizedMetadata, name, tagline, description, monthlyCreditsLabel }
}

function translatedValue(t, key, fallback) {
  const value = t(key)
  return value === key ? fallback : value
}

function formatMessage(template, values) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, String(value)),
    template,
  )
}
