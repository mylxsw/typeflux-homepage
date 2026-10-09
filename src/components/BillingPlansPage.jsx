import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import {
  clearStoredBillingPageToken,
  clearBillingPageToken,
  createBillingCheckoutSession,
  fetchBillingPlans,
  fetchCreditPacks,
  resolveBillingPageToken,
} from '../lib/billingApi'
import CreditPacksPanel from './CreditPacksPanel'
import { creditPacksCopy } from './creditPacksCopy'
import { billingPlansCopy } from './billingPlansCopy'
import {
  AI_USAGE_LEVELS,
  creditStatus,
  dailyDictationMinutes,
  dictationHours,
  estimateMonthlyCredits,
  formatHours,
  formatNumber,
  isMonthlyInterval,
  isUnlimited,
  isYearlyInterval,
  maxYearlyDiscount,
  recommendPlan,
  usagePercent,
} from './billingInsights'
import styles from './BillingPlansPage.module.css'

const TAB_PLANS = 'plans'
const TAB_CREDITS = 'credits'
const DEFAULT_DAILY_MINUTES = 30
const DEFAULT_AI_USAGE = 'some'
const LOW_CREDIT_RATIO = 0.8
// Backoff for BILLING_CHECKOUT_PENDING: the server is still resolving an
// earlier checkout for this account, so the same selection is retried.
const CHECKOUT_PENDING_RETRY_DELAYS_MS = [2000, 5000, 10000]
const CHECKOUT_ERROR_KEYS = {
  conflict: 'conflict',
  checkout_pending: 'pending',
  reconciliation_required: 'reconciliation',
}
const CHECKOUT_ERROR_MESSAGES = {
  conflict: 'billingPlans.checkoutConflict',
  pending: 'billingPlans.checkoutPending',
  reconciliation: 'billingPlans.checkoutReconciliation',
  failed: 'billingPlans.checkoutFailed',
}

function waitFor(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

export default function BillingPlansPage({
  loadPlans = fetchBillingPlans,
  loadCredits = fetchCreditPacks,
  createCheckout = createBillingCheckoutSession,
  redirect = (url) => window.location.assign(url),
  creditPackProps = {},
  pendingRetryDelays = CHECKOUT_PENDING_RETRY_DELAYS_MS,
  wait = waitFor,
}) {
  const { lang, t } = useI18n()
  const [tokenState] = useState(() => resolveBillingPageToken(window.location.hash))
  const token = tokenState.token
  const [route, setRoute] = useState(() => parseBillingRoute(window.location.search))
  const tab = route.tab
  const [creditsTokenExpired, setCreditsTokenExpired] = useState(false)
  const creditsCopy = creditPacksCopy(lang)
  const copy = billingPlansCopy(lang)
  const [reloadKey, setReloadKey] = useState(0)
  const [view, setView] = useState(() => token
    ? { status: 'loading', plans: [], billingEnabled: true }
    : { status: 'missing-token', plans: [], billingEnabled: false })
  const [credits, setCredits] = useState(null)
  const [checkoutKey, setCheckoutKey] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [pulsePlan, setPulsePlan] = useState('')

  useEffect(() => {
    if (tokenState.fromHash && tokenState.persisted) clearBillingPageToken()
  }, [tokenState])

  useEffect(() => {
    if (!token || tab !== TAB_PLANS) return undefined

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
  }, [lang, loadPlans, reloadKey, tab, token])

  // The credit balance only decorates the plan toolbar, so any failure here
  // simply hides the status chip; the plans request owns error handling.
  useEffect(() => {
    if (!token || tab !== TAB_PLANS) return undefined

    const controller = new AbortController()
    loadCredits(token, { signal: controller.signal, lang })
      .then((result) => setCredits(result?.credits || null))
      .catch(() => {
        if (!controller.signal.aborted) setCredits(null)
      })

    return () => controller.abort()
  }, [lang, loadCredits, reloadKey, tab, token])

  const handleCreditsExpired = useCallback(() => {
    clearStoredBillingPageToken()
    setCreditsTokenExpired(true)
  }, [])

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
  const yearlyDiscount = useMemo(() => maxYearlyDiscount(localizedPlans), [localizedPlans])
  const [requestedInterval, setRequestedInterval] = useState('')
  const selectedInterval = billingIntervals.includes(requestedInterval)
    ? requestedInterval
    : preferredBillingInterval(localizedPlans, billingIntervals)

  // The in-flight checkout operation. Its signal cancels the request and any
  // pending backoff; a response from an operation that is no longer current
  // is dropped so it can never redirect or publish state.
  const checkoutAbort = useRef(null)
  const cancelCheckout = useCallback(() => {
    const controller = checkoutAbort.current
    if (!controller) return false
    checkoutAbort.current = null
    controller.abort()
    return true
  }, [])
  useEffect(() => cancelCheckout, [cancelCheckout, token])

  const handleTabChange = useCallback((nextTab) => {
    if (nextTab === tab) return
    // Leaving the plans tab abandons its checkout. The server keeps the
    // checkout intent, so choosing the plan again returns its current link.
    if (cancelCheckout()) setCheckoutKey('')
    setRoute({ tab: nextTab, checkout: { status: '', sessionId: '' } })
    window.history.replaceState(window.history.state, '', billingTabURL(window.location, nextTab))
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }, [cancelCheckout, tab])

  const handleCheckout = useCallback(async (planCode, billingInterval) => {
    if (!token || checkoutKey || checkoutAbort.current) return
    setCheckoutKey(`${planCode}:${billingInterval}`)
    setCheckoutError('')
    const controller = new AbortController()
    checkoutAbort.current = controller
    const { signal } = controller
    const isCurrent = () => !signal.aborted && checkoutAbort.current === controller
    try {
      // Every attempt asks the server for the current link; an earlier URL is
      // never reused because switching plans or a lost response invalidates it.
      for (let attempt = 0; ; attempt += 1) {
        try {
          const url = await createCheckout(token, planCode, billingInterval, { signal })
          if (!isCurrent()) return
          checkoutAbort.current = null
          redirect(url)
          return
        } catch (error) {
          if (!isCurrent()) return
          if (error?.kind !== 'checkout_pending' || attempt >= pendingRetryDelays.length) throw error
          await wait(pendingRetryDelays[attempt], signal)
          if (!isCurrent()) return
        }
      }
    } catch (error) {
      if (error?.name === 'AbortError' || !isCurrent()) return
      checkoutAbort.current = null
      if (error?.kind === 'expired_token') {
        clearStoredBillingPageToken()
        setView({ status: 'expired-token', plans: [], billingEnabled: false })
        setCheckoutKey('')
        return
      }
      setCheckoutError(CHECKOUT_ERROR_KEYS[error?.kind] || 'failed')
      // An existing subscription means the cached plan state is stale.
      if (error?.kind === 'conflict') setReloadKey((key) => key + 1)
      setCheckoutKey('')
    }
  }, [checkoutKey, createCheckout, pendingRetryDelays, redirect, token, wait])

  const handleShowPlan = useCallback((planCode) => {
    document.getElementById(planAnchor(planCode))?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    setPulsePlan('')
    window.requestAnimationFrame(() => setPulsePlan(planCode))
  }, [])

  const isCredits = tab === TAB_CREDITS
  const heroPill = isCredits
    ? copy.hero.creditsPill
    : yearlyDiscount > 0 ? formatMessage(copy.hero.pill, { percent: yearlyDiscount }) : ''

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          {heroPill && <p className={styles.pill}>{heroPill}</p>}
          <h1>
            {isCredits ? creditsCopy.title : (
              <>
                {copy.hero.titleLead}
                <em>{copy.hero.titleAccent}</em>
                <br />
                {copy.hero.titleLine2}
              </>
            )}
          </h1>
          <p className={styles.subtitle}>{isCredits ? copy.hero.creditsSubtitle : copy.hero.subtitle}</p>
          <ul className={styles.heroPoints}>
            {(isCredits ? copy.hero.creditsPoints : copy.hero.points).map((point) => <li key={point}>{point}</li>)}
          </ul>
          <div className={styles.tabs} role="tablist" aria-label={creditsCopy.tabs.label}>
            {[TAB_PLANS, TAB_CREDITS].map((key) => (
              <button
                key={key}
                id={`billing-tab-${key}`}
                className={tab === key ? styles.selectedTab : ''}
                type="button"
                role="tab"
                aria-selected={tab === key}
                aria-controls="billing-tab-panel"
                onClick={() => handleTabChange(key)}
              >
                {creditsCopy.tabs[key]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.content} id="billing-tab-panel" role="tabpanel" aria-labelledby={`billing-tab-${tab}`}>
        <div className="container">
          {isCredits ? (
            <CreditPacksTab
              token={token}
              lang={lang}
              t={t}
              checkout={route.checkout}
              tokenExpired={creditsTokenExpired}
              onExpired={handleCreditsExpired}
              onShowPlans={() => handleTabChange(TAB_PLANS)}
              {...creditPackProps}
            />
          ) : (
            <>
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
                      {t(CHECKOUT_ERROR_MESSAGES[checkoutError] || CHECKOUT_ERROR_MESSAGES.failed)}
                    </div>
                  )}
                  {localizedPlans.length === 0 ? (
                    <StatusPanel title={t('billingPlans.emptyTitle')} summary={t('billingPlans.emptySummary')} />
                  ) : (
                    <>
                      <PlanToolbar
                        copy={copy}
                        lang={lang}
                        t={t}
                        status={creditStatus(credits)}
                        currentPlan={localizedPlans.find((plan) => plan.currentPlan)}
                        intervals={billingIntervals}
                        selectedInterval={selectedInterval}
                        yearlyDiscount={yearlyDiscount}
                        disabled={Boolean(checkoutKey)}
                        onIntervalChange={setRequestedInterval}
                        onTopUp={() => handleTabChange(TAB_CREDITS)}
                      />
                      <div className={styles.planGrid}>
                        {localizedPlans.map((plan) => (
                          <PlanCard
                            key={plan.code}
                            plan={plan}
                            lang={lang}
                            t={t}
                            copy={copy}
                            maxCredits={maxPlanCredits(localizedPlans)}
                            selectedInterval={selectedInterval}
                            billingCurrency={billingCurrency}
                            billingEnabled={view.billingEnabled}
                            checkoutKey={checkoutKey}
                            pulse={pulsePlan === plan.code}
                            onCheckout={handleCheckout}
                          />
                        ))}
                      </div>
                      <PlanEstimator copy={copy} lang={lang} plans={localizedPlans} onChoose={handleShowPlan} />
                      <CreditsExplainer copy={copy} />
                      <PlanComparison copy={copy} lang={lang} plans={localizedPlans} />
                      <TrustRow copy={copy} />
                      <Faq copy={copy} />
                      <FinalCta
                        copy={copy}
                        lang={lang}
                        plans={localizedPlans}
                        intervals={billingIntervals}
                        billingEnabled={view.billingEnabled}
                        checkoutKey={checkoutKey}
                        onCheckout={handleCheckout}
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  )
}

function CreditPacksTab({ token, t, checkout, tokenExpired, ...props }) {
  if (tokenExpired) {
    if (checkout.status === 'success') {
      // A catalog request can expire alongside status polling on Stripe return.
      // Remount without the token to preserve the unverified return-to-app view.
      return <CreditPacksPanel key="expired-token" token="" checkout={checkout} {...props} />
    }
    return <StatusPanel title={t('billingPlans.expiredTitle')} summary={t('billingPlans.expiredSummary')} />
  }
  if (!token) {
    // Stripe can return to a browser session that no longer holds the token.
    // Acknowledge the payment instead of asking the user to reopen the page.
    if (checkout.status === 'success') return <CreditPacksPanel token="" checkout={checkout} {...props} />
    return <StatusPanel title={t('billingPlans.missingTitle')} summary={t('billingPlans.missingSummary')} />
  }
  return <CreditPacksPanel token={token} checkout={checkout} {...props} />
}

function parseBillingRoute(search = '') {
  const params = new URLSearchParams(search)
  if (params.get('tab') !== TAB_CREDITS) {
    return { tab: TAB_PLANS, checkout: { status: '', sessionId: '' } }
  }
  const status = params.get('checkout')
  return {
    tab: TAB_CREDITS,
    checkout: {
      status: status === 'success' || status === 'cancel' ? status : '',
      sessionId: params.get('session_id')?.trim() || '',
    },
  }
}

// Switching tabs drops the one-shot checkout return parameters.
function billingTabURL(location, tab) {
  const params = new URLSearchParams(location.search)
  params.delete('checkout')
  params.delete('session_id')
  if (tab === TAB_CREDITS) {
    params.set('tab', TAB_CREDITS)
  } else {
    params.delete('tab')
  }
  const query = params.toString()
  return `${location.pathname}${query ? `?${query}` : ''}${location.hash}`
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

// One row above the cards: the account's credit status on the left and the
// shared billing-interval switch on the right.
function PlanToolbar({
  copy,
  lang,
  t,
  status,
  currentPlan,
  intervals,
  selectedInterval,
  yearlyDiscount,
  disabled,
  onIntervalChange,
  onTopUp,
}) {
  const monthly = intervals.find(isMonthlyInterval)
  const yearly = intervals.find(isYearlyInterval)
  const showSwitch = Boolean(monthly && yearly)
  if (!status && !showSwitch) return null

  const yearlySelected = isYearlyInterval(selectedInterval)
  const text = copy.toolbar
  return (
    <div className={styles.toolbar}>
      {status ? (
        <div
          className={`${styles.statusChip} ${status.usedRatio >= LOW_CREDIT_RATIO ? styles.statusLow : ''}`}
          title={status.unlimited ? undefined : formatMessage(text.usage, { percent: Math.round(status.usedRatio * 100) })}
        >
          <UsageRing ratio={status.unlimited ? 0 : status.usedRatio} />
          <span className={styles.statusText}>
            {currentPlan && <strong>{currentPlan.name || currentPlan.code}</strong>}
            <span>
              {status.unlimited
                ? text.unlimited
                : formatMessage(text.remaining, { credits: formatNumber(status.remaining, lang) })}
            </span>
            {status.addon > 0 && (
              <span className={styles.statusMuted}>{formatMessage(text.addon, { credits: formatNumber(status.addon, lang) })}</span>
            )}
          </span>
          <button className={styles.statusAction} type="button" onClick={onTopUp}>{text.topUp}</button>
        </div>
      ) : <span />}

      {showSwitch && (
        <div className={styles.intervalSwitch} role="group" aria-label={t('billingPlans.billingInterval')}>
          <button
            className={!yearlySelected ? styles.intervalOn : ''}
            type="button"
            disabled={disabled}
            onClick={() => onIntervalChange(monthly)}
          >
            {text.monthly}
          </button>
          <button
            className={styles.switch}
            type="button"
            role="switch"
            aria-checked={yearlySelected}
            aria-label={text.yearly}
            disabled={disabled}
            onClick={() => onIntervalChange(yearlySelected ? monthly : yearly)}
          >
            <span aria-hidden="true" />
          </button>
          <button
            className={yearlySelected ? styles.intervalOn : ''}
            type="button"
            disabled={disabled}
            onClick={() => onIntervalChange(yearly)}
          >
            {text.yearly}
          </button>
          {yearlyDiscount > 0 && (
            <span className={styles.saveTag}>{formatMessage(text.saveUpTo, { percent: yearlyDiscount })}</span>
          )}
        </div>
      )}
    </div>
  )
}

function UsageRing({ ratio }) {
  const circumference = 2 * Math.PI * 12
  return (
    <svg className={styles.ring} viewBox="0 0 30 30" aria-hidden="true">
      <circle className={styles.ringTrack} cx="15" cy="15" r="12" />
      <circle
        className={styles.ringValue}
        cx="15"
        cy="15"
        r="12"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.min(1, Math.max(0, ratio)))}
      />
    </svg>
  )
}

function PlanCard({
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
}) {
  const selectedPrice = plan.prices.find((price) => price.interval === selectedInterval)
  const monthlyPrice = plan.prices.find((price) => isMonthlyInterval(price.interval))
  const yearlySelected = isYearlyInterval(selectedInterval)
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
  const disabled = !billingEnabled || plan.currentPlan || Boolean(checkoutKey) || (plan.prices.length > 0 && !selectedPrice)
  const text = copy.card

  let priceNote = ''
  if (isFree || plan.prices.length === 0) {
    priceNote = text.freeForever
  } else if (yearlySelected && selectedPrice) {
    priceNote = formatMessage(text.billedYearly, { price: formatPrice(selectedPrice.priceCents, selectedPrice.currency, lang) })
  } else if (selectedPrice) {
    priceNote = text.billedMonthly
  }
  const savePercent = yearlySelected ? selectedPrice?.discountPercent || 0 : 0

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
          <span>{formatPrice(displayedPriceCents, displayedCurrency, lang)}</span>
          {(isFree || selectedInterval) && <small>/ {t('billingPlans.perMonth')}</small>}
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
        {plan.currentPlan
          ? t('billingPlans.currentPlan')
          : isCheckingOut
            ? t('billingPlans.choosingPlan')
            : isFree
              ? formatMessage(t('billingPlans.choosePlan'), { plan: plan.name || plan.code })
              : t(yearlySelected ? 'billingPlans.subscribeYearly' : 'billingPlans.subscribeMonthly')}
      </button>

      <PlanAllowance plan={plan} lang={lang} copy={copy} maxCredits={maxCredits} />

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

function PlanEstimator({ copy, lang, plans, onChoose }) {
  const [minutes, setMinutes] = useState(DEFAULT_DAILY_MINUTES)
  const [aiUsage, setAiUsage] = useState(DEFAULT_AI_USAGE)
  const overhead = AI_USAGE_LEVELS.find((level) => level.key === aiUsage)?.overhead || 0
  const needed = estimateMonthlyCredits(minutes, overhead)
  const recommendation = recommendPlan(plans, needed)
  if (!recommendation) return null

  const text = copy.estimator
  const planName = recommendation.plan.name || recommendation.plan.code
  const paidPlans = plans.filter((plan) => plan.paid && plan.monthlyCredits !== 0)
  const minutesLabel = minutes >= 60
    ? formatMessage(text.hours, { value: formatNumber(minutes / 60, lang, 1) })
    : formatMessage(text.minutes, { value: minutes })
  let why
  if (!recommendation.fits) {
    why = formatMessage(text.over, { plan: planName, credits: formatNumber(recommendation.shortfall, lang) })
  } else if (isUnlimited(recommendation.plan.monthlyCredits)) {
    why = text.fitUnlimited
  } else {
    why = formatMessage(text.fit, { used: recommendation.usedPercent, left: 100 - recommendation.usedPercent })
  }

  return (
    <section className={styles.estimator} aria-labelledby="plan-estimator-title">
      <div className={styles.estimatorInput}>
        <p className={styles.sectionEyebrow}>{text.eyebrow}</p>
        <h2 id="plan-estimator-title">{text.title}</h2>
        <p className={styles.sectionLead}>{text.lead}</p>
        <label className={styles.sliderLabel} htmlFor="plan-estimator-minutes">
          <span>{text.minutesLabel}</span>
          <strong>{minutesLabel}</strong>
        </label>
        <input
          id="plan-estimator-minutes"
          className={styles.slider}
          type="range"
          min="5"
          max="480"
          step="5"
          value={minutes}
          style={{ '--fill': `${(minutes - 5) / (480 - 5) * 100}%` }}
          onChange={(event) => setMinutes(Number(event.target.value))}
        />
        <div className={styles.sliderLabel}><span>{text.aiLabel}</span></div>
        <div className={styles.chips} role="group" aria-label={text.aiLabel}>
          {AI_USAGE_LEVELS.map((level) => (
            <button
              key={level.key}
              type="button"
              aria-pressed={aiUsage === level.key}
              onClick={() => setAiUsage(level.key)}
            >
              {text.ai[level.key]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.estimatorResult} aria-live="polite">
        <p className={styles.estimate}>{formatMessage(text.need, { credits: formatNumber(needed, lang) })}</p>
        <p className={styles.recommendation}>
          {recommendation.fits ? planName : formatMessage(text.overTitle, { plan: planName })}
        </p>
        <p className={styles.recommendationWhy}>{why}</p>
        <div className={styles.meters}>
          {paidPlans.map((plan) => {
            const percent = usagePercent(needed, plan.monthlyCredits)
            const state = percent > 100 ? styles.meterOver : plan.code === recommendation.plan.code ? styles.meterFit : ''
            return (
              <div key={plan.code} className={`${styles.meter} ${state}`}>
                <span>{plan.name || plan.code}</span>
                <span className={styles.meterTrack}><i style={{ width: `${Math.min(100, percent)}%` }} /></span>
                <span className={styles.meterValue}>{percent > 999 ? '>999%' : `${percent}%`}</span>
              </div>
            )
          })}
        </div>
        <button
          className={`btn ${styles.checkoutButton} ${styles.featuredCheckoutButton}`}
          type="button"
          onClick={() => onChoose(recommendation.plan.code)}
        >
          {formatMessage(text.choose, { plan: planName })}
        </button>
        <p className={styles.estimatorNote}>{text.note}</p>
      </div>
    </section>
  )
}

function CreditsExplainer({ copy }) {
  const text = copy.how
  return (
    <section className={styles.infoSection}>
      <p className={styles.sectionEyebrow}>{text.eyebrow}</p>
      <h2>{text.title}</h2>
      <p className={styles.sectionLead}>{text.lead}</p>
      <div className={styles.howGrid}>
        {text.items.map((item) => (
          <div key={item.title} className={styles.howCard}>
            <span className={styles.howIcon} aria-hidden="true">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <span className={styles.howTag}>{item.tag}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PlanComparison({ copy, lang, plans }) {
  const text = copy.compare
  const yes = <span className={styles.yes} aria-label="✓">✓</span>
  const rows = [
    [text.monthlyCredits, (plan) => (isUnlimited(plan.monthlyCredits)
      ? copy.card.unlimited
      : formatNumber(Math.max(0, plan.monthlyCredits), lang))],
    [text.dictation, (plan) => (plan.paid && plan.monthlyCredits > 0
      ? formatMessage(text.dictationValue, { hours: formatHours(dictationHours(plan.monthlyCredits), lang) })
      : <span className={styles.no}>—</span>)],
    [text.ai, () => yes],
    [text.local, () => text.localValue],
    [text.personas, () => yes],
    [text.addons, () => yes],
  ]
  return (
    <section className={styles.infoSection}>
      <p className={styles.sectionEyebrow}>{text.eyebrow}</p>
      <h2>{text.title}</h2>
      <div className={styles.compare}>
        <table>
          <thead>
            <tr>
              <td />
              {plans.map((plan) => (
                <th key={plan.code} scope="col" className={plan.highlight ? styles.compareHighlight : ''}>
                  {plan.name || plan.code}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {plans.map((plan) => (
                  <td key={plan.code} className={plan.highlight ? styles.compareHighlight : ''}>{value(plan)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TrustRow({ copy }) {
  return (
    <div className={styles.trust}>
      {copy.trust.map((item) => (
        <div key={item.title}>
          <strong>{item.title}</strong>
          <span>{item.body}</span>
        </div>
      ))}
    </div>
  )
}

function Faq({ copy }) {
  return (
    <section className={`${styles.infoSection} ${styles.faq}`}>
      <h2>{copy.faq.title}</h2>
      {copy.faq.items.map((item, index) => (
        <details key={item.q} open={index === 0}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </section>
  )
}

function FinalCta({ copy, lang, plans, intervals, billingEnabled, checkoutKey, onCheckout }) {
  const plan = plans.find((candidate) => candidate.highlight && candidate.paid)
  if (!plan || plan.currentPlan) return null

  const yearlyInterval = intervals.find(isYearlyInterval)
  const yearlyPrice = plan.prices.find((price) => price.interval === yearlyInterval)
  const fallbackPrice = plan.prices.find((price) => isMonthlyInterval(price.interval)) || plan.prices[0]
  const price = yearlyPrice || fallbackPrice
  if (!price) return null

  const text = copy.final
  const planName = plan.name || plan.code
  const subtitle = yearlyPrice
    ? formatMessage(text.subtitle, {
        plan: planName,
        price: formatPrice(Math.round(yearlyPrice.priceCents / 365), yearlyPrice.currency, lang),
      })
    : text.fallback
  return (
    <section className={styles.final}>
      <h2>{text.title}</h2>
      <p>{subtitle}</p>
      <button
        className={`btn ${styles.checkoutButton} ${styles.featuredCheckoutButton}`}
        type="button"
        disabled={!billingEnabled || Boolean(checkoutKey)}
        onClick={() => onCheckout(plan.code, price.interval)}
      >
        {formatMessage(text.cta, { plan: planName })}
      </button>
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

function planAnchor(code) {
  return `plan-${code}`
}

function maxPlanCredits(plans) {
  return plans.reduce((max, plan) => Math.max(max, plan.monthlyCredits), 0)
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
    monthlyCredits,
    paid: typeof plan.paid === 'boolean' ? plan.paid : plan.prices.length > 0,
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
