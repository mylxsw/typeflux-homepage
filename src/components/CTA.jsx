import { useI18n } from '../i18n/index.jsx'
import styles from './CTA.module.css'

export default function CTA() {
  const { t } = useI18n()

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>
          {t('cta.title').split('\n').map((line, i) => (
            <span key={i}>{line}<br/></span>
          ))}
        </h2>
        <p className={styles.subtitle}>{t('cta.subtitle')}</p>
        <a href="https://github.com/mylxsw/typeflux/releases" target="_blank" rel="noopener" className="btn btn-primary btn-xl">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v10m0 0l-3.5-3.5M8 11l3.5-3.5M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t('cta.downloadBtn')}
        </a>
      </div>
    </section>
  )
}
