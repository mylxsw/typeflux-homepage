import { useCallback, useEffect, useMemo, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import {
  clearStoredBillingPageToken,
  fetchBillingPlans,
  fetchCreditPacks,
  openBillingManagement,
} from '../lib/billingApi'
import { useAccountSession } from '../contexts/AccountSessionContext.jsx'
import { localizedPath } from '../lib/localePath'
import { loginURL } from '../lib/accountNavigation'
import { accountCopy } from './account/accountCopy'
import AccountChoice from './account/AccountChoice'
import accountStyles from './account/Account.module.css'
import { useBillingAccess } from './billing/useBillingAccess'
import { billingPlansCopy } from './billingPlansCopy'
import { creditPacksCopy } from './creditPacksCopy'
import { checkoutCopy } from './billing/checkoutCopy'
import {
  defaultMethod,
  membershipMethods,
  packMethods,
  purchasablePlans,
  subscriptionState,
} from './billing/checkoutModel'
import { formatDate, formatMessage, formatNumber } from './billing/format'
import CreditsView from './billing/CreditsView'
import MembershipView from './billing/MembershipView'
import PaymentDialog from './billing/PaymentDialog'
import { isUnresolved, usePrepaidOrder } from './billing/usePrepaidOrder'
import { useStripeCheckout } from './billing/useStripeCheckout'
import styles from './billing/Checkout.module.css'

const TAB_PLANS = 'plans'
const TAB_CREDITS = 'credits'

// BillingPlansPage first settles which credential to use (App handoff, App
// page token or website session), then mounts the purchase page with it.
export default function BillingPlansPage({ exchange, ...props }) {
  const { lang, t } = useI18n()
  const access = useBillingAccess(exchange ? { exchange } : undefined)
  const session = useAccountSession()
  if (access.status === 'resolving') {
    return <main className={styles.page}><section className={styles.content}><div className="container">
      <StatusPanel title={t('billingPlans.loadingTitle')} summary={checkoutCopy(lang).order.loading} busy />
    </div></section></main>
  }
  if (access.status === 'mismatch') {
    return <main className={styles.page}><section className={styles.content}><div className="container"><div className={accountStyles.state}>
      <AccountChoice lang={lang} c={accountCopy(lang)} result={access.mismatch.result} busy={access.mismatch.busy} failed={access.mismatch.failed} onChoose={access.choose} />
    </div></div></section></main>
  }
  return <BillingPlansContent {...props} token={access.token} canSignIn={session.status !== 'disabled'}
    onSessionExpired={access.source === 'session' ? session.expire : undefined} />
}

function BillingPlansContent({
  token,
  canSignIn = false,
  onSessionExpired,
  loadPlans = fetchBillingPlans,
  loadCredits = fetchCreditPacks,
  manage = openBillingManagement,
  redirect = (url) => window.location.assign(url),
  stripeProps = {},
  prepaidProps = {},
  creditProps = {},
}) {
  const { lang, t } = useI18n()
  const copy = checkoutCopy(lang)
  const plansCopy = billingPlansCopy(lang)
  const packCopy = creditPacksCopy(lang)
  const [route, setRoute] = useState(() => parseBillingRoute(window.location.search))
  const tab = route.tab
  const [expired, setExpired] = useState(false)
  const [plansView, setPlansView] = useState({ status: token ? 'loading' : 'idle', plans: [], billingEnabled: false, currentSubscription: null })
  const [packsView, setPacksView] = useState({ status: token ? 'loading' : 'idle', packs: [], billingEnabled: false, credits: null })
  const [plansKey, setPlansKey] = useState(0)
  const [packsKey, setPacksKey] = useState(0)
  const [historyKey, setHistoryKey] = useState(0)
  const [requestedMethod, setRequestedMethod] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [manageState, setManageState] = useState({ busy: false, failed: false })

  const expire = useCallback(() => {
    clearStoredBillingPageToken()
    setExpired(true)
    onSessionExpired?.()
  }, [onSessionExpired])

  useEffect(() => {
    if (!token) return undefined
    const controller = new AbortController()
    setPlansView((current) => ({ ...current, status: current.status === 'ready' ? 'ready' : 'loading' }))
    loadPlans(token, { signal: controller.signal, lang })
      .then((result) => setPlansView({ status: 'ready', ...result }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.kind === 'expired_token') expire()
        else setPlansView({ status: 'error', plans: [], billingEnabled: false, currentSubscription: null })
      })
    return () => controller.abort()
  }, [expire, lang, loadPlans, plansKey, token])

  useEffect(() => {
    if (!token) return undefined
    const controller = new AbortController()
    setPacksView((current) => ({ ...current, status: current.status === 'ready' ? 'ready' : 'loading' }))
    loadCredits(token, { signal: controller.signal, lang })
      .then((result) => setPacksView({ status: 'ready', ...result }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.kind === 'expired_token') expire()
        else setPacksView({ status: 'error', packs: [], billingEnabled: false, credits: null })
      })
    return () => controller.abort()
  }, [expire, lang, loadCredits, packsKey, token])

  const refreshAccount = useCallback(() => {
    setPlansKey((key) => key + 1)
    setPacksKey((key) => key + 1)
    setHistoryKey((key) => key + 1)
  }, [])

  const prepaid = usePrepaidOrder({
    token,
    onGranted: refreshAccount,
    onExpired: expire,
    onRecovered: useCallback((order) => {
      if (isUnresolved(order) || order.fulfillment === 'granted') setDialogOpen(true)
    }, []),
    ...prepaidProps,
  })
  const stripe = useStripeCheckout({
    token,
    redirect,
    onExpired: expire,
    onConflict: () => setPlansKey((key) => key + 1),
    ...stripeProps,
  })

  const allPlans = useMemo(() => plansView.plans.map((plan) => localizePlan(plan, lang, t)), [lang, plansView.plans, t])
  const plans = useMemo(() => purchasablePlans(allPlans), [allPlans])
  const packs = packsView.packs
  const subscription = plansView.currentSubscription
  const methods = tab === TAB_CREDITS ? packMethods(packs) : membershipMethods(plans)
  const method = methods.includes(requestedMethod) ? requestedMethod : defaultMethod(methods, { lang, subscription })

  const changeTab = useCallback((next) => {
    if (next === tab) return
    setRoute({ tab: next, checkout: { status: '', sessionId: '' } })
    window.history.replaceState(window.history.state, '', billingTabURL(window.location, next))
    stripe.clearError()
  }, [stripe, tab])

  const changeMethod = useCallback((next) => {
    setRequestedMethod(next)
    stripe.clearError()
  }, [stripe])

  const startPrepaid = useCallback(async (selection) => {
    const order = await prepaid.start(selection)
    if (order) setDialogOpen(true)
  }, [prepaid])

  const openManagement = useCallback(async () => {
    if (manageState.busy) return
    setManageState({ busy: true, failed: false })
    try {
      redirect(await manage(token))
      setManageState({ busy: false, failed: false })
    } catch (error) {
      if (error?.kind === 'expired_token') expire()
      setManageState({ busy: false, failed: true })
    }
  }, [expire, manage, manageState.busy, redirect, token])

  const order = prepaid.order
  const dialogTitle = order ? orderTitle(order, { plans, packs, copy, lang }) : ''
  const showDialog = dialogOpen && order && !expired

  if (!token || expired) {
    const unverifiedReturn = tab === TAB_CREDITS && route.checkout.status === 'success'
    return (
      <main className={styles.page}>
        <section className={styles.content}>
          <div className="container">
            {unverifiedReturn ? (
              <CreditsView token="" packs={[]} copy={copy} packCopy={packCopy} lang={lang} methods={[]} stripe={stripe} checkout={route.checkout} {...creditProps} />
            ) : (
              <StatusPanel
                title={t(expired ? 'billingPlans.expiredTitle' : 'billingPlans.missingTitle')}
                summary={t(expired ? 'billingPlans.expiredSummary' : 'billingPlans.missingSummary')}
              >
                {canSignIn && (
                  <a className={styles.secondaryButton} href={loginURL(lang, `${localizedPath(lang, '/billing/plans')}`)}>
                    {accountCopy(lang).signedOut.action}
                  </a>
                )}
              </StatusPanel>
            )}
          </div>
        </section>
      </main>
    )
  }

  const activeView = tab === TAB_CREDITS ? packsView : plansView
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <h1>{copy.hero.title}</h1>
          <p className={styles.subtitle}>{copy.hero.subtitle}</p>
          <AccountStrip
            copy={copy}
            lang={lang}
            plans={allPlans}
            subscription={subscription}
            credits={packsView.credits}
            manageBusy={manageState.busy}
            onManage={openManagement}
          />
          {manageState.failed && <p className={styles.heroError} role="alert">{copy.order.stripeErrors.failed}</p>}
          <div className={styles.tabs} role="tablist" aria-label={copy.tabs.label}>
            {[TAB_PLANS, TAB_CREDITS].map((key) => (
              <button
                key={key}
                id={`billing-tab-${key}`}
                type="button"
                role="tab"
                aria-selected={tab === key}
                aria-controls="billing-tab-panel"
                onClick={() => changeTab(key)}
              >
                {copy.tabs[key]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.content} id="billing-tab-panel" role="tabpanel" aria-labelledby={`billing-tab-${tab}`}>
        <div className="container">
          <PendingBanner
            prepaid={prepaid}
            copy={copy}
            title={dialogOpen ? '' : dialogTitle}
            onResume={() => {
              if (prepaid.unconfirmed) startPrepaid(selectionFromIntent(prepaid.intent))
              else setDialogOpen(true)
            }}
          />
          {prepaid.error === 'failed' && !showDialog && <p className={styles.bannerError} role="alert">{copy.pay.failed}</p>}

          {activeView.status === 'loading' && (
            <StatusPanel title={t('billingPlans.loadingTitle')} summary={copy.order.loading} busy />
          )}
          {activeView.status === 'error' && (
            <StatusPanel title={tab === TAB_CREDITS ? packCopy.errorTitle : t('billingPlans.errorTitle')} summary={tab === TAB_CREDITS ? packCopy.errorSummary : t('billingPlans.errorSummary')}>
              <button className={styles.secondaryButton} type="button" onClick={() => (tab === TAB_CREDITS ? setPacksKey : setPlansKey)((key) => key + 1)}>
                {t('billingPlans.retry')}
              </button>
            </StatusPanel>
          )}

          {activeView.status === 'ready' && tab === TAB_PLANS && (
            plans.length === 0 ? (
              <StatusPanel title={t('billingPlans.emptyTitle')} summary={t('billingPlans.emptySummary')} />
            ) : (
              <>
                <MembershipView
                  plans={plans}
                  subscription={subscription}
                  copy={copy}
                  estimatorText={{ ...plansCopy.estimator, helpTitle: copy.plans.help }}
                  lang={lang}
                  method={method}
                  methods={methods}
                  onMethodChange={changeMethod}
                  billingEnabled={plansView.billingEnabled}
                  locked={prepaid.locked}
                  stripe={stripe}
                  prepaidBusy={prepaid.busy}
                  onStripe={stripe.subscribe}
                  onPrepaid={startPrepaid}
                />
                <Faq
                  title={plansCopy.faq.title}
                  items={faqItems(plansCopy.faq.items, methods, copy)}
                />
              </>
            )
          )}

          {activeView.status === 'ready' && tab === TAB_CREDITS && (
            <CreditsView
              token={token}
              packs={packs}
              credits={packsView.credits}
              copy={copy}
              packCopy={packCopy}
              lang={lang}
              method={method}
              methods={methods}
              onMethodChange={changeMethod}
              billingEnabled={packsView.billingEnabled}
              locked={prepaid.locked}
              stripe={stripe}
              prepaidBusy={prepaid.busy}
              onStripe={stripe.buyPack}
              onPrepaid={startPrepaid}
              checkout={route.checkout}
              historyKey={historyKey}
              onCreditsChanged={refreshAccount}
              onExpired={expire}
              {...creditProps}
            />
          )}
        </div>
      </section>

      {showDialog && (
        <PaymentDialog
          order={order}
          copy={copy}
          lang={lang}
          title={dialogTitle}
          successText={successText(order, { plans, copy, lang })}
          busy={prepaid.busy}
          pollPaused={prepaid.pollPaused}
          error={prepaid.error === 'failed' ? copy.pay.failed : ''}
          onCheck={prepaid.check}
          onCancel={prepaid.cancel}
          onClose={() => setDialogOpen(false)}
          onFinish={() => {
            prepaid.clear()
            setDialogOpen(false)
          }}
        />
      )}
    </main>
  )
}

function AccountStrip({ copy, lang, plans, subscription, credits, manageBusy, onManage }) {
  const state = subscriptionState(subscription)
  const current = plans.find((plan) => plan.code === state.planCode) || plans.find((plan) => plan.currentPlan)
  const parts = []
  if (state.prepaid && state.periodEnd) parts.push(formatMessage(copy.status.validUntil, { date: formatDate(state.periodEnd, lang) }))
  if (state.stripe) parts.push(copy.status.autoRenew)
  if (credits) {
    const unlimited = credits.unlimited || credits.limit < 0
    parts.push(unlimited ? copy.status.unlimited : formatMessage(copy.status.remaining, { credits: formatNumber(Math.max(0, credits.remaining), lang) }))
    const addon = Math.max(0, credits.addon?.remaining || 0)
    if (addon > 0) parts.push(formatMessage(copy.status.addon, { credits: formatNumber(addon, lang) }))
  }
  if (!current && parts.length === 0) return null

  return (
    <div className={styles.account} aria-label={copy.status.label}>
      {current && <strong>{current.name || current.code}</strong>}
      {parts.map((part) => <span key={part}>{part}</span>)}
      {state.stripe && (
        <button className={styles.accountAction} type="button" disabled={manageBusy} onClick={onManage}>{copy.status.manage}</button>
      )}
    </div>
  )
}

function PendingBanner({ prepaid, copy, title, onResume }) {
  if (prepaid.error === 'recovery') {
    return (
      <div className={styles.banner} role="alert">
        <span>{copy.pending.recovery}</span>
        <button className={styles.secondaryButton} type="button" disabled={prepaid.recovering} onClick={prepaid.retryRecovery}>{copy.pending.tryAgain}</button>
      </div>
    )
  }
  if (prepaid.unconfirmed) {
    return (
      <div className={styles.banner} role="status">
        <span>{copy.pending.unconfirmed}</span>
        <button className={styles.secondaryButton} type="button" disabled={prepaid.busy} onClick={onResume}>{copy.pending.resume}</button>
      </div>
    )
  }
  if (!title || !isUnresolved(prepaid.order)) return null
  return (
    <div className={styles.banner} role="status">
      <span><strong>{copy.pending.title}</strong> · {title}</span>
      <button className={styles.secondaryButton} type="button" onClick={onResume}>{copy.pending.resume}</button>
    </div>
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

function Faq({ title, items }) {
  return (
    <section className={styles.faq}>
      <h2>{title}</h2>
      {items.map((item) => (
        <details key={item.q}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </section>
  )
}

// The last stock answer explains cancelling a Stripe subscription.
function faqItems(items, methods, copy) {
  return [
    ...items.slice(0, 3),
    ...(methods.includes('stripe') ? items.slice(3) : []),
    ...(methods.some((method) => method !== 'stripe') ? [copy.faqPrepaid] : []),
  ]
}

function orderTitle(order, { plans, packs, copy, lang }) {
  if (order.kind === 'credit_pack') {
    const pack = packs.find((candidate) => candidate.code === order.pack_code)
    const credits = formatMessage(copy.packs.credits, { credits: formatNumber(order.credits || pack?.credits || 0, lang) })
    return `${pack?.name || order.pack_code} · ${credits}`
  }
  const plan = plans.find((candidate) => candidate.code === order.plan_code)
  return `${plan?.name || order.plan_code} · ${copy.termLength[order.billing_interval] || order.billing_interval}`
}

function successText(order, { plans, copy, lang }) {
  if (order.kind === 'credit_pack') {
    return formatMessage(copy.pay.creditsAddedBody, { credits: formatNumber(order.credits || 0, lang) })
  }
  const plan = plans.find((candidate) => candidate.code === order.plan_code)?.name || order.plan_code
  const date = formatDate(order.period_end, lang)
  return date ? formatMessage(copy.pay.activatedUntil, { plan, date }) : formatMessage(copy.pay.activatedNow, { plan })
}

function selectionFromIntent(intent) {
  if (!intent) return null
  return intent.pack_code
    ? { pack_code: intent.pack_code, channel: intent.channel }
    : { plan_code: intent.plan_code, billing_interval: intent.billing_interval, channel: intent.channel }
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
  if (tab === TAB_CREDITS) params.set('tab', TAB_CREDITS)
  else params.delete('tab')
  const query = params.toString()
  return `${location.pathname}${query ? `?${query}` : ''}${location.hash}`
}

function localizePlan(plan, lang, t) {
  const localized = {
    ...plan,
    monthlyCredits: Number.isFinite(plan.monthlyCredits) ? plan.monthlyCredits : 0,
    features: Array.isArray(plan.features) ? plan.features : [],
  }
  if (lang === 'en' || lang === 'zh-CN' || (plan.code !== 'free' && plan.code !== 'pro')) return localized
  const root = `billingPlans.catalog.plans.${plan.code}`
  return {
    ...localized,
    name: translatedValue(t, `${root}.name`, plan.name),
    tagline: translatedValue(t, `${root}.tagline`, plan.tagline),
  }
}

function translatedValue(t, key, fallback) {
  const value = t(key)
  return value === key ? fallback : value
}
