import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { useI18n } from '../i18n/index.jsx'
import styles from './Personas.module.css'

export default function Personas() {
  const { t } = useI18n()

  const personas = [
    { emoji: 'work', title: t('personas.work'), desc: t('personas.workDesc') },
    { emoji: 'menu_book', title: t('personas.study'), desc: t('personas.studyDesc') },
    { emoji: 'forum', title: t('personas.social'), desc: t('personas.socialDesc') },
    { emoji: 'build', title: t('personas.custom'), desc: t('personas.customDesc') },
  ]

  return (
    <section className={styles.section} id="personas">
      <div className="container">
        <h2 className={`section-title ${styles.centered}`}>{t('personas.title')}</h2>
        <p className={`section-subtitle ${styles.centered}`}>
          {t('personas.subtitle')}
        </p>
        <div className={styles.grid}>
          {personas.map((p, i) => (
            <PersonaCard key={p.title} persona={p} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PersonaCard({ persona, delay }) {
  const [ref, isVisible] = useScrollAnimation()
  return (
    <div
      ref={ref}
      className={`${styles.card} animate-hidden ${isVisible ? 'animate-visible' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className={styles.emoji}><span className="material-symbols-outlined">{persona.emoji}</span></div>
      <h3>{persona.title}</h3>
      <p>{persona.desc}</p>
    </div>
  )
}
