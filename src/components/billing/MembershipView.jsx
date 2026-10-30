import { useState } from 'react'
import { dictationHours, formatHours, isUnlimited } from '../billingInsights'
import {
  TERM_MONTHS,
  isPrepaidMethod,
  membershipBlock,
  membershipTerms,
  normalizeTerm,
  planPrice,
  planSavings,
  subscriptionState,
  termSavings,
} from './checkoutModel'
import { formatMessage, formatCredits, formatPrice } from './format'
import OrderPanel from './OrderPanel'
import PaymentMethods from './PaymentMethods'
import PlanEstimator from './PlanEstimator'
import styles from './Checkout.module.css'
import { subscriptionChangeCopy } from './subscriptionChangeCopy'

// The term of the account's current price when this method offers it,
// otherwise monthly, otherwise the shortest offered term.
function preferredTerm(terms, plans, method) {
  const current = plans
    .flatMap((plan) => plan.prices.filter((price) => price.current))
    .map((price) => terms.find((term) => planPrice({ prices: [price] }, method, term)))
    .find(Boolean)
  return current || (terms.includes('month') ? 'month' : terms[0] || '')
}

function preferredPlan(plans, subscription) {
  const { planCode } = subscriptionState(subscription)
  return plans.find((plan) => plan.code === planCode)
    || plans.find((plan) => plan.highlight)
    || plans[0]
}

export default function MembershipView({
  plans,
  subscription,
  copy,
  estimatorText,
  lang,
  method,
  methods,
  onMethodChange,
  billingEnabled,
  locked,
  stripe,
  prepaidBusy,
  onStripe,
  onPrepaid,
  onManage,
  manageBusy = false,
  changesEnabled = false,
  onChangePlan,
}) {
  const terms = membershipTerms(plans, method)
  const [requestedTerm, setRequestedTerm] = useState('')
  const term = terms.includes(requestedTerm) ? requestedTerm : preferredTerm(terms, plans, method)
  const [requestedPlan, setRequestedPlan] = useState('')
  const plan = plans.find((candidate) => candidate.code === requestedPlan) || preferredPlan(plans, subscription)
  const state = subscriptionState(subscription)

  if (!plan) return null

  const price = planPrice(plan, method, term)
  const prepaid = isPrepaidMethod(method)
  const block = !billingEnabled ? 'disabled' : membershipBlock({ subscription, plan, method, term, changesEnabled }) || (price ? '' : 'noOffer')
  const managing = block === 'stripeManage'
  const changing = block === 'stripeChange'
  const renewing = prepaid && state.prepaid && state.planCode === plan.code
  const stripeBusy = stripe.busyKey.startsWith('plan:')
  const busy = stripeBusy || prepaidBusy || manageBusy
  const total = price ? formatPrice(price.priceCents, price.currency, lang) : ''

  const actionLabel = changing ? subscriptionChangeCopy(lang).review : managing
    ? manageBusy ? copy.order.opening : copy.status.manage
    : stripeBusy
      ? copy.order.opening
      : prepaidBusy
        ? copy.order.creating
        : !prepaid
          ? formatMessage(copy.order.payStripe, { price: total })
          : formatMessage(renewing ? copy.order.renew : copy.order.pay, { price: total })

  const pay = () => {
    if (locked || busy) return
    if (changing) { onChangePlan?.(plan.code, price.interval); return }
    if (managing) { onManage(); return }
    if (block || !price) return
    if (prepaid) onPrepaid({ plan_code: plan.code, billing_interval: term, channel: method })
    else onStripe(plan.code, price.interval)
  }

  const choosePlan = (code) => {
    setRequestedPlan(code)
    document.getElementById(`plan-${code}`)?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }

  const note = managing
    ? ''
    : !price
      ? ''
      : prepaid
        ? renewing ? formatMessage(copy.order.prepaidExtend, { term: copy.termLength[term] }) : copy.order.prepaidOnce
        : copy.order.stripeRenews[term] || ''

  return (
    <div className={styles.layout}>
      <div className={styles.catalog}>
        <div className={styles.catalogHeader}>
          <h2>{copy.plans.heading}</h2>
          {terms.length > 1 && (
            <div className={styles.segmented} role="group" aria-label={copy.terms.label}>
              {terms.map((candidate) => {
                const saving = termSavings(plans, method, candidate)
                return (
                  <button
                    key={candidate}
                    type="button"
                    aria-pressed={term === candidate}
                    disabled={busy}
                    onClick={() => setRequestedTerm(candidate)}
                  >
                    {copy.terms[candidate]}
                    {saving > 0 && <span className={styles.segmentSave}>-{saving}%</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.planGrid} role="radiogroup" aria-label={copy.plans.heading}>
          {plans.map((candidate) => (
            <PlanOption
              key={candidate.code}
              plan={candidate}
              copy={copy}
              lang={lang}
              method={method}
              term={term}
              selected={candidate.code === plan.code}
              current={(state.planCode ? state.planCode === candidate.code : candidate.currentPlan) && (!changesEnabled || method !== 'stripe' || normalizeTerm(subscription?.billing_interval) === term)}
              disabled={busy}
              onSelect={() => setRequestedPlan(candidate.code)}
            />
          ))}
        </div>
        <p className={styles.footnote}>{copy.plans.refreshNote}</p>

        {estimatorText && (
          <details className={styles.help}>
            <summary>{estimatorText.helpTitle}</summary>
            <PlanEstimator text={estimatorText} lang={lang} plans={plans} onChoose={choosePlan} />
          </details>
        )}
      </div>

      <OrderPanel
        copy={changing ? { ...copy, order: { ...copy.order, total: subscriptionChangeCopy(lang).renewalPrice } } : copy}
        title={`${plan.name || plan.code} · ${copy.termLength[term] || ''}`}
        detail={isUnlimited(plan.monthlyCredits)
          ? copy.order.planUnlimited
          : plan.monthlyCredits > 0 ? formatMessage(copy.order.planDetail, { credits: formatCredits(plan.monthlyCredits, lang) }) : ''}
        methods={(
          <PaymentMethods
            name="membership-payment-method"
            methods={methods}
            value={method}
            copy={copy}
            disabled={busy || locked}
            onChange={onMethodChange}
            priceFor={(candidate) => {
              const offer = planPrice(plan, candidate, term)
              return offer ? formatPrice(offer.priceCents, offer.currency, lang) : ''
            }}
          />
        )}
        total={total}
        note={note}
        notice={block && block !== 'noOffer' && !changing ? copy.order.blocked[block] : ''}
        error={!prepaid && stripe.error ? copy.order.stripeErrors[stripe.error] : ''}
        action={{ label: actionLabel, busy, disabled: (Boolean(block) && !managing && !changing) || locked || busy, onClick: pay }}
      />
    </div>
  )
}

function PlanOption({ plan, copy, lang, method, term, selected, current, disabled, onSelect }) {
  const price = planPrice(plan, method, term)
  const saving = planSavings(plan, method, term)
  const months = TERM_MONTHS[term] || 1
  const unlimited = isUnlimited(plan.monthlyCredits)
  const hours = !unlimited && plan.monthlyCredits > 0 ? dictationHours(plan.monthlyCredits) : 0

  return (
    <label
      id={`plan-${plan.code}`}
      className={[styles.planOption, selected ? styles.optionSelected : '', plan.highlight ? styles.planHighlight : ''].filter(Boolean).join(' ')}
    >
      <input type="radio" name="membership-plan" value={plan.code} checked={selected} disabled={disabled} onChange={onSelect} />
      <span className={styles.optionTop}>
        <span className={styles.radioDot} aria-hidden="true" />
        <strong className={styles.planName}>{plan.name || plan.code}</strong>
        {current && <span className={styles.badgeCurrent}>{copy.plans.current}</span>}
        {!current && plan.highlight && <span className={styles.badgePopular}>{copy.plans.popular}</span>}
      </span>
      {plan.tagline && <span className={styles.planTagline}>{plan.tagline}</span>}

      <span className={styles.planPrice}>
        {price ? (
          <>
            <span className={styles.amount}>{formatPrice(price.priceCents, price.currency, lang)}</span>
            <span className={styles.per}>{copy.per[term]}</span>
          </>
        ) : <span className={styles.unavailable}>{copy.plans.notOffered}</span>}
      </span>
      <span className={styles.planPriceNote}>
        {price && months > 1 && <span>{formatMessage(copy.plans.perMonth, { price: formatPrice(Math.round(price.priceCents / months), price.currency, lang) })}</span>}
        {price && saving > 0 && <span className={styles.badgeSave}>{formatMessage(copy.plans.save, { percent: saving })}</span>}
      </span>

      <span className={styles.allowance}>
        <strong>
          {unlimited ? copy.plans.unlimited : hours > 0 ? formatMessage(copy.plans.dictation, { hours: formatHours(hours, lang) }) : ''}
          {hours > 0 && <small>{copy.plans.dictationUnit}</small>}
        </strong>
        {hours > 0 && <span>{formatMessage(copy.plans.credits, { credits: formatCredits(plan.monthlyCredits, lang) })}</span>}
      </span>

      {plan.features?.length > 0 && (
        <ul className={styles.features}>
          {plan.features.map((feature, index) => (
            <li key={`${plan.code}:${index}`}>
              <svg viewBox="0 0 18 18" width="16" height="16" fill="none" aria-hidden="true"><path d="m3.75 9 3.5 3.5 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </label>
  )
}
