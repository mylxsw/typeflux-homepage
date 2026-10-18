import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useI18n } from '../i18n/index.jsx'
import BillingPlanCard from './BillingPlanCard'
import { billingPlansCopy } from './billingPlansCopy'
import { prepaidMembershipCopy, prepaidMessage } from './prepaidMembershipCopy'
import { creditStatus, isUnlimited } from './billingInsights'
import { creditPacksCopy } from './creditPacksCopy'
import billingStyles from './BillingPlansPage.module.css'
import { QRCodeSVG } from 'qrcode.react'
import {
  clearStoredBillingPageToken, closePrepaidOrder, createPrepaidOrder, createRequestId,
  fetchPrepaidOrder, fetchPrepaidOrders, openBillingManagement,
} from '../lib/billingApi'
import styles from './PrepaidMembershipPanel.module.css'

const STORAGE_KEY = 'typeflux.prepaidIntent'
const isWaiting = (order) => order && order.status !== 'closed' && order.fulfillment === 'pending'

function storedIntent() {
  try {
    const item = JSON.parse(globalThis.sessionStorage?.getItem(STORAGE_KEY) || 'null')
    return item && typeof item.request_id === 'string' && ((typeof item.pack_code === 'string' && item.pack_code)
      || (typeof item.plan_code === 'string' && ['month', 'quarter', 'year'].includes(item.billing_interval)))
      && ['alipay_page', 'wechat_native'].includes(item.channel) ? item : null
  } catch { return null }
}

function saveIntent(intent) {
  try {
    if (intent) globalThis.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(intent))
    else globalThis.sessionStorage?.removeItem(STORAGE_KEY)
  } catch { /* Server-side intent recovery also works without browser storage. */ }
}

export default function PrepaidMembershipPanel({
  token, plans = [], creditPacks, renderCatalog, onGranted, onPendingChange, subscription, lang = 'en', billingEnabled = true, credits, pulsePlan,
  createOrder = createPrepaidOrder, getOrder = fetchPrepaidOrder, listOrders = fetchPrepaidOrders,
  closeOrder = closePrepaidOrder, manage = openBillingManagement, redirect = (url) => window.location.assign(url),
  pollInterval = 2000, maxPolls = 90,
}) {
  const { t } = useI18n()
  const baseText = prepaidMembershipCopy(lang)
  const packCopy = creditPacksCopy(lang)
  const copy = billingPlansCopy(lang)
  const balance = creditStatus(credits)
  const available = plans.filter((plan) => plan.code === 'free' || plan.prices.some((price) => price.provider === 'aidea'))
    .map((plan) => ({ ...plan, prices: plan.prices.filter((price) => price.provider === 'aidea'), paid: plan.paid ?? plan.code !== 'free' }))
  const paidPlans = available.filter((plan) => plan.paid)
  const [intent, setIntent] = useState(storedIntent)
  const [planCode, setPlanCode] = useState(() => intent?.pack_code || intent?.plan_code || creditPacks?.[0]?.code || paidPlans[0]?.code || '')
  const [interval, setInterval] = useState(() => intent?.billing_interval || 'month')
  const [channel, setChannel] = useState(() => intent?.channel || 'wechat_native')
  const [order, setOrder] = useState(null)
  const isCreditPack = order ? order.kind === 'credit_pack' : Boolean(creditPacks)
  const text = isCreditPack ? { ...baseText, checkout:packCopy.tabs.credits, title:packCopy.tabs.credits, unavailable:packCopy.billingUnavailable, paidPending:baseText.creditsPending, paidPendingDescription:baseText.creditsPendingDescription, activated:packCopy.result.grantedTitle, activatedDescription:baseText.creditsActivated, checkActivation:baseText.checkCredits } : baseText
  const grantedNotice = useRef('')
  useEffect(() => {
    if (order?.kind === 'credit_pack' && order.fulfillment === 'granted' && grantedNotice.current !== order.id) {
      grantedNotice.current = order.id
      onGranted?.()
    }
  }, [order?.kind, order?.fulfillment, order?.id, onGranted])
  const [showCheckout, setShowCheckout] = useState(false)
  const [pollPaused, setPollPaused] = useState(false)
  const [activatedPlan, setActivatedPlan] = useState('')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [expired, setExpired] = useState(false)
  const [recoveryFailed, setRecoveryFailed] = useState(false)
  const [recoveryGeneration, setRecoveryGeneration] = useState(0)
  const [pollGeneration, setPollGeneration] = useState(0)
  const operation = useRef(null)
  const currentPlan = creditPacks ? creditPacks.find((pack) => pack.code === planCode) : plans.find((plan) => plan.code === planCode)
  const prices = currentPlan?.prices.filter((price) => price.provider === 'aidea') || []
  const price = prices.find((item) => item.interval === interval) || prices[0]
  const effectiveInterval = creditPacks ? 'one_time' : price?.interval || interval
  const intervals = ['month', 'quarter', 'year'].filter((term) => paidPlans.some((plan) => plan.prices.some((item) => item.interval === term)))
  const selectedInterval = intervals.includes(interval) ? interval : intervals[0]
  const channels = price?.channels?.length ? price.channels : ['wechat_native', 'alipay_page']
  const effectiveChannel = channels.includes(channel) ? channel : channels[0]
  const stripeActive = !creditPacks && subscription?.paid && subscription?.active && subscription?.billing_mode !== 'prepaid'
  const paidPlanCode = creditPacks ? '' : subscription?.paid && subscription?.active && subscription?.billing_mode === 'prepaid' ? subscription.plan_code : activatedPlan
  const otherPlan = Boolean(paidPlanCode && paidPlanCode !== planCode)

  function acceptOrder(next) {
    setOrder(next)
    if (next.fulfillment === 'granted') setActivatedPlan(next.plan_code)
    setError('')
    setPlanCode(next.pack_code || next.plan_code)
    setInterval(next.billing_interval)
    setChannel(next.channel)
  }

  function fail(failure) {
    if (failure?.name === 'AbortError') return
    if (failure?.kind === 'expired_token') {
      clearStoredBillingPageToken()
      setExpired(true)
    } else setError(text.failed)
  }

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    const restore = async () => {
      setBusy(true); setOrder(null); setExpired(false); setShowCheckout(false); setRecoveryFailed(false); setError('')
      try {
        const saved = storedIntent()
        if (saved) {
          const next = await getOrder(token, saved.order_id || saved.request_id, { signal })
          if (!signal.aborted) {
            if ((next.kind === 'credit_pack') === Boolean(creditPacks) || isWaiting(next) || next.fulfillment === 'review') { acceptOrder(next); setShowCheckout(true) }
            else setIntent(null)
          }
        } else {
          const orders = await listOrders(token, { signal })
          const pending = orders.find((item) => isWaiting(item) || item.fulfillment === 'review')
          if (pending) {
            const next = await getOrder(token, pending.id, { signal })
            if (!signal.aborted) {
              const recovered = { request_id: next.id, order_id: next.id, ...(next.kind === 'credit_pack' ? { pack_code:next.pack_code } : { plan_code: next.plan_code, billing_interval: next.billing_interval }), channel: next.channel }
              saveIntent(recovered); setIntent(recovered); acceptOrder(next); setShowCheckout(true)
            }
          }
        }
      } catch (failure) {
        if (signal.aborted) return
        if (failure?.status === 404) { saveIntent(null); setIntent(null) }
        else { fail(failure); setRecoveryFailed(failure?.kind !== 'expired_token') }
      } finally { if (!signal.aborted) setBusy(false) }
    }
    restore()
    return () => { controller.abort(); operation.current?.abort() }
    // A new token starts a new account-bound recovery operation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, getOrder, listOrders, recoveryGeneration])

  useEffect(() => {
    if (!isWaiting(order) || expired) return undefined
    const controller = new AbortController()
    let timer
    let count = 0
    const poll = async () => {
      try {
        const next = await getOrder(token, order.id, { signal: controller.signal })
        if (controller.signal.aborted) return
        acceptOrder(next)
        if (isWaiting(next)) {
          if (++count < maxPolls) timer = setTimeout(poll, pollInterval)
          else setPollPaused(true)
        }
      } catch (failure) { if (!controller.signal.aborted) fail(failure) }
    }
    timer = setTimeout(poll, pollInterval)
    return () => { controller.abort(); clearTimeout(timer) }
    // Status transitions stop polling; changing payment URLs does not restart its bound.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, order?.status, order?.fulfillment, token, expired, getOrder, pollGeneration, maxPolls, pollInterval])

  async function run(action) {
    if (operation.current || expired) return
    const controller = new AbortController(); operation.current = controller
    setBusy(true); setError('')
    try { await action(controller.signal) } catch (failure) { if (!controller.signal.aborted) fail(failure) }
    finally { if (operation.current === controller) { operation.current = null; setBusy(false) } }
  }

  function purchase() {
    if (!billingEnabled || !price || stripeActive || otherPlan || recoveryFailed) return
    run(async (signal) => {
      const same = (creditPacks ? intent?.pack_code === planCode : intent?.plan_code === planCode && intent?.billing_interval === effectiveInterval) && intent?.channel === effectiveChannel
      const nextIntent = same ? intent : { request_id: createRequestId(), ...(creditPacks ? { pack_code:planCode } : { plan_code: planCode, billing_interval: effectiveInterval }), channel: effectiveChannel }
      // Save before the request: a lost response must keep the same purchase ID.
      saveIntent(nextIntent); setIntent(nextIntent)
      const next = await createOrder(token, nextIntent, { signal })
      if (signal.aborted) return
      const saved = { ...nextIntent, order_id: next.id }; saveIntent(saved); setIntent(saved); acceptOrder(next)
    })
  }

  const reviewing = order?.fulfillment === 'review'
  const waiting = isWaiting(order)
  const unconfirmedIntent = Boolean(intent && !order)
  useEffect(() => { onPendingChange?.(busy || waiting || unconfirmedIntent || reviewing || recoveryFailed) }, [busy, waiting, unconfirmedIntent, reviewing, recoveryFailed, onPendingChange])
  const amount = order?.amount_fen ?? price?.priceCents ?? 0
  const amountLabel = new Intl.NumberFormat(lang, { style: 'currency', currency: 'CNY' }).format(amount / 100)
  const displayedPlan = isCreditPack ? creditPacks?.find((pack) => pack.code === (order?.pack_code || planCode)) : plans.find((plan) => plan.code === (order?.plan_code || planCode))
  const displayTerm = order?.billing_interval || effectiveInterval
  const end = order?.period_end
  const membershipEnd = subscription?.current_period_end && new Date(subscription.current_period_end)
  const membershipEndLabel = membershipEnd && !Number.isNaN(membershipEnd.getTime()) ? membershipEnd.toLocaleDateString(lang) : ''
  const endLabel = end && !Number.isNaN(new Date(end).getTime()) ? new Date(end).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const state = order?.fulfillment === 'granted' ? 'activated'
    : order?.fulfillment === 'refunded' ? 'refunded'
      : reviewing ? 'review' : order?.status === 'closed' ? 'closed'
        : order?.status === 'paid' ? 'paidPending' : 'waiting'
  const stateDescription = text[state + 'Description']
  const actualChannel = order?.channel || effectiveChannel
  const packCredits = order?.credits ?? displayedPlan?.credits ?? 0
  const packValidDays = order?.valid_days ?? displayedPlan?.validDays ?? 0
  const choose = (code, term) => {
    if (waiting || reviewing || unconfirmedIntent) { setShowCheckout(true); return }
    if (order) { saveIntent(null); setIntent(null); setOrder(null); setPollPaused(false) }
    setPlanCode(code); setInterval(term); setShowCheckout(true); setError('')
  }
  const nextPurchase = () => {
    saveIntent(null); setIntent(null); setOrder(null); setShowCheckout(false); setError(''); setPollPaused(false)
  }
  const checkPayment = () => run(async (signal) => {
    const next = await getOrder(token, order.id, { signal })
    if (!signal.aborted) { acceptOrder(next); setPollPaused(false); setPollGeneration((value) => value + 1) }
  })

  return <section className={styles.panel} aria-label={text.title}>
    {(!billingEnabled || (!creditPacks && !paidPlans.length)) && <p className={styles.notice} role="status">{text.unavailable}</p>}
    {subscription?.billing_mode === 'prepaid' && membershipEndLabel && <div className={styles.membership}><span>{text.membership} · <strong>{subscription.plan_code}</strong></span><span>{text.validUntil} {membershipEndLabel}</span></div>}
    {stripeActive && <div className={styles.notice}><p>{text.stripe}</p><button type="button" className={styles.secondary} disabled={busy || expired} onClick={() => run(async (signal) => { const url = await manage(token, { signal }); if (!signal.aborted) redirect(url) })}>{text.manage}</button></div>}
    {expired && !showCheckout && <p className={styles.error} role="alert">{text.expired}</p>}
    {error && !showCheckout && <div className={styles.notice}><p className={styles.error} role="alert">{recoveryFailed ? text.recoveryFailed : error}</p>{recoveryFailed && <button className={styles.secondary} type="button" disabled={busy} onClick={() => setRecoveryGeneration((value) => value + 1)}>{text.tryAgain}</button>}</div>}
    {!showCheckout && (order || unconfirmedIntent) && <div className={styles.resume}>
      <div><strong>{waiting || unconfirmedIntent ? text.pendingTitle : text[state]}</strong><p>{waiting || unconfirmedIntent ? text.pendingSummary : stateDescription}</p></div>
      <button className={styles.secondary} type="button" onClick={() => setShowCheckout(true)}>{waiting || unconfirmedIntent ? text.resume : text.summary}</button>
    </div>}
    {creditPacks ? renderCatalog?.({ choose, busy: busy || expired || recoveryFailed || reviewing, waiting: waiting || unconfirmedIntent }) : <><div className={styles.catalogToolbar}>
      <div className={styles.balance}>{balance && !activatedPlan ? balance.unlimited ? copy.toolbar.unlimited : prepaidMessage(text.balance, { credits: new Intl.NumberFormat(lang).format(balance.remaining) }) : text.singlePayment}</div>
      {intervals.length > 0 && <div className={styles.termSwitch} role="group" aria-label={text.termLabel}>
        {intervals.map((term) => <button type="button" key={term} aria-label={text.terms[term]} aria-pressed={selectedInterval === term} disabled={busy || waiting || unconfirmedIntent} onClick={() => setInterval(term)}>{text.termShort[term]}</button>)}
      </div>}
    </div>
    {busy && !showCheckout && <p className={styles.recovering} role="status">{text.preparing}</p>}
    <div className={billingStyles.planGrid}>
      {available.map((plan) => <BillingPlanCard key={plan.code} plan={{ ...plan, currentPlan: paidPlanCode ? plan.code === paidPlanCode : plan.currentPlan }} lang={lang} t={t} copy={copy}
        maxCredits={Math.max(0, ...available.map((item) => item.monthlyCredits || 0))} selectedInterval={selectedInterval} billingCurrency="CNY"
        billingEnabled={billingEnabled && !busy && !expired && !recoveryFailed && !stripeActive && !reviewing && (!paidPlanCode || paidPlanCode === plan.code)}
        checkoutKey={busy ? 'recovering' : ''} pulse={pulsePlan === plan.code} onCheckout={choose} prepaid={text} />)}
    </div>
    <p className={styles.catalogFootnote}>{text.monthlyRefresh}</p>
    {paidPlanCode && <p className={styles.catalogFootnote}>{text.different}</p>}</>}

    {showCheckout && <CheckoutDialog title={text.checkout} closeLabel={text.close} onClose={() => setShowCheckout(false)}>
      <aside className={styles.orderSummary} aria-label={text.summary}>
        <h2>{displayedPlan?.name || order?.pack_code || order?.plan_code || planCode}</h2>
        <p className={styles.summaryTerm}>{isCreditPack ? prepaidMessage(packCopy.pack.credits,{credits:new Intl.NumberFormat(lang).format(packCredits)}) : text.terms[displayTerm]}</p>
        {isCreditPack ? <p className={styles.summaryCredits}>{prepaidMessage(packCopy.pack.validity,{days:packValidDays})}</p> : (displayedPlan?.monthlyCredits > 0 || isUnlimited(displayedPlan?.monthlyCredits)) && <p className={styles.summaryCredits}>{prepaidMessage(text.monthlyCredits, { credits: isUnlimited(displayedPlan.monthlyCredits) ? copy.card.unlimited : new Intl.NumberFormat(lang).format(displayedPlan.monthlyCredits) })}</p>}
        <div className={styles.total}><span>{order?.status === 'paid' ? text.orderTotal : text.due}</span><strong>{amountLabel}</strong></div>
        {(!order || (waiting && order.status !== 'paid')) && <p className={styles.summaryPolicy}>{isCreditPack ? prepaidMessage(packCopy.purchase.policy,{days:packValidDays}) : text.singlePayment}</p>}
      </aside>
      <div className={styles.payment}>
        {expired && <p className={styles.error} role="alert">{text.expired}</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}
        {!order ? <>
          <h3>{text.method}</h3>
          <div className={styles.methods} role="group" aria-label={text.method}>
            {channels.map((method) => <button className={`${styles.method} ${effectiveChannel === method ? styles.methodSelected : ''}`} type="button" key={method} aria-label={method === 'wechat_native' ? text.wechat : text.alipay} aria-pressed={effectiveChannel === method} disabled={busy || expired || unconfirmedIntent} onClick={() => setChannel(method)}>
              <span><strong>{method === 'wechat_native' ? text.wechat : text.alipay}</strong><small>{method === 'wechat_native' ? <><span className={styles.desktopOnly}>{text.wechatHint}</span><span className={styles.mobileOnly}>{text.wechatMobileHint}</span></> : text.alipayHint}</small></span><span className={styles.radio} aria-hidden="true" />
            </button>)}
          </div>
          {otherPlan && <p className={styles.notice}>{text.different}</p>}
          <button className={styles.primary} type="button" disabled={busy || expired || !billingEnabled || stripeActive || otherPlan || !price} onClick={purchase}>{busy ? text.busy : paidPlanCode ? text.renew : text.confirm}</button>
        </> : <>
          <div className={`${styles.paymentState} ${state === 'activated' ? styles.success : ''}`} role="status" aria-live="polite">
            {state === 'activated' && <img src="/auth/icons/check.svg" width="28" height="28" alt="" />}
            {state === 'review' && <img src="/auth/icons/alert-circle.svg" width="28" height="28" alt="" />}
            <h3>{state === 'waiting' ? (!order.pay_url ? text.creating : actualChannel === 'wechat_native' ? text.scanTitle : text.alipayTitle) : text[state]}</h3>
            {state !== 'waiting' && <p>{stateDescription}</p>}
            {state === 'activated' && endLabel && <p className={styles.expiry}>{text.validUntil} {endLabel}</p>}
          </div>
          {!expired && waiting && order.status === 'pending' && order.pay_url && (order.action === 'qr_code'
            ? <figure className={styles.qr}><QRCodeSVG value={order.pay_url} size={224} marginSize={4} level="M" title={text.scanTitle} /><figcaption><span className={styles.desktopOnly}>{text.scan}</span><span className={styles.mobileOnly}>{text.wechatMobileHint}</span></figcaption></figure>
            : <div className={styles.alipay}><p>{text.alipayDescription}</p><a className={styles.primary} href={order.pay_url} target="_blank" rel="noopener noreferrer">{text.open}</a></div>)}
          {waiting && <>
            {pollPaused && <p className={styles.paymentPolicy}>{text.pollPaused}</p>}
            <div className={styles.actions}><button className={styles.secondary} type="button" disabled={busy || expired} onClick={checkPayment}>{order.status === 'paid' ? text.checkActivation : text.retry}</button>
              {order.status !== 'paid' && <button className={styles.textButton} type="button" disabled={busy || expired} onClick={() => run(async (signal) => { const next = await closeOrder(token, order.id, { signal }); if (!signal.aborted) acceptOrder(next) })}>{text.cancel}</button>}
            </div>
          </>}
          {!waiting && <div className={styles.resultActions}>
            {(state === 'activated' || reviewing) && <a className={styles.primary} href="typeflux://billing/return">{text.returnToApp}</a>}
            <button className={state === 'activated' || reviewing ? styles.textButton : styles.primary} type="button" onClick={() => { if (state === 'closed' || state === 'refunded') nextPurchase(); else setShowCheckout(false) }}>{isCreditPack ? packCopy.tabs.credits : text.back}</button>
          </div>}
          <details className={styles.orderDetails} open={reviewing}>
            <summary>{text.summary}</summary>
            <dl><div><dt>{text.order}</dt><dd><code>{order.id}</code></dd></div><div><dt>{text.paidWith}</dt><dd>{actualChannel === 'wechat_native' ? text.wechat : text.alipay}</dd></div></dl>
          </details>
        </>}
      </div>
    </CheckoutDialog>}
  </section>
}

function CheckoutDialog({ title, closeLabel, onClose, children }) {
  const content = useRef(null)
  const close = useRef(null)
  const dismiss = useRef(onClose)
  useEffect(() => { dismiss.current = onClose }, [onClose])
  useEffect(() => {
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    close.current?.focus()
    const keydown = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); dismiss.current(); return }
      if (event.key !== 'Tab') return
      const controls = [...content.current.querySelectorAll('button:not(:disabled), a[href], details > summary')]
      const first = controls[0], last = controls[controls.length - 1]
      if (!controls.includes(document.activeElement)) { event.preventDefault(); first?.focus(); return }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); if (previousFocus?.isConnected) previousFocus.focus() }
  }, [])
  return createPortal(<div className={styles.backdrop} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="prepaid-checkout-title" ref={content}>
      <header className={styles.dialogHeader}><span id="prepaid-checkout-title">{title}</span><button type="button" className={styles.dismiss} aria-label={closeLabel} ref={close} onClick={onClose}>{closeLabel}</button></header>
      <div className={styles.checkoutBody}>{children}</div>
    </section>
  </div>, document.body)
}
