import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import styles from './CookieConsent.module.css'

const STORAGE_KEY = 'typeflux-cookie-consent'

// Feature flag: set to true when cookie consent is actually needed
const COOKIE_CONSENT_ENABLED = false

export default function CookieConsent() {
  if (!COOKIE_CONSENT_ENABLED) {
    return null
  }
  const { t, isReady } = useI18n()
  const [hasConsent, setHasConsent] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return localStorage.getItem(STORAGE_KEY) === 'accepted'
  })
  const [isNearBottom, setIsNearBottom] = useState(false)

  useEffect(() => {
    const checkScrollPosition = () => {
      const doc = document.documentElement
      const threshold = 260
      const nearBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - threshold
      setIsNearBottom(nearBottom)
    }

    checkScrollPosition()
    window.addEventListener('scroll', checkScrollPosition, { passive: true })
    window.addEventListener('resize', checkScrollPosition)

    return () => {
      window.removeEventListener('scroll', checkScrollPosition)
      window.removeEventListener('resize', checkScrollPosition)
    }
  }, [])

  const updateConsent = (value) => {
    localStorage.setItem(STORAGE_KEY, value)
    setHasConsent(true)
  }

  if (!isReady || hasConsent || !isNearBottom) {
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
