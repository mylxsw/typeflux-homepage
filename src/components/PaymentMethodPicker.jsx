import { prepaidMembershipCopy } from './prepaidMembershipCopy'
import styles from './PaymentMethodPicker.module.css'

export default function PaymentMethodPicker({ name, methods, value, onChange, disabled = false, lang = 'en' }) {
  const text = prepaidMembershipCopy(lang)
  const labels = { stripe: 'Stripe', alipay_page: text.alipay, wechat_native: text.wechat }

  return <fieldset className={styles.picker} disabled={disabled}>
    <legend>{text.method}</legend>
    <div className={styles.options} style={{ '--payment-methods': methods.length }}>
      {['stripe', 'alipay_page', 'wechat_native'].filter((method) => methods.includes(method)).map((method) => <label key={method} className={`${styles.option} ${value === method ? styles.selected : ''}`}>
        <input type="radio" name={name} value={method} aria-label={labels[method]} checked={value === method} disabled={disabled} onChange={() => onChange(method)} />
        <span>{labels[method]}</span>
      </label>)}
    </div>
  </fieldset>
}
