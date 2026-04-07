import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useI18n } from '../i18n/index.jsx'
import styles from './Privacy.module.css'

export default function Privacy() {
  const { t } = useI18n()
  const [visualRef, visualVisible] = useScrollAnimation()
  const [contentRef, contentVisible] = useScrollAnimation()

  const items = [
    { icon: 'home', title: t('privacy.local'), desc: t('privacy.localDesc') },
    { icon: 'lock', title: t('privacy.noData'), desc: t('privacy.noDataDesc') },
    { icon: 'menu_book', title: t('privacy.openSource'), desc: t('privacy.openSourceDesc') },
  ]

  return (
    <section className={styles.section} id="privacy">
      <div className="container">
        <div className={styles.layout}>
          <div
            ref={visualRef}
            className={`${styles.visual} animate-hidden ${visualVisible ? 'animate-visible' : ''}`}
          >
            <div className={styles.shield}>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <path d="M60 10L15 30v30c0 27.6 19.2 53.4 45 60 25.8-6.6 45-32.4 45-60V30L60 10z" fill="#22c55e" opacity="0.15"/>
                <path d="M60 20L22 37v25c0 23.4 16.2 45.2 38 50.8 21.8-5.6 38-27.4 38-50.8V37L60 20z" fill="#22c55e" opacity="0.25"/>
                <path d="M48 58l8 8 16-16" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div
            ref={contentRef}
            className={`${styles.content} animate-hidden ${contentVisible ? 'animate-visible' : ''}`}
          >
            <h2 className="section-title">{t('privacy.title')}</h2>
            <p className="section-subtitle">{t('privacy.subtitle')}</p>
            <div className={styles.features}>
              {items.map(item => (
                <div className={styles.item} key={item.title}>
                  <div className={styles.itemIcon}><span className="material-symbols-outlined">{item.icon}</span></div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
