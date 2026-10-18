import { methodLabel } from './checkoutModel'
import styles from './Checkout.module.css'

export function MethodMark({ method }) {
  if (method === 'wechat_native') {
    return (
      <span className={`${styles.mark} ${styles.markWechat}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M9.2 4C5.2 4 2 6.7 2 10c0 1.9 1 3.6 2.7 4.7l-.7 2.1 2.5-1.3c.9.3 1.8.4 2.7.4h.4a5.4 5.4 0 0 1-.2-1.5c0-3.2 3.1-5.8 7-5.8h.3C16 6 12.9 4 9.2 4Zm-2.4 3.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm4.8 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
          <path d="M22 14.3c0-2.8-2.7-5-6-5s-6 2.2-6 5 2.7 5 6 5c.7 0 1.4-.1 2-.3l2 1-.5-1.7c1.5-1 2.5-2.4 2.5-4Zm-8-1.8a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Zm4 0a.8.8 0 1 1 0 1.6.8.8 0 0 1 0-1.6Z" />
        </svg>
      </span>
    )
  }
  if (method === 'alipay_page') {
    return <span className={`${styles.mark} ${styles.markAlipay}`} aria-hidden="true">支</span>
  }
  return <span className={`${styles.mark} ${styles.markStripe}`} aria-hidden="true">S</span>
}

// Radio rows for the payment methods. Each row shows what the current
// selection costs with that method, so currencies are never mixed silently.
export default function PaymentMethods({ name, methods, value, onChange, priceFor, copy, disabled = false }) {
  return (
    <fieldset className={styles.methods} disabled={disabled}>
      <legend className={styles.fieldLabel}>{copy.order.method}</legend>
      {methods.map((method) => {
        const price = priceFor(method)
        const unavailable = !price
        return (
          <label
            key={method}
            className={[
              styles.method,
              value === method ? styles.methodSelected : '',
              unavailable ? styles.methodUnavailable : '',
            ].filter(Boolean).join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={method}
              checked={value === method}
              disabled={disabled}
              onChange={() => onChange(method)}
            />
            <MethodMark method={method} />
            <span className={styles.methodName}>{methodLabel(method, copy)}</span>
            <span className={styles.methodPrice}>{price || copy.order.methodNotOffered}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
