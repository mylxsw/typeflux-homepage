import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { QRCodeSVG } from 'qrcode.react'
import { isWaiting } from './usePrepaidOrder'
import { MethodMark } from './PaymentMethods'
import { RETURN_TO_APP_URL, methodLabel, orderPhase } from './checkoutModel'
import { formatMessage, formatPrice } from './format'
import styles from './Checkout.module.css'

// Pays one Alipay/WeChat order and reports its outcome. Closing the dialog
// never cancels an unpaid order; the page keeps offering to continue it.
export default function PaymentDialog({
  order,
  copy,
  lang,
  title,
  successText,
  busy,
  pollPaused,
  error,
  onCheck,
  onCancel,
  onClose,
  onFinish,
}) {
  const phase = orderPhase(order)
  const finished = !isWaiting(order) && phase !== 'review'
  const dismiss = finished ? onFinish : onClose
  const amount = formatPrice(order.amount_fen, order.currency || 'CNY', lang)
  const credits = order.kind === 'credit_pack'

  return (
    <Dialog label={copy.pay.title} closeLabel={copy.pay.close} onClose={dismiss}>
      <div className={styles.payHeader}>
        <span className={styles.payMethod}><MethodMark method={order.channel} />{methodLabel(order.channel, copy)}</span>
        <p className={styles.payTitle}>{title}</p>
        <p className={styles.payAmount}>{amount}</p>
      </div>

      <div className={styles.payBody} aria-live="polite">
        {phase === 'preparing' && <Progress text={copy.pay.preparing} />}

        {phase === 'qr' && (
          <>
            <figure className={styles.qr}>
              <QRCodeSVG value={order.pay_url} size={196} marginSize={2} level="M" title={copy.pay.wechatTitle} />
            </figure>
            <h3 className={styles.payStepTitle}>{copy.pay.wechatTitle}</h3>
            <p className={styles.payHint}>
              <span className={styles.desktopOnly}>{copy.pay.wechatHint}</span>
              <span className={styles.mobileOnly}>{copy.pay.wechatMobile}</span>
            </p>
          </>
        )}

        {phase === 'redirect' && (
          <>
            <h3 className={styles.payStepTitle}>{copy.pay.alipayTitle}</h3>
            <p className={styles.payHint}>{copy.pay.alipayHint}</p>
            <a className={styles.payButton} href={order.pay_url} target="_blank" rel="noopener noreferrer">{copy.pay.openAlipay}</a>
          </>
        )}

        {phase === 'fulfilling' && (
          <Progress text={credits ? copy.pay.posting : copy.pay.activating} detail={copy.pay.noRepay} />
        )}

        {phase === 'granted' && (
          <Outcome tone="success" title={credits ? copy.pay.creditsAdded : copy.pay.activated} body={successText} />
        )}
        {phase === 'review' && <Outcome tone="warn" title={copy.pay.review} body={copy.pay.reviewBody} />}
        {phase === 'closed' && <Outcome tone="muted" title={copy.pay.closed} body={copy.pay.closedBody} />}
        {phase === 'refunded' && <Outcome tone="muted" title={copy.pay.refunded} body={copy.pay.refundedBody} />}

        {error && <p className={styles.orderError} role="alert">{error}</p>}
      </div>

      {isWaiting(order) && (
        <div className={styles.payFooter}>
          <p className={styles.waitingLine}>
            <span className={styles.pulseDot} aria-hidden="true" />
            {pollPaused ? copy.pay.pollPaused : copy.pay.waiting}
          </p>
          <div className={styles.payActions}>
            <button className={styles.secondaryButton} type="button" disabled={busy} onClick={onCheck}>{copy.pay.paid}</button>
            {order.status !== 'paid' && (
              <button className={styles.linkButton} type="button" disabled={busy} onClick={onCancel}>{copy.pay.cancel}</button>
            )}
          </div>
        </div>
      )}

      {phase === 'granted' && (
        <div className={styles.payActions}>
          <a className={styles.payButton} href={RETURN_TO_APP_URL}>{copy.pay.returnToApp}</a>
          <button className={styles.linkButton} type="button" onClick={onFinish}>{copy.pay.done}</button>
        </div>
      )}
      {(phase === 'closed' || phase === 'refunded') && (
        <div className={styles.payActions}>
          <button className={styles.payButton} type="button" onClick={onFinish}>{copy.pay.chooseAgain}</button>
        </div>
      )}
      {phase === 'review' && (
        <div className={styles.payActions}>
          <a className={styles.payButton} href={RETURN_TO_APP_URL}>{copy.pay.returnToApp}</a>
        </div>
      )}

      <p className={styles.orderNumber}>{formatMessage(copy.pay.orderNo, { id: order.id })}</p>
    </Dialog>
  )
}

function Progress({ text, detail }) {
  return (
    <div className={styles.progress} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <p>{text}</p>
      {detail && <small>{detail}</small>}
    </div>
  )
}

function Outcome({ tone, title, body }) {
  return (
    <div className={`${styles.outcome} ${styles[`outcome_${tone}`]}`} role="status">
      <span className={styles.outcomeIcon} aria-hidden="true">
        {tone === 'success' ? (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
        ) : tone === 'warn' ? (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 7.5v6" /><path d="M12 17h.01" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 12h10" /></svg>
        )}
      </span>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
    </div>
  )
}

export function Dialog({ label, closeLabel, onClose, children }) {
  const content = useRef(null)
  const closeButton = useRef(null)
  const dismiss = useRef(onClose)
  useEffect(() => {
    dismiss.current = onClose
  }, [onClose])

  useEffect(() => {
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const keydown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        dismiss.current()
        return
      }
      if (event.key !== 'Tab' || !content.current) return
      const controls = [...content.current.querySelectorAll('button:not(:disabled), a[href]')]
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (!controls.includes(document.activeElement)) {
        event.preventDefault()
        first?.focus()
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', keydown)
      if (previousFocus?.isConnected) previousFocus.focus?.()
    }
  }, [])

  return createPortal(
    <div className={styles.backdrop} onClick={(event) => { if (event.target === event.currentTarget) dismiss.current() }}>
      <section className={styles.dialog} role="dialog" aria-modal="true" aria-label={label} ref={content}>
        <button className={styles.dialogClose} type="button" aria-label={closeLabel} ref={closeButton} onClick={() => dismiss.current()}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        {children}
      </section>
    </div>,
    document.body,
  )
}
