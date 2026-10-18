import { useEffect, useRef, useState } from 'react'
import styles from './Checkout.module.css'

// The sticky order summary used by both membership and credit purchases:
// what is being bought, how to pay, the total, and one primary action.
export default function OrderPanel({
  copy,
  title,
  detail,
  methods,
  total,
  note,
  consent,
  notice,
  error,
  action,
}) {
  const panel = useRef(null)
  const [panelVisible, setPanelVisible] = useState(true)

  useEffect(() => {
    const node = panel.current
    if (!node || typeof IntersectionObserver !== 'function') return undefined
    const observer = new IntersectionObserver(([entry]) => setPanelVisible(entry.isIntersecting), { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const showPanel = () => {
    panel.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }

  return (
    <>
      <aside className={styles.order} ref={panel} aria-labelledby="billing-order-heading">
        <h2 id="billing-order-heading" className={styles.orderHeading}>{copy.order.heading}</h2>
        <div className={styles.orderItem}>
          <strong>{title}</strong>
          {detail && <span>{detail}</span>}
        </div>
        {methods}
        <div className={styles.orderTotal} aria-live="polite" aria-atomic="true">
          <span>{copy.order.total}</span>
          <strong>{total || '—'}</strong>
        </div>
        {note && <p className={styles.orderNote}>{note}</p>}
        {consent && (
          <label className={styles.consent}>
            <input type="checkbox" checked={consent.checked} disabled={consent.disabled} onChange={(event) => consent.onChange(event.target.checked)} />
            <span>{consent.label}</span>
          </label>
        )}
        {notice && <p className={styles.orderNotice} role="status">{notice}</p>}
        {error && <p className={styles.orderError} role="alert">{error}</p>}
        <button
          className={styles.payButton}
          type="button"
          disabled={action.disabled}
          aria-busy={action.busy || undefined}
          onClick={action.onClick}
        >
          {action.busy && <span className={styles.buttonSpinner} aria-hidden="true" />}
          {action.label}
        </button>
      </aside>
      {!panelVisible && (
        <div className={styles.mobileBar}>
          <div>
            <span>{title}</span>
            <strong>{total || '—'}</strong>
          </div>
          <button type="button" onClick={showPanel}>{copy.order.checkout}</button>
        </div>
      )}
    </>
  )
}
