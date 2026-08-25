import { useI18n } from '../i18n/index.jsx'
import { getAllPosts } from '../lib/posts'
import { localizedPath } from '../lib/localePath'
import { formatPostDate } from '../lib/postDate'
import styles from './BlogIndexPage.module.css'

export default function BlogIndexPage() {
  const { t, lang } = useI18n()
  const posts = getAllPosts(lang)

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <div className="container">
          <header className={styles.header}>
            <h1 className={styles.title}>{t('blog.indexTitle')}</h1>
            <p className={styles.subtitle}>{t('blog.indexSubtitle')}</p>
          </header>

          {posts.length ? (
            <div className={styles.list}>
              {posts.map((post) => (
                <a
                  key={post.slug}
                  href={localizedPath(lang, `/blog/${post.slug}`)}
                  className={styles.card}
                >
                  <span className={styles.date}>{formatPostDate(post.date, lang)}</span>
                  <h2 className={styles.cardTitle}>{post.title}</h2>
                  {post.description ? (
                    <p className={styles.cardDescription}>{post.description}</p>
                  ) : null}
                  <span className={styles.readMore}>{t('blog.readMore')} →</span>
                </a>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h2>{t('blog.emptyTitle')}</h2>
              <p>{t('blog.emptyDescription')}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
