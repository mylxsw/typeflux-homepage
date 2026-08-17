import { useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import styles from './CookieConsent.module.css'
import { clearAnalyticsIdentity } from '../lib/analytics'

const STORAGE_KEY = 'typeflux-cookie-consent'

// Feature flag: set to true when cookie consent is actually needed
const COOKIE_CONSENT_ENABLED = true

export default function CookieConsent() {
  const { t, isReady } = useI18n()
  const [hasDecision, setHasDecision] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return ['accepted', 'essential-only'].includes(localStorage.getItem(STORAGE_KEY))
  })
  const updateConsent = (value) => {
    localStorage.setItem(STORAGE_KEY, value)
    if (value === 'accepted') window.dispatchEvent(new Event('typeflux:analytics-consent-changed'))
    else clearAnalyticsIdentity()
    setHasDecision(true)
  }

  if (!COOKIE_CONSENT_ENABLED || !isReady || hasDecision) {
    return null
  }

  return (
    <aside
      className={styles.banner}
      role="dialog"
      aria-live="polite"
      aria-label={t('cookie.bannerLabel')}
    >
      <div className={styles.card}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>{t('cookie.eyebrow')}</p>
          <h2 className={styles.title}>{t('cookie.title')}</h2>
          <p className={styles.message}>{t('cookie.message')}</p>
          <a className={styles.inlineLink} href="/privacy">
            {t('cookie.learnMore')}
          </a>
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.rejectBtn} onClick={() => updateConsent('essential-only')}>
            {t('cookie.reject')}
          </button>
          <button type="button" className={styles.acceptBtn} onClick={() => updateConsent('accepted')}>
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </aside>
  )
}
