import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createCreditPackCheckoutSession,
  createRequestId,
  fetchCheckoutSessionStatus,
  fetchCreditGrants,
  fetchCreditPacks,
} from '../lib/billingApi'
import { creditPacksCopy, formatMessage } from './creditPacksCopy'
import styles from './CreditPacksPanel.module.css'

export const CREDIT_PACK_SELECTION_STORAGE_KEY = 'typeflux.creditPackSelection'
export const RETURN_TO_APP_URL = 'typeflux://billing/return'
const DEFAULT_VALID_DAYS = 365
const HISTORY_PAGE_SIZE = 20

export default function CreditPacksPanel({
  token,
  lang,
  checkout = { status: '', sessionId: '' },
  onExpired = () => {},
  onShowPlans,
  loadPacks = fetchCreditPacks,
  createCheckout = createCreditPackCheckoutSession,
  loadGrants = fetchCreditGrants,
  loadStatus = fetchCheckoutSessionStatus,
  redirect = (url) => window.location.assign(url),
  newRequestId = createRequestId,
  pollIntervalMs = 2000,
  maxPollAttempts = 30,
  storage,
}) {
  const copy = creditPacksCopy(lang)
  const [view, setView] = useState({ status: token ? 'loading' : 'idle', billingEnabled: false, packs: [], credits: null })
  const [reloadKey, setReloadKey] = useState(0)
  const [selectedCode, setSelectedCode] = useState(() => (
    checkout.status === 'cancel' || checkout.status === 'success' ? readSelection(storage) : ''
  ))
  const [agreed, setAgreed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  // The request ID of a purchase whose checkout call failed transiently. A retry
  // of the same pack reuses it so a lost response cannot create a second order.
  const pendingRequest = useRef(null)
  const [result, setResult] = useState(() => initialResult(checkout, token))
  const [pollKey, setPollKey] = useState(0)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState({ status: 'idle', items: [], nextCursor: '', loadingMore: false })
  const [historyKey, setHistoryKey] = useState(0)

  const handleExpired = useCallback(() => onExpired(), [onExpired])

  useEffect(() => {
    if (!token) return undefined

    const controller = new AbortController()
    setView((current) => (current.status === 'ready' ? current : { ...current, status: 'loading' }))
    loadPacks(token, { signal: controller.signal, lang })
      .then((data) => setView({ status: 'ready', ...data }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.kind === 'expired_token') {
          handleExpired()
          return
        }
        setView({ status: 'error', billingEnabled: false, packs: [], credits: null })
      })

    return () => controller.abort()
  }, [handleExpired, lang, loadPacks, reloadKey, token])

  // Leaving for Stripe and coming back with the browser's Back button restores
  // the page from the back/forward cache; release the in-flight purchase state.
  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) setBusy(false)
    }
    window.addEventListener('pageshow', handlePageShow)
    return () => window.removeEventListener('pageshow', handlePageShow)
  }, [])

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
          const credits = await grantedCredits(loadGrants, token, checkout.sessionId, controller.signal)
          if (controller.signal.aborted) return
          clearSelection(storage)
          setResult({ status: 'granted', credits })
          setReloadKey((key) => key + 1)
          setHistoryKey((key) => key + 1)
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
  }, [checkout.sessionId, checkout.status, loadGrants, loadStatus, maxPollAttempts, pollIntervalMs, pollKey, storage, token])

  useEffect(() => {
    if (!token || !historyOpen) return undefined

    const controller = new AbortController()
    setHistory({ status: 'loading', items: [], nextCursor: '', loadingMore: false })
    loadGrants(token, { limit: HISTORY_PAGE_SIZE, signal: controller.signal })
      .then((page) => setHistory({
        status: 'ready', items: page.items, nextCursor: page.nextCursor, loadingMore: false, loadedAt: Date.now(),
      }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.kind === 'expired_token') {
          handleExpired()
          return
        }
        setHistory({ status: 'error', items: [], nextCursor: '', loadingMore: false })
      })

    return () => controller.abort()
  }, [handleExpired, historyKey, historyOpen, loadGrants, token])

  const packs = useMemo(() => localizePacks(view.packs, lang, copy), [copy, lang, view.packs])
  const purchasable = view.billingEnabled ? packs.filter((pack) => pack.available) : []
  const selectedPack = purchasable.find((pack) => pack.code === selectedCode)
    || purchasable.find((pack) => pack.highlight)
    || purchasable[0]
    || null
  const validDays = selectedPack?.validDays || DEFAULT_VALID_DAYS

  const handlePurchase = useCallback(async () => {
    if (!token || busy || !agreed || !selectedPack) return

    const packCode = selectedPack.code
    const requestId = pendingRequest.current?.packCode === packCode
      ? pendingRequest.current.requestId
      : newRequestId()
    pendingRequest.current = { packCode, requestId }
    setBusy(true)
    setCheckoutError('')
    try {
      const session = await createCheckout(token, packCode, requestId)
      pendingRequest.current = null
      writeSelection(packCode, storage)
      redirect(session.url)
    } catch (error) {
      setBusy(false)
      if (error?.kind === 'expired_token') {
        pendingRequest.current = null
        handleExpired()
        return
      }
      // Keep the purchase identity while the server may still hold its intent.
      if (!isTransient(error) && error?.kind !== 'reconciliation_required') pendingRequest.current = null
      if (error?.kind === 'billing_disabled') {
        setView((current) => ({ ...current, billingEnabled: false }))
      }
      setCheckoutError(checkoutErrorKey(error))
    }
  }, [agreed, busy, createCheckout, handleExpired, newRequestId, redirect, selectedPack, storage, token])

  const handleLoadMore = useCallback(async () => {
    if (!history.nextCursor || history.loadingMore) return
    setHistory((current) => ({ ...current, loadingMore: true }))
    try {
      const page = await loadGrants(token, { cursor: history.nextCursor, limit: HISTORY_PAGE_SIZE })
      setHistory((current) => ({
        ...current,
        status: 'ready',
        items: [...current.items, ...page.items],
        nextCursor: page.nextCursor,
        loadingMore: false,
      }))
    } catch (error) {
      if (error?.kind === 'expired_token') {
        handleExpired()
        return
      }
      setHistory((current) => ({ ...current, status: 'error', loadingMore: false }))
    }
  }, [handleExpired, history.loadingMore, history.nextCursor, loadGrants, token])

  return (
    <div className={styles.panel}>
      {result && (
        <CheckoutResult
          result={result}
          copy={copy}
          lang={lang}
          onCheckAgain={() => setPollKey((key) => key + 1)}
        />
      )}

      {!token ? null : view.status === 'loading' ? (
        <StatusCard title={copy.loadingTitle} summary={copy.loadingSummary} busy />
      ) : view.status === 'error' ? (
        <StatusCard title={copy.errorTitle} summary={copy.errorSummary}>
          <button className="btn btn-primary" type="button" onClick={() => setReloadKey((key) => key + 1)}>
            {copy.retry}
          </button>
        </StatusCard>
      ) : view.status === 'ready' && (
        <>
          {checkout.status === 'cancel' && <div className={styles.notice} role="status">{copy.canceled}</div>}
          {!view.billingEnabled && <div className={styles.notice} role="status">{copy.billingUnavailable}</div>}

          <BalanceSummary credits={view.credits} copy={copy} lang={lang} />

          {packs.length === 0 ? (
            <StatusCard title={copy.emptyTitle} summary={copy.emptySummary} />
          ) : (
            <>
              <div className={styles.purchaseLayout}>
                <div className={styles.packGrid} role="radiogroup" aria-label={copy.tabs.credits}>
                  {packs.map((pack) => (
                    <PackCard
                      key={pack.code}
                      pack={pack}
                      copy={copy}
                      lang={lang}
                      selected={selectedPack?.code === pack.code}
                      disabled={busy || !view.billingEnabled || !pack.available}
                      onSelect={() => {
                        setSelectedCode(pack.code)
                        setCheckoutError('')
                      }}
                    />
                  ))}
                </div>

                <aside className={styles.purchase} aria-label={copy.summary.title}>
                  <h2 className={styles.summaryTitle}>{copy.summary.title}</h2>
                  {selectedPack && (
                    <dl className={styles.summaryLines}>
                      <div><dt>{copy.summary.pack}</dt><dd>{selectedPack.name}</dd></div>
                      <div><dt>{copy.summary.credits}</dt><dd>{formatNumber(selectedPack.credits, lang)}</dd></div>
                      <div>
                        <dt>{copy.summary.validity}</dt>
                        <dd>{formatMessage(copy.summary.validityValue, { days: validDays })}</dd>
                      </div>
                      {balanceAfter(view.credits, selectedPack) !== null && (
                        <div>
                          <dt>{copy.summary.after}</dt>
                          <dd>{formatNumber(balanceAfter(view.credits, selectedPack), lang)}</dd>
                        </div>
                      )}
                      <div className={styles.summaryTotal}>
                        <dt>{copy.summary.total}</dt>
                        <dd>{formatPrice(selectedPack.priceCents, selectedPack.currency, lang)}</dd>
                      </div>
                    </dl>
                  )}
                  <p className={styles.policy}>{formatMessage(copy.purchase.policy, { days: validDays })}</p>
                  <label className={styles.agreement}>
                    <input
                      type="checkbox"
                      checked={agreed}
                      disabled={busy}
                      onChange={(event) => setAgreed(event.target.checked)}
                    />
                    <span>{formatMessage(copy.purchase.agree, { days: validDays })}</span>
                  </label>
                  {checkoutError && <div className={styles.errorNotice} role="alert">{copy.errors[checkoutError]}</div>}
                  <button
                    className={`btn ${styles.buyButton}`}
                    type="button"
                    disabled={!agreed || busy || !selectedPack}
                    onClick={handlePurchase}
                  >
                    {busy
                      ? copy.purchase.opening
                      : selectedPack
                        ? formatMessage(copy.purchase.buy, {
                            credits: formatNumber(selectedPack.credits, lang),
                            price: formatPrice(selectedPack.priceCents, selectedPack.currency, lang),
                          })
                        : copy.purchase.choosePack}
                  </button>
                  <p className={styles.secure}>{copy.secure}</p>
                  {onShowPlans && (
                    <div className={styles.upsell}>
                      <strong>{copy.upsell.title}</strong>
                      <span>{copy.upsell.body}</span>
                      <button type="button" onClick={onShowPlans}>{copy.upsell.action}</button>
                    </div>
                  )}
                </aside>
              </div>
            </>
          )}

          <PurchaseHistory
            open={historyOpen}
            history={history}
            packs={packs}
            copy={copy}
            lang={lang}
            onToggle={() => setHistoryOpen((open) => !open)}
            onLoadMore={handleLoadMore}
          />
        </>
      )}
    </div>
  )
}

function StatusCard({ title, summary, busy = false, children }) {
  return (
    <div className={styles.statusCard} role={busy ? 'status' : 'alert'} aria-live="polite">
      {busy && <span className={styles.spinner} aria-hidden="true" />}
      <h2>{title}</h2>
      <p>{summary}</p>
      {children && <div className={styles.statusActions}>{children}</div>}
    </div>
  )
}

function CheckoutResult({ result, copy, lang, onCheckAgain }) {
  const text = copy.result
  const content = {
    pending: [text.pendingTitle, text.pendingSummary],
    granted: [
      text.grantedTitle,
      result.credits > 0
        ? formatMessage(text.grantedSummary, { credits: formatNumber(result.credits, lang) })
        : text.grantedSummaryUnknown,
    ],
    failed: [text.failedTitle, text.failedSummary],
    delayed: [text.delayedTitle, text.delayedSummary],
    unverified: [text.unverifiedTitle, text.unverifiedSummary],
  }[result.status]

  return (
    <section className={`${styles.result} ${styles[`result_${result.status}`]}`} role="status" aria-live="polite">
      {result.status === 'pending' && <span className={styles.spinner} aria-hidden="true" />}
      <h2>{content[0]}</h2>
      <p>{content[1]}</p>
      {result.status !== 'pending' && result.status !== 'failed' && (
        <div className={styles.statusActions}>
          <a className="btn btn-primary" href={RETURN_TO_APP_URL}>{text.returnToApp}</a>
          {result.status === 'delayed' && (
            <button className="btn btn-secondary" type="button" onClick={onCheckAgain}>{text.checkAgain}</button>
          )}
        </div>
      )}
    </section>
  )
}

function BalanceSummary({ credits, copy, lang }) {
  if (!credits) return null
  const text = copy.balance
  const unlimited = credits.unlimited || credits.limit < 0
  const monthly = Math.max(0, credits.remaining)
  const addon = Math.max(0, credits.addon.remaining)
  const capacity = Math.max(monthly + addon, Math.max(0, credits.limit) + addon)
  const nextExpiry = credits.addon.nextExpiry
  return (
    <section className={styles.balance} aria-label={text.label}>
      <div className={styles.balanceMain}>
        <p className={styles.balanceLabel}>{text.total}</p>
        <p className={styles.balanceTotal}>{unlimited ? text.unlimited : formatNumber(monthly + addon, lang)}</p>
        {!unlimited && capacity > 0 && (
          <div className={styles.balanceBar} aria-hidden="true">
            <i className={styles.balanceMonthly} style={{ width: `${monthly / capacity * 100}%` }} />
            <i className={styles.balanceAddon} style={{ width: `${addon / capacity * 100}%` }} />
          </div>
        )}
        <dl className={styles.balanceGrid}>
          <div className={styles.legendMonthly}>
            <dt>{text.monthly}</dt>
            <dd>{unlimited ? text.unlimited : formatNumber(monthly, lang)}</dd>
          </div>
          <div className={styles.legendAddon}>
            <dt>{text.addon}</dt>
            <dd>{formatNumber(addon, lang)}</dd>
          </div>
        </dl>
      </div>
      <div className={styles.balanceSide}>
        <h2>{text.orderTitle}</h2>
        <ol className={styles.usageSteps}>
          {text.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <p className={styles.expiry}>
          <span>{text.nextExpiry}</span>
          <strong>
            {nextExpiry
              ? formatMessage(text.expiryDetail, {
                  credits: formatNumber(nextExpiry.credits, lang),
                  date: formatDate(nextExpiry.expiresAt, lang),
                })
              : text.noExpiry}
          </strong>
        </p>
      </div>
    </section>
  )
}

function PackCard({ pack, copy, lang, selected, disabled, onSelect }) {
  const priced = pack.available && pack.priceCents > 0
  return (
    <label
      className={[
        styles.packCard,
        pack.highlight ? styles.highlighted : '',
        selected ? styles.selected : '',
        disabled ? styles.disabled : '',
      ].filter(Boolean).join(' ')}
    >
      {pack.highlight
        ? <span className={styles.recommended}>{copy.pack.recommended}</span>
        : pack.bestValue && <span className={styles.recommended}>{copy.pack.bestValue}</span>}
      <div className={styles.packHeader}>
        <input
          className={styles.radio}
          type="radio"
          name="credit-pack"
          value={pack.code}
          checked={selected}
          disabled={disabled}
          aria-label={formatMessage(copy.pack.select, { name: pack.name })}
          onChange={onSelect}
        />
        <h3>{pack.name}</h3>
        {pack.bonusPercent > 0 && (
          <span className={styles.bonus}>{formatMessage(copy.pack.bonus, { percent: pack.bonusPercent })}</span>
        )}
      </div>
      <div className={styles.packCredits}>
        {formatMessage(copy.pack.credits, { credits: formatNumber(pack.credits, lang) })}
      </div>
      <div className={styles.packMeta}>
        <span>{formatMessage(copy.pack.validity, { days: pack.validDays || DEFAULT_VALID_DAYS })}</span>
        {pack.description && <span>{pack.description}</span>}
      </div>
      <div className={styles.packFooter}>
        <span className={styles.packPrice}>{priced ? formatPrice(pack.priceCents, pack.currency, lang) : '—'}</span>
        {priced && pack.credits > 0 && (
          <span className={styles.unitPrice}>
            {formatMessage(copy.pack.perTenK, {
              price: formatPrice(Math.round(pack.priceCents / pack.credits * 10000 * 100) / 100, pack.currency, lang),
            })}
          </span>
        )}
      </div>
      {!pack.available && <p className={styles.unavailable}>{copy.pack.unavailable}</p>}
    </label>
  )
}

function PurchaseHistory({ open, history, packs, copy, lang, onToggle, onLoadMore }) {
  const text = copy.history
  return (
    <section className={styles.history}>
      <button
        className={styles.historyToggle}
        type="button"
        aria-expanded={open}
        aria-controls="credit-pack-history"
        onClick={onToggle}
      >
        <span>{text.title}</span>
        <span className={styles.historyToggleHint}>{open ? text.hide : text.show}</span>
      </button>
      {open && (
        <div id="credit-pack-history" className={styles.historyBody}>
          {history.status === 'loading' && <p className={styles.historyMessage}>{text.loading}</p>}
          {history.status === 'error' && <p className={styles.historyMessage} role="alert">{text.error}</p>}
          {history.status === 'ready' && history.items.length === 0 && (
            <p className={styles.historyMessage}>{text.empty}</p>
          )}
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
                    const status = grantStatus(grant, history.loadedAt)
                    return (
                      <tr key={grant.id}>
                        <td data-label={text.date}>{formatDate(grant.grantedAt, lang)}</td>
                        <td data-label={text.pack}>{grantName(grant, packs, text)}</td>
                        <td data-label={text.credits}>{formatNumber(grant.credits, lang)}</td>
                        <td data-label={text.remaining}>{formatNumber(grant.remaining, lang)}</td>
                        <td data-label={text.expires}>{formatDate(grant.expiresAt, lang)}</td>
                        <td data-label={text.status}>
                          <span className={`${styles.grantStatus} ${styles[`grant_${status}`] || ''}`}>
                            {text.statuses[status] || status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {history.nextCursor && history.status === 'ready' && (
            <button className="btn btn-secondary" type="button" disabled={history.loadingMore} onClick={onLoadMore}>
              {text.loadMore}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function initialResult(checkout, token) {
  if (checkout.status !== 'success') return null
  if (!token) return { status: 'unverified', credits: 0 }
  return checkout.sessionId ? { status: 'pending', credits: 0 } : null
}

async function grantedCredits(loadGrants, token, sessionId, signal) {
  try {
    const page = await loadGrants(token, { limit: HISTORY_PAGE_SIZE, signal })
    return page.items.find((grant) => grant.sessionId === sessionId)?.credits || 0
  } catch {
    // The grant is confirmed; the amount is a nicety the summary can omit.
    return 0
  }
}

function isTransient(error) {
  return error?.kind === 'network' || error?.kind === 'unavailable'
}

function checkoutErrorKey(error) {
  if (error?.kind === 'rate_limited') return 'rateLimited'
  if (error?.code === 'CREDIT_PACK_REQUEST_EXPIRED') return 'requestExpired'
  if (error?.kind === 'billing_disabled') return 'billingDisabled'
  if (error?.kind === 'reconciliation_required') return 'reconciliation'
  return 'failed'
}

function localizePacks(packs, lang, copy) {
  const base = packs.find((pack) => pack.available && pack.priceCents > 0 && pack.credits > 0)
  const bestValueCode = bestValuePack(packs, base)
  return packs.map((pack) => {
    const translated = copy.packs[pack.code]
    return {
      ...pack,
      name: translated?.name || pack.name || pack.code,
      description: translated?.description || pack.description,
      bonusPercent: bonusPercent(pack, base),
      bestValue: pack.code === bestValueCode,
    }
  })
}

// The pack with the lowest price per credit, when packs share a currency and
// one of them is strictly cheaper per credit than the base pack.
function bestValuePack(packs, base) {
  if (!base) return ''
  let best = base
  packs.forEach((pack) => {
    if (!pack.available || pack.currency !== base.currency || pack.priceCents <= 0 || pack.credits <= 0) return
    if (pack.priceCents / pack.credits < best.priceCents / best.credits) best = pack
  })
  return best.code === base.code ? '' : best.code
}

function balanceAfter(credits, pack) {
  if (!credits || credits.unlimited || credits.limit < 0) return null
  return Math.max(0, credits.remaining) + Math.max(0, credits.addon.remaining) + pack.credits
}

// Extra credits per unit of money relative to the first (base) pack.
function bonusPercent(pack, base) {
  if (!base || pack.code === base.code || !pack.available || pack.currency !== base.currency) return 0
  if (pack.priceCents <= 0 || pack.credits <= 0) return 0
  const ratio = (pack.credits / pack.priceCents) / (base.credits / base.priceCents)
  return Math.max(0, Math.round((ratio - 1) * 100))
}

function grantStatus(grant, now) {
  if (grant.status === 'active' && grant.expiresAt && Date.parse(grant.expiresAt) <= now) return 'expired'
  return grant.status
}

function grantName(grant, packs, text) {
  if (grant.source === 'admin' || grant.packCode === 'manual') return text.manual
  return packs.find((pack) => pack.code === grant.packCode)?.name || grant.packCode
}

function readSelection(storage) {
  try {
    return resolveStorage(storage)?.getItem(CREDIT_PACK_SELECTION_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function writeSelection(code, storage) {
  try {
    resolveStorage(storage)?.setItem(CREDIT_PACK_SELECTION_STORAGE_KEY, code)
  } catch {
    // Restoring the selection after a canceled checkout is best effort.
  }
}

function clearSelection(storage) {
  try {
    resolveStorage(storage)?.removeItem(CREDIT_PACK_SELECTION_STORAGE_KEY)
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

function resolveStorage(storage) {
  if (storage !== undefined) return storage
  try {
    return globalThis.sessionStorage
  } catch {
    return null
  }
}

function formatNumber(value, lang) {
  try {
    return new Intl.NumberFormat(lang).format(value)
  } catch {
    return String(value)
  }
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

function formatDate(value, lang) {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return '—'
  try {
    return new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'short', day: 'numeric' }).format(time)
  } catch {
    return new Date(time).toISOString().slice(0, 10)
  }
}
