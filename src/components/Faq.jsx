import { useI18n, getFaqGroups } from '../i18n/index.jsx'
import { useScrollAnimation } from '../hooks/useScrollAnimation'
import { trackedRedirect } from '../lib/analytics'
import { apiURL } from '../lib/api'
import styles from './Faq.module.css'

// Visible FAQ section, grouped by topic: a side column with the title, topic
// links and a way to ask more, and the questions on the right. The same
// groups feed the FAQPage structured data (src/lib/structuredData.js) —
// Google requires FAQ markup to be visible on the page, so never let the two
// drift apart.
export default function Faq() {
  const { lang, t } = useI18n()
  const [ref, visible] = useScrollAnimation()
  const groups = getFaqGroups(lang)

  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-title">
      <div className="container">
        <div ref={ref} className={`${styles.layout} animate-hidden ${visible ? 'animate-visible' : ''}`}>
          <aside className={styles.side}>
            <h2 className={styles.title} id="faq-title">{t('faq.title')}</h2>
            <p className={styles.subtitle}>{t('faq.subtitle')}</p>
            <nav className={styles.topics} aria-label={t('faq.jump')}>
              {groups.map((group) => (
                <a key={group.id} href={`#faq-${group.id}`}>
                  {group.title}
                  <span>{group.items.length}</span>
                </a>
              ))}
            </nav>
            <div className={styles.help}>
              <strong>{t('faq.help.title')}</strong>
              <p>{t('faq.help.desc')}</p>
              <a
                href={apiURL('/go/github/issues?placement=faq')}
                target="_blank"
                rel="noopener"
                onClick={(event) => trackedRedirect(event, 'github_click', '/go/github/issues', 'faq', { asset_key: 'issues' })}
              >
                {t('faq.help.link')}
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </aside>
          <div className={styles.groups}>
            {groups.map((group) => (
              <div key={group.id} className={styles.group} id={`faq-${group.id}`}>
                <h3 className={styles.groupTitle}>{group.title}</h3>
                <div className={styles.list}>
                  {group.items.map((item) => (
                    <details className={styles.item} key={item.q}>
                      <summary className={styles.question}>
                        <span>{item.q}</span>
                        <span className={styles.toggle} aria-hidden="true" />
                      </summary>
                      <p className={styles.answer}>{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
