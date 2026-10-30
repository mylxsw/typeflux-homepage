import { Dialog } from './PaymentDialog'
import { formatCredits, formatDate, formatMessage, formatPrice } from './format'
import { subscriptionChangeCopy } from './subscriptionChangeCopy'
import styles from './Checkout.module.css'

export function SubscriptionChangeStatus({ flow, lang, plans = [] }) {
  const c = subscriptionChangeCopy(lang)
  const order = flow.order
  return <>
    {order && <div className={styles.banner} role="status">
      <p>{c.states[order.status] || c.loading}</p>
      {order.status === 'scheduled' && <>
        <p>{formatMessage(c.scheduledDetail, { plan: plans.find((p) => p.code === order.plan_code)?.name || order.plan_code, date: formatDate(order.effective_at, lang) })}</p>
        <p>{c.scheduleNote}</p>
      </>}
      {order.status === 'open' && <button className={styles.secondaryButton} type="button" disabled={flow.busy} onClick={flow.resume}>{c.resume}</button>}
      {['open', 'scheduled'].includes(order.status) && <button className={styles.secondaryButton} type="button" disabled={flow.busy} onClick={flow.cancel}>{c.cancel}</button>}
    </div>}
    {flow.error && <p className={styles.bannerError} role="alert">{c.error}</p>}
  </>
}

export function SubscriptionChangeDialog({ flow, lang, plans = [] }) {
  const c = subscriptionChangeCopy(lang)
  const quote = flow.quote
  if (!quote) return null
  const details = quote.kind === 'upgrade'
    ? formatMessage(c.upgradeDetail, { credits: formatCredits(quote.credits_delta, lang), date: formatDate(quote.period_end, lang) })
    : formatMessage(c.scheduledDetail, { plan: plans.find((p) => p.code === quote.plan_code)?.name || quote.plan_code, date: formatDate(quote.effective_at, lang) })
  return <Dialog label={c.title} closeLabel={c.back} onClose={flow.dismiss}>
      <h2 id="subscription-change-title">{c.title}</h2>
      <p>{details}</p>
      {flow.error && <p role="alert">{c.error}</p>}
      <div className={styles.payActions}>
      <button className={styles.secondaryButton} type="button" disabled={flow.busy} onClick={flow.dismiss}>{c.back}</button>
      <button className={styles.payButton} type="button" disabled={flow.busy} onClick={flow.confirm}>
        {flow.busy ? c.loading : quote.kind === 'upgrade' ? formatMessage(c.upgrade, { price: formatPrice(quote.amount_minor, quote.currency, lang) }) : c.scheduled}
      </button>
      </div>
  </Dialog>
}
