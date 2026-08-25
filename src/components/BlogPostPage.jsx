import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useI18n } from '../i18n/index.jsx'
import { getPost } from '../lib/posts'
import { localizedPath } from '../lib/localePath'
import { formatPostDate } from '../lib/postDate'
import styles from './BlogPostPage.module.css'

export default function BlogPostPage({ slug }) {
  const { t, lang } = useI18n()
  const post = getPost(slug, lang)

  if (!post) {
    return (
      <main className={styles.page}>
        <div className="container">
          <div className={styles.emptyState}>
            <h1>{t('blog.emptyTitle')}</h1>
            <p>{t('blog.emptyDescription')}</p>
            <a href={localizedPath(lang, '/blog')} className={styles.backLink}>
              ← {t('blog.backToBlog')}
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <article className={styles.article}>
        <header className={styles.header}>
          <a href={localizedPath(lang, '/blog')} className={styles.backLink}>
            ← {t('blog.backToBlog')}
          </a>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.meta}>{formatPostDate(post.date, lang)}</p>
        </header>
        <div className={styles.content}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  )
}
