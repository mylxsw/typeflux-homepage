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

  const comparisonFeatures = useMemo(() => {
    const features = localizedPlans.flatMap((plan) => plan.features)
    return [...new Set(features)]
  }, [localizedPlans])

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
          <p className={styles.summary}>{t('billingPlans.summary')}</p>
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
                <>
                  <div className={styles.planGrid}>
                    {localizedPlans.map((plan) => (
                      <PlanCard
                        key={plan.code}
                        plan={plan}
                        lang={lang}
                        t={t}
                        billingEnabled={view.billingEnabled}
                        checkoutKey={checkoutKey}
                        onCheckout={handleCheckout}
                      />
                    ))}
                  </div>
                  <ComparisonTable plans={localizedPlans} features={comparisonFeatures} t={t} />
                </>
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

function PlanCard({ plan, lang, t, billingEnabled, checkoutKey, onCheckout }) {
  const [selectedInterval, setSelectedInterval] = useState(plan.interval || plan.prices[0]?.interval || '')
  const selectedPrice = plan.prices.find((price) => price.interval === selectedInterval)
  const priceCents = selectedPrice?.priceCents ?? plan.priceCents
  const currency = selectedPrice?.currency || plan.currency
  const discountPercent = isYearly(selectedInterval) ? selectedPrice?.discountPercent : 0
  const isCheckingOut = checkoutKey === `${plan.code}:${selectedInterval}`
  const disabled = !billingEnabled || plan.currentPlan || Boolean(checkoutKey) || (plan.prices.length > 0 && !selectedPrice)

  return (
    <article className={`${styles.planCard} ${plan.highlight ? styles.highlighted : ''}`}>
      {plan.highlight && <span className={styles.recommended}>{t('billingPlans.recommended')}</span>}
      <div className={styles.planHeader}>
        <h2>{plan.name || plan.code}</h2>
        {(plan.tagline || plan.description) && <p>{plan.tagline || plan.description}</p>}
        {plan.tagline && plan.description && plan.tagline !== plan.description && (
          <p className={styles.planDescription} title={plan.description}>{plan.description}</p>
        )}
      </div>
      <div className={styles.price}>
        <div>
          <span>{formatPrice(priceCents, currency, lang)}</span>
          {selectedInterval && <small>/ {intervalLabel(selectedInterval, t)}</small>}
        </div>
        {discountPercent > 0 && (
          <strong className={styles.discountBadge}>
            {formatMessage(t('billingPlans.savePercent'), { percent: discountPercent })}
          </strong>
        )}
      </div>
      {plan.prices.length > 1 && (
        <div className={styles.intervalPicker} role="group" aria-label={t('billingPlans.billingInterval')}>
          {plan.prices.map((price) => (
            <button
              key={price.interval}
              className={price.interval === selectedInterval ? styles.selectedInterval : ''}
              type="button"
              aria-pressed={price.interval === selectedInterval}
              disabled={Boolean(checkoutKey)}
              onClick={() => setSelectedInterval(price.interval)}
            >
              {intervalLabel(price.interval, t)}
            </button>
          ))}
        </div>
      )}
      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature}><CheckIcon /> <span>{feature}</span></li>
        ))}
      </ul>
      <button
        className={`btn ${styles.checkoutButton} ${plan.highlight ? 'btn-primary' : styles.secondaryButton}`}
        type="button"
        disabled={disabled}
        onClick={() => onCheckout(plan.code, selectedInterval)}
      >
        {plan.currentPlan
          ? t('billingPlans.currentPlan')
          : isCheckingOut
            ? t('billingPlans.choosingPlan')
            : t('billingPlans.choosePlan')}
      </button>
    </article>
  )
}

function ComparisonTable({ plans, features, t }) {
  return (
    <section className={styles.comparison} aria-labelledby="plan-comparison-title">
      <div className={styles.comparisonHeading}>
        <p className={styles.eyebrow}>{t('billingPlans.comparisonEyebrow')}</p>
        <h2 id="plan-comparison-title">{t('billingPlans.comparisonTitle')}</h2>
        <p>{t('billingPlans.comparisonSummary')}</p>
      </div>
      <div className={styles.tableScroller}>
        <table>
          <thead>
            <tr>
              <th scope="col">{t('billingPlans.featureHeader')}</th>
              {plans.map((plan) => <th scope="col" key={plan.code}>{plan.name || plan.code}</th>)}
            </tr>
          </thead>
          <tbody>
            {features.length > 0 ? features.map((feature) => (
              <tr key={feature}>
                <th scope="row">{feature}</th>
                {plans.map((plan) => (
                  <td key={plan.code} aria-label={plan.features.includes(feature) ? t('billingPlans.included') : t('billingPlans.notIncluded')}>
                    {plan.features.includes(feature) ? <CheckIcon /> : <span aria-hidden="true">—</span>}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <th scope="row">{t('billingPlans.featureDetails')}</th>
                {plans.map((plan) => <td key={plan.code}>—</td>)}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
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

function intervalLabel(interval, t) {
  const key = interval.toLowerCase()
  if (key === 'month' || key === 'monthly') return t('billingPlans.perMonth')
  if (key === 'year' || key === 'yearly') return t('billingPlans.perYear')
  return interval
}

function isYearly(interval) {
  const value = interval.toLowerCase()
  return value === 'year' || value === 'yearly'
}

function localizePlan(plan, lang, t) {
  if (lang === 'en' || lang === 'zh-CN' || (plan.code !== 'free' && plan.code !== 'pro')) {
    return plan
  }

  const translationRoot = `billingPlans.catalog.plans.${plan.code}`
  const name = translatedValue(t, `${translationRoot}.name`, plan.name)
  const tagline = translatedValue(t, `${translationRoot}.tagline`, plan.tagline)
  const description = translatedValue(t, `${translationRoot}.description`, plan.description)
  const monthlyCredits = Number.isFinite(plan.monthlyCredits) ? plan.monthlyCredits : 0
  const features = monthlyCredits > 0
    ? [formatMessage(t('billingPlans.catalog.features.monthlyCredits'), {
        credits: new Intl.NumberFormat(lang).format(monthlyCredits),
      })]
    : plan.features

  return { ...plan, name, tagline, description, features }
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
