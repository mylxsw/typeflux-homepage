import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useI18n } from '../i18n/index.jsx'
import styles from './Features.module.css'

const featureIcons = {
  local: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="var(--color-surface)"/>
      <path d="M24 14v10m0 0l-4-4m4 4l4-4" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 28c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  persona: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="var(--color-surface)"/>
      <circle cx="24" cy="20" r="6" stroke="var(--color-text)" strokeWidth="2"/>
      <path d="M14 36c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  minimal: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill="var(--color-surface)"/>
      <rect x="14" y="14" width="20" height="20" rx="4" stroke="var(--color-text)" strokeWidth="2"/>
      <path d="M20 22h8m-8 4h5" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
}

function AnimatedCard({ children, delay = 0, className }) {
  const [ref, isVisible] = useScrollAnimation()
  return (
    <div
      ref={ref}
      className={`${className} animate-hidden ${isVisible ? 'animate-visible' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

export default function Features() {
  const { t } = useI18n()
  const [heroRef, heroVisible] = useScrollAnimation()

  const features = [
    {
      icon: featureIcons.local,
      title: t('features.localModel'),
      desc: t('features.localModelDesc'),
    },
    {
      icon: featureIcons.persona,
      title: t('features.persona'),
      desc: t('features.personaDesc'),
    },
    {
      icon: featureIcons.minimal,
      title: t('features.minimal'),
      desc: t('features.minimalDesc'),
    },
  ]

  return (
    <section className={styles.section} id="features">
      <div className="container">
        <h2 className={`section-title ${styles.centered}`}>{t('features.title')}</h2>
        <p className={`section-subtitle ${styles.centered}`}>
          {t('features.subtitle')}
        </p>

        <div className={styles.grid}>
          {/* Hero card */}
          <div
            ref={heroRef}
            className={`${styles.card} ${styles.cardLarge} animate-hidden ${heroVisible ? 'animate-visible' : ''}`}
          >
            <div className={styles.keyVisual}>
              <div className={styles.keyCombo}>
                <kbd className={styles.keyLg}>Fn</kbd>
              </div>
              <div className={styles.keyArrow}>→</div>
              <div className={styles.waveVisual}>
                <div className={styles.waveCircle} />
                <div className={styles.waveCircle} />
                <div className={styles.waveCircle} />
              </div>
            </div>
            <h3>{t('features.card1Title')}</h3>
            <p>{t('features.card1Desc')}</p>
          </div>

          {features.map((f, i) => (
            <AnimatedCard key={f.title} delay={(i + 1) * 0.1} className={styles.card}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}
