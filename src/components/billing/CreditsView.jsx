import { useCallback, useEffect, useState } from 'react'
import { fetchCheckoutSessionStatus, fetchCreditGrants } from '../../lib/billingApi'
import { RETURN_TO_APP_URL, isPrepaidMethod, packPrice, packValue } from './checkoutModel'
import { formatDate, formatMessage, formatCredits, formatPrice } from './format'
import OrderPanel from './OrderPanel'
import PaymentMethods from './PaymentMethods'
import { readPackSelection, writePackSelection } from './useStripeCheckout'
import styles from './Checkout.module.css'

const DEFAULT_VALID_DAYS = 365
const HISTORY_PAGE_SIZE = 20

export default function CreditsView({
  token,
  packs,
  credits,
  copy,
  packCopy,
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
  checkout = { status: '', sessionId: '' },
  historyKey = 0,
  onCreditsChanged,
  onExpired,
  loadGrants = fetchCreditGrants,
  loadStatus = fetchCheckoutSessionStatus,
  pollIntervalMs = 2000,
  maxPollAttempts = 30,
  storage,
}) {
  const [requestedCode, setRequestedCode] = useState(() => (checkout.status ? readPackSelection(storage) : ''))
  const [agreed, setAgreed] = useState(false)
  const offered = packs.filter((pack) => packPrice(pack, method))
  const pack = offered.find((candidate) => candidate.code === requestedCode)
    || offered.find((candidate) => candidate.highlight)
    || offered[0]
    || null
  const price = pack ? packPrice(pack, method) : null
  const value = packValue(packs, method)
  const prepaid = isPrepaidMethod(method)
  const stripeBusy = stripe.busyKey.startsWith('pack:')
  const busy = stripeBusy || prepaidBusy
  const validDays = pack?.validDays || DEFAULT_VALID_DAYS
  const total = price ? formatPrice(price.priceCents, price.currency, lang) : ''
  const block = !billingEnabled ? 'disabled' : price ? '' : 'noOffer'

  const pay = () => {
    if (block || locked || busy || !agreed || !pack) return
    if (prepaid) onPrepaid({ pack_code: pack.code, channel: method })
    else onStripe(pack.code)
  }

  const actionLabel = stripeBusy
    ? copy.order.opening
    : prepaidBusy
      ? copy.order.creating
      : formatMessage(prepaid ? copy.order.pay : copy.order.payStripe, { price: total })

  return (
    <>
      {checkout.status === 'cancel' && <p className={styles.banner} role="status">{copy.order.canceled}</p>}
      <StripeReturn
        token={token}
        checkout={checkout}
        packCopy={packCopy}
        lang={lang}
        loadGrants={loadGrants}
        loadStatus={loadStatus}
        pollIntervalMs={pollIntervalMs}
        maxPollAttempts={maxPollAttempts}
        storage={storage}
        onGranted={onCreditsChanged}
      />
      {token && (
        <div className={styles.layout}>
          <div className={styles.catalog}>
            <Balance credits={credits} copy={copy} lang={lang} />
            <div className={styles.catalogHeader}>
              <h2>{copy.packs.heading}</h2>
            </div>
            {packs.length === 0 ? (
              <p className={styles.emptyNote}>{packCopy.emptySummary}</p>
            ) : (
              <div className={styles.packGrid} role="radiogroup" aria-label={copy.packs.heading}>
                {packs.map((candidate) => (
                  <PackOption
                    key={candidate.code}
                    pack={candidate}
                    price={packPrice(candidate, method)}
                    bonus={value.bonus[candidate.code] || 0}
                    bestValue={value.bestValue === candidate.code}
                    copy={copy}
                    lang={lang}
                    selected={pack?.code === candidate.code}
                    disabled={busy}
                    onSelect={() => setRequestedCode(candidate.code)}
                  />
                ))}
              </div>
            )}
            <PurchaseHistory token={token} packs={packs} text={packCopy.history} lang={lang} loadGrants={loadGrants} reloadKey={historyKey} onExpired={onExpired} />
          </div>

          {pack && (
            <OrderPanel
              copy={copy}
              title={pack.name || pack.code}
              detail={formatMessage(copy.order.packDetail, { credits: formatCredits(pack.credits, lang), days: validDays })}
              methods={(
                <PaymentMethods
                  name="credit-payment-method"
                  methods={methods}
                  value={method}
                  copy={copy}
                  disabled={busy || locked}
                  onChange={onMethodChange}
                  priceFor={(candidate) => {
                    const offer = packPrice(pack, candidate)
                    return offer ? formatPrice(offer.priceCents, offer.currency, lang) : ''
                  }}
                />
              )}
              total={total}
              note={copy.order.creditsOnce}
              consent={{
                checked: agreed,
                disabled: busy,
                onChange: setAgreed,
                label: formatMessage(copy.order.agree, { days: validDays }),
              }}
              notice={block && block !== 'noOffer' ? copy.order.blocked[block] : ''}
              error={!prepaid && stripe.error ? copy.order.stripeErrors[stripe.error] : ''}
              action={{ label: actionLabel, busy, disabled: Boolean(block) || locked || busy || !agreed, onClick: pay }}
            />
          )}
        </div>
      )}
    </>
  )
}

function Balance({ credits, copy, lang }) {
  if (!credits) return null
  const unlimited = credits.unlimited || credits.limit < 0
  const monthly = Math.max(0, credits.remaining)
  const addon = Math.max(0, credits.addon.remaining)
  const nextExpiry = credits.addon.nextExpiry
  return (
    <section className={styles.balance} aria-label={copy.packs.balance}>
      <div>
        <p className={styles.balanceLabel}>{copy.packs.balance}</p>
        <p className={styles.balanceTotal}>{unlimited ? copy.packs.unlimited : formatCredits(credits.totalRemaining ?? monthly + addon, lang)}</p>
      </div>
      <dl className={styles.balanceParts}>
        <div><dt>{copy.packs.monthly}</dt><dd>{unlimited ? copy.packs.unlimited : formatCredits(monthly, lang)}</dd></div>
        <div><dt>{copy.packs.addon}</dt><dd>{formatCredits(addon, lang)}</dd></div>
        {credits.reserved > 0 && <div><dt>{copy.packs.reserved}</dt><dd>{formatCredits(credits.reserved, lang)}</dd></div>}
      </dl>
      <p className={styles.balanceNote}>
        {nextExpiry
          ? formatMessage(copy.packs.nextExpiry, { credits: formatCredits(nextExpiry.credits, lang), date: formatDate(nextExpiry.expiresAt, lang) })
          : copy.packs.usageOrder}
      </p>
    </section>
  )
}

function PackOption({ pack, price, bonus, bestValue, copy, lang, selected, disabled, onSelect }) {
  const unavailable = !price
  return (
    <label className={[styles.packOption, selected ? styles.optionSelected : '', unavailable ? styles.optionUnavailable : ''].filter(Boolean).join(' ')}>
      <input type="radio" name="credit-pack" value={pack.code} checked={selected} disabled={disabled || unavailable} onChange={onSelect} />
      <span className={styles.optionTop}>
        <span className={styles.radioDot} aria-hidden="true" />
        <strong className={styles.packName}>{pack.name || pack.code}</strong>
        {pack.highlight
          ? <span className={styles.badgePopular}>{copy.packs.recommended}</span>
          : bestValue && <span className={styles.badgePopular}>{copy.packs.bestValue}</span>}
      </span>
      <span className={styles.packCredits}>{formatMessage(copy.packs.credits, { credits: formatCredits(pack.credits, lang) })}</span>
      <span className={styles.packMeta}>
        {formatMessage(copy.packs.validity, { days: pack.validDays || DEFAULT_VALID_DAYS })}
        {bonus > 0 && <span className={styles.badgeSave}>{formatMessage(copy.packs.bonus, { percent: bonus })}</span>}
      </span>
      <span className={styles.packPriceRow}>
        {price ? (
          <>
            <span className={styles.packPrice}>{formatPrice(price.priceCents, price.currency, lang)}</span>
            {pack.credits > 0 && (
              <span className={styles.packUnit}>
                {formatMessage(copy.packs.perHundred, {
                  price: formatPrice(Math.round(price.priceCents / pack.credits * 100 * 100) / 100, price.currency, lang),
                })}
              </span>
            )}
          </>
        ) : <span className={styles.unavailable}>{copy.packs.notOffered}</span>}
      </span>
    </label>
  )
}

// Confirms a credit pack paid through Stripe after Stripe returns here.
function StripeReturn({ token, checkout, packCopy, lang, loadGrants, loadStatus, pollIntervalMs, maxPollAttempts, storage, onGranted }) {
  const [result, setResult] = useState(() => {
    if (checkout.status !== 'success') return null
    if (!token) return { status: 'unverified', credits: 0 }
    return checkout.sessionId ? { status: 'pending', credits: 0 } : null
  })
  const [pollKey, setPollKey] = useState(0)

  useEffect(() => {
    if (!token || checkout.status !== 'success' || !checkout.sessionId) return undefined
    const controller = new AbortController()
    let timer
    let attempts = 0
    setResult({ status: 'pending', credits: 0 })

    const scheduleNext = () => {
      attempts += 1
      if (attempts >= maxPollAttempts) {
        setResult({ status: 'delayed', credits: 0 })
        return
      }
      timer = setTimeout(poll, pollIntervalMs)
    }
    const poll = async () => {
      try {
        const { status } = await loadStatus(token, checkout.sessionId, { signal: controller.signal })
        if (status === 'granted') {
          let granted = 0
          try {
            const page = await loadGrants(token, { limit: HISTORY_PAGE_SIZE, signal: controller.signal })
            granted = page.items.find((grant) => grant.sessionId === checkout.sessionId)?.credits || 0
          } catch {
            // The grant is confirmed; the amount is a detail the summary can omit.
          }
          if (controller.signal.aborted) return
          writePackSelection('', storage)
          setResult({ status: 'granted', credits: granted })
          onGranted?.()
          return
        }
        if (status === 'failed') {
          setResult({ status: 'failed', credits: 0 })
          return
        }
        scheduleNext()
      } catch (error) {
        if (error?.name === 'AbortError' || controller.signal.aborted) return
        if (error?.kind === 'expired_token') {
          setResult({ status: 'unverified', credits: 0 })
          return
        }
        scheduleNext()
      }
    }
    poll()
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
    // onGranted only refreshes balances; it must not restart confirmation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout.sessionId, checkout.status, loadGrants, loadStatus, maxPollAttempts, pollIntervalMs, pollKey, storage, token])

  if (!result) return null
  const text = packCopy.result
  const [title, summary] = {
    pending: [text.pendingTitle, text.pendingSummary],
    granted: [text.grantedTitle, result.credits > 0
      ? formatMessage(text.grantedSummary, { credits: formatCredits(result.credits, lang) })
      : text.grantedSummaryUnknown],
    failed: [text.failedTitle, text.failedSummary],
    delayed: [text.delayedTitle, text.delayedSummary],
    unverified: [text.unverifiedTitle, text.unverifiedSummary],
  }[result.status]

  return (
    <section className={`${styles.returnCard} ${styles[`return_${result.status}`] || ''}`} role="status" aria-live="polite">
      {result.status === 'pending' && <span className={styles.spinner} aria-hidden="true" />}
      <div>
        <h2>{title}</h2>
        <p>{summary}</p>
      </div>
      {result.status !== 'pending' && result.status !== 'failed' && (
        <div className={styles.returnActions}>
          <a className={styles.payButton} href={RETURN_TO_APP_URL}>{text.returnToApp}</a>
          {result.status === 'delayed' && (
            <button className={styles.secondaryButton} type="button" onClick={() => setPollKey((key) => key + 1)}>{text.checkAgain}</button>
          )}
        </div>
      )}
    </section>
  )
}

function PurchaseHistory({ token, packs, text, lang, loadGrants, reloadKey, onExpired }) {
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState({ status: 'idle', items: [], nextCursor: '', loadingMore: false, loadedAt: 0 })

  useEffect(() => {
    if (!token || !open) return undefined
    const controller = new AbortController()
    loadGrants(token, { limit: HISTORY_PAGE_SIZE, signal: controller.signal })
      .then((page) => setHistory({ status: 'ready', items: page.items, nextCursor: page.nextCursor, loadingMore: false, loadedAt: Date.now() }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.kind === 'expired_token') {
          onExpired?.()
          return
        }
        setHistory({ status: 'error', items: [], nextCursor: '', loadingMore: false, loadedAt: 0 })
      })
    return () => controller.abort()
  }, [loadGrants, onExpired, open, reloadKey, token])

  const toggle = () => {
    if (!open) setHistory({ status: 'loading', items: [], nextCursor: '', loadingMore: false, loadedAt: 0 })
    setOpen(!open)
  }

  const loadMore = useCallback(async () => {
    if (!history.nextCursor || history.loadingMore) return
    setHistory((current) => ({ ...current, loadingMore: true }))
    try {
      const page = await loadGrants(token, { cursor: history.nextCursor, limit: HISTORY_PAGE_SIZE })
      setHistory((current) => ({ ...current, items: [...current.items, ...page.items], nextCursor: page.nextCursor, loadingMore: false }))
    } catch (error) {
      if (error?.kind === 'expired_token') {
        onExpired?.()
        return
      }
      setHistory((current) => ({ ...current, status: 'error', loadingMore: false }))
    }
  }, [history.loadingMore, history.nextCursor, loadGrants, onExpired, token])

  return (
    <section className={styles.history}>
      <button className={styles.historyToggle} type="button" aria-expanded={open} aria-controls="credit-pack-history" onClick={toggle}>
        <span>{text.title}</span>
        <span className={styles.historyHint}>{open ? text.hide : text.show}</span>
      </button>
      {open && (
        <div id="credit-pack-history" className={styles.historyBody}>
          {history.status === 'loading' && <p className={styles.historyMessage}>{text.loading}</p>}
          {history.status === 'error' && <p className={styles.historyMessage} role="alert">{text.error}</p>}
          {history.status === 'ready' && history.items.length === 0 && <p className={styles.historyMessage}>{text.empty}</p>}
          {history.items.length > 0 && (
            <div className={styles.tableScroll}>
              <table className={styles.historyTable}>
                <thead>
                  <tr>
                    <th scope="col">{text.date}</th>
                    <th scope="col">{text.pack}</th>
                    <th scope="col">{text.credits}</th>
                    <th scope="col">{text.remaining}</th>
                    <th scope="col">{text.expires}</th>
                    <th scope="col">{text.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((grant) => {
                    const status = grant.status === 'active' && grant.expiresAt && Date.parse(grant.expiresAt) <= history.loadedAt ? 'expired' : grant.status
                    const name = grant.source === 'admin' || grant.packCode === 'manual'
                      ? text.manual
                      : packs.find((candidate) => candidate.code === grant.packCode)?.name || grant.packCode
                    return (
                      <tr key={grant.id}>
                        <td data-label={text.date}>{formatDate(grant.grantedAt, lang) || '—'}</td>
                        <td data-label={text.pack}>{name}</td>
                        <td data-label={text.credits}>{formatCredits(grant.credits, lang)}</td>
                        <td data-label={text.remaining}>{formatCredits(grant.remaining, lang)}</td>
                        <td data-label={text.expires}>{formatDate(grant.expiresAt, lang) || '—'}</td>
                        <td data-label={text.status}>
                          <span className={`${styles.grantStatus} ${styles[`grant_${status}`] || ''}`}>{text.statuses[status] || status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {history.nextCursor && history.status === 'ready' && (
            <button className={styles.secondaryButton} type="button" disabled={history.loadingMore} onClick={loadMore}>{text.loadMore}</button>
          )}
        </div>
      )}
    </section>
  )
}
