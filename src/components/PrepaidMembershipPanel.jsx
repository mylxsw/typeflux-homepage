import { useEffect, useRef, useState } from 'react'
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
    return item && typeof item.request_id === 'string' && typeof item.plan_code === 'string'
      && ['month', 'quarter', 'year'].includes(item.billing_interval)
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
  token, plans, subscription, lang = 'en', billingEnabled = true,
  createOrder = createPrepaidOrder, getOrder = fetchPrepaidOrder, listOrders = fetchPrepaidOrders,
  closeOrder = closePrepaidOrder, manage = openBillingManagement,
  pollInterval = 2000, maxPolls = 90,
}) {
  const zh = lang.startsWith('zh')
  const text = zh ? {
    title: '按期购买会员', intro: '一次性付款，不自动续费。季付和年付的套餐额度仍每月刷新。',
    plan: '套餐', interval: '购买期限', month: '一个月', quarter: '三个月', year: '一年', channel: '支付方式',
    alipay: '支付宝', wechat: '微信支付', buy: '确认并付款', renew: '续购并付款', busy: '正在处理…',
    waiting: '正在确认支付和开通结果，请勿重复付款。', paid: '会员权益已开通', review: '收款或退款正在核对，请联系支持。',
    closed: '订单已关闭', refunded: '退款已登记', retry: '继续查询', cancel: '关闭待支付订单', next: '发起下一笔购买',
    scan: '请使用微信扫码付款', open: '打开支付宝付款', failed: '暂时无法确认结果，请重试同一订单。',
    expired: '页面授权已过期，请从 Typeflux 重新进入以恢复订单。', stripe: '你当前有 Stripe 订阅。请先取消自动续费，当前权益到期后再改用按期购买。',
    different: '当前套餐有效期内仅支持同套餐续购；更换套餐请等待到期。', manage: '管理现有订阅', until: '有效至', amount: '本次付款', order: '订单',
  } : {
    title: 'Prepaid membership', intro: 'One payment. No automatic renewal. Quarterly and annual memberships still refresh plan credits monthly.',
    plan: 'Plan', interval: 'Membership term', month: 'One month', quarter: 'Three months', year: 'One year', channel: 'Payment method',
    alipay: 'Alipay', wechat: 'WeChat Pay', buy: 'Confirm and pay', renew: 'Renew and pay', busy: 'Processing…',
    waiting: 'Confirming payment and membership. Please do not pay twice.', paid: 'Membership activated', review: 'Your payment or refund needs review. Please contact support.',
    closed: 'Order closed', refunded: 'Refund recorded', retry: 'Check again', cancel: 'Close unpaid order', next: 'Start another purchase',
    scan: 'Scan with WeChat to pay', open: 'Open Alipay to pay', failed: 'The result is not available yet. Retry the same order.',
    expired: 'This page authorization has expired. Reopen billing from Typeflux to recover your order.', stripe: 'You have a Stripe subscription. Cancel automatic renewal first, then wait for your current membership to end before switching to prepaid.',
    different: 'You can extend the same plan while it is active. Wait until expiry to change plans.', manage: 'Manage existing subscription', until: 'Valid until', amount: 'Payment amount', order: 'Order',
  }
  const available = plans.filter((plan) => plan.prices.some((price) => price.provider === 'aidea'))
  const [intent, setIntent] = useState(storedIntent)
  const [planCode, setPlanCode] = useState(() => intent?.plan_code || available[0]?.code || '')
  const [interval, setInterval] = useState(() => intent?.billing_interval || 'month')
  const [channel, setChannel] = useState(() => intent?.channel || 'wechat_native')
  const [order, setOrder] = useState(null)
  const [activatedPlan, setActivatedPlan] = useState('')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [expired, setExpired] = useState(false)
  const [pollGeneration, setPollGeneration] = useState(0)
  const operation = useRef(null)
  const currentPlan = available.find((plan) => plan.code === planCode)
  const prices = currentPlan?.prices.filter((price) => price.provider === 'aidea') || []
  const price = prices.find((item) => item.interval === interval) || prices[0]
  const effectiveInterval = price?.interval || interval
  const stripeActive = subscription?.paid && subscription?.active && subscription?.billing_mode !== 'prepaid'
  const paidPlanCode = subscription?.paid && subscription?.active && subscription?.billing_mode === 'prepaid' ? subscription.plan_code : activatedPlan
  const otherPlan = Boolean(paidPlanCode && paidPlanCode !== planCode)

  function acceptOrder(next) {
    setOrder(next)
    if (next.fulfillment === 'granted') setActivatedPlan(next.plan_code)
    setPlanCode(next.plan_code)
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
      setBusy(true); setOrder(null); setExpired(false)
      try {
        const saved = storedIntent()
        if (saved) {
          const next = await getOrder(token, saved.order_id || saved.request_id, { signal })
          if (!signal.aborted) acceptOrder(next)
        } else {
          const orders = await listOrders(token, { signal })
          const pending = orders.find(isWaiting)
          if (pending) {
            const next = await getOrder(token, pending.id, { signal })
            if (!signal.aborted) {
              const recovered = { request_id: next.id, order_id: next.id, plan_code: next.plan_code, billing_interval: next.billing_interval, channel: next.channel }
              saveIntent(recovered); setIntent(recovered); acceptOrder(next)
            }
          }
        }
      } catch (failure) {
        if (signal.aborted) return
        if (failure?.status === 404) { saveIntent(null); setIntent(null) }
        else fail(failure)
      } finally { if (!signal.aborted) setBusy(false) }
    }
    restore()
    return () => { controller.abort(); operation.current?.abort() }
    // A new token starts a new account-bound recovery operation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, getOrder, listOrders])

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
        if (isWaiting(next) && ++count < maxPolls) timer = setTimeout(poll, pollInterval)
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
    if (!billingEnabled || !price || stripeActive || otherPlan) return
    run(async (signal) => {
      const same = intent?.plan_code === planCode && intent?.billing_interval === effectiveInterval && intent?.channel === channel
      const nextIntent = same ? intent : { request_id: createRequestId(), plan_code: planCode, billing_interval: effectiveInterval, channel }
      // Save before the request: a lost response must keep the same purchase ID.
      saveIntent(nextIntent); setIntent(nextIntent)
      const next = await createOrder(token, nextIntent, { signal })
      if (signal.aborted) return
      const saved = { ...nextIntent, order_id: next.id }; saveIntent(saved); setIntent(saved); acceptOrder(next)
    })
  }

  const status = order?.fulfillment === 'granted' ? text.paid
    : order?.fulfillment === 'refunded' ? text.refunded
      : order?.fulfillment === 'review' ? text.review : order?.status === 'closed' ? text.closed : text.waiting
  const amount = order?.amount_fen ?? price?.priceCents ?? 0
  const amountLabel = new Intl.NumberFormat(lang, { style: 'currency', currency: 'CNY' }).format(amount / 100)
  const end = order?.period_end && new Date(order.period_end)

  return <section className={styles.panel} aria-label={text.title}>
    <h2>{text.title}</h2><p>{text.intro}</p>
    {(!billingEnabled || !available.length) && <p role="status">{zh ? '当前暂未开放新的预付购买，已购权益不受影响。' : 'New prepaid purchases are unavailable. Existing membership remains valid.'}</p>}
    {subscription?.billing_mode === 'prepaid' && subscription?.current_period_end && <p>{text.until}: {new Date(subscription.current_period_end).toLocaleDateString(lang)}</p>}
    {stripeActive && <div className={styles.notice}><p>{text.stripe}</p><button type="button" disabled={busy || expired} onClick={() => run(async (signal) => { const url = await manage(token, { signal }); if (!signal.aborted) window.location.assign(url) })}>{text.manage}</button></div>}
    {expired && <p role="alert">{text.expired}</p>}
    {error && <p role="alert">{error}</p>}
    {!order && <>
      <div className={styles.fields}>
        <label>{text.plan}<select value={planCode} disabled={busy || expired} onChange={(event) => setPlanCode(event.target.value)}>{available.map((plan) => <option key={plan.code} value={plan.code}>{plan.name}</option>)}</select></label>
        <label>{text.interval}<select value={effectiveInterval} disabled={busy || expired} onChange={(event) => setInterval(event.target.value)}>{prices.map((item) => <option key={item.interval} value={item.interval}>{text[item.interval]}</option>)}</select></label>
        <label>{text.channel}<select value={channel} disabled={busy || expired} onChange={(event) => setChannel(event.target.value)}><option value="wechat_native">{text.wechat}</option><option value="alipay_page">{text.alipay}</option></select></label>
      </div>
      {otherPlan && <p>{text.different}</p>}
      <p>{text.amount}: <strong>{amountLabel}</strong></p>
      <button className="btn btn-primary" type="button" disabled={busy || expired || !billingEnabled || stripeActive || otherPlan || !price} onClick={purchase}>{busy ? text.busy : (subscription?.billing_mode === 'prepaid' || activatedPlan) ? text.renew : text.buy}</button>
    </>}
    {order && <div className={styles.receipt}>
      <p role="status">{status}</p><p>{text.amount}: <strong>{amountLabel}</strong></p><small>{text.order}: {order.id}</small>
      {end && !Number.isNaN(end.getTime()) && <p>{text.until}: {end.toLocaleDateString(lang)}</p>}
      {!expired && order.status === 'pending' && order.pay_url && (order.action === 'qr_code'
        ? <figure><QRCodeSVG value={order.pay_url} size={224} marginSize={4} level="M" title={text.scan} /><figcaption>{text.scan}</figcaption></figure>
        : <p><a className="btn btn-primary" href={order.pay_url} target="_blank" rel="noopener noreferrer">{text.open}</a></p>)}
      {isWaiting(order) && <div className={styles.actions}>
        <button type="button" disabled={busy || expired} onClick={() => run(async (signal) => { const next = await getOrder(token, order.id, { signal }); if (!signal.aborted) { acceptOrder(next); setPollGeneration((value) => value + 1) } })}>{text.retry}</button>
        {order.status !== 'paid' && <button type="button" disabled={busy || expired} onClick={() => run(async (signal) => { const next = await closeOrder(token, order.id, { signal }); if (!signal.aborted) acceptOrder(next) })}>{text.cancel}</button>}
      </div>}
      {!isWaiting(order) && order.fulfillment !== 'review' && <button type="button" disabled={busy || expired} onClick={() => { saveIntent(null); setIntent(null); setOrder(null) }}>{text.next}</button>}
    </div>}
  </section>
}
