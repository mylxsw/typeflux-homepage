import { useI18n } from '../i18n/index.jsx'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import styles from './Faq.module.css'

// Visible FAQ section. The same items feed the FAQPage structured data
// (src/lib/structuredData.js) — Google requires FAQ markup to be visible on
// the page, so never let the two drift apart.
export default function Faq() {
  const { t } = useI18n()
  const [ref, visible] = useScrollAnimation()
  const items = t('faq.items')

  if (!Array.isArray(items)) {
    return null
  }

  return (
    <section className={styles.section} id="faq">
      <div className="container">
        <div
          ref={ref}
          className={`${styles.content} animate-hidden ${visible ? 'animate-visible' : ''}`}
        >
          <h2 className={`section-title ${styles.centered}`}>{t('faq.title')}</h2>
          <p className={`section-subtitle ${styles.centered}`}>{t('faq.subtitle')}</p>
          <div className={styles.list}>
            {items.map((item) => (
              <details className={styles.item} key={item.q}>
                <summary className={styles.question}>
                  <span>{item.q}</span>
                  <span className={styles.chevron} aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </summary>
                <p className={styles.answer}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
