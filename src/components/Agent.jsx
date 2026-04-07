import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useI18n } from '../i18n/index.jsx'
import styles from './Agent.module.css'

export default function Agent() {
  const { t } = useI18n()
  const [contentRef, contentVisible] = useScrollAnimation()
  const [visualRef, visualVisible] = useScrollAnimation()

  return (
    <section className={styles.section} id="agent">
      <div className="container">
        <div className={styles.layout}>
          <div
            ref={contentRef}
            className={`${styles.content} animate-hidden ${contentVisible ? 'animate-visible' : ''}`}
          >
            <span className="section-badge">{t('agent.badge')}</span>
            <h2 className="section-title">
              {t('agent.title').split('\n').map((line, i) => (
                <span key={i}>{line}<br/></span>
              ))}
            </h2>
            <p className="section-subtitle">
              {t('agent.subtitle')}
            </p>
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><span className="material-symbols-outlined">chat</span></div>
                <div>
                  <strong>{t('agent.feature1Title')}</strong>
                  <p>{t('agent.feature1Desc')}</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><span className="material-symbols-outlined">edit</span></div>
                <div>
                  <strong>{t('agent.feature2Title')}</strong>
                  <p>{t('agent.feature2Desc')}</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}><span className="material-symbols-outlined">sync</span></div>
                <div>
                  <strong>{t('agent.feature3Title')}</strong>
                  <p>{t('agent.feature3Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={visualRef}
            className={`${styles.visual} animate-hidden ${visualVisible ? 'animate-visible' : ''}`}
          >
            <div className={styles.demo}>
              <div className={`${styles.bubble} ${styles.user}`}>
                <div className={styles.chatKeyHint}><kbd>Fn</kbd>+<kbd>Space</kbd></div>
                {t('agent.userExample')}
              </div>
              <div className={`${styles.bubble} ${styles.agent}`}>
                <div className={styles.agentLabel}>
                  <span className={styles.agentDot} />
                  {t('agent.agentLabel')}
                </div>
                {t('agent.agentResponse')}
                <div className={styles.result}>
                  &quot;We are pleased to inform you that the project has been successfully completed ahead of schedule...&quot;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
