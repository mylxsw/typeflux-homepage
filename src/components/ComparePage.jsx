import { useI18n } from '../i18n/index.jsx'
import { localizedPath } from '../lib/localePath'
import { getCompareCopy } from './compareCopy'
import styles from './ComparePage.module.css'

const classicFeatures = [true, true, true, false, false, false]

export default function ComparePage() {
  const { lang } = useI18n()
  const copy = getCompareCopy(lang)
  const guideLang = lang === 'zh-CN' || lang === 'zh-TW' ? 'zh-CN' : 'en'

  return (
    <main className={styles.page}>
      <h1 id="compare-title">{copy.title}</h1>
      <table className={styles.table} aria-labelledby="compare-title">
        <thead>
          <tr>
            <th scope="col">{copy.feature}</th>
            <th scope="col">Typeflux</th>
            <th scope="col">Typeflux Classic</th>
          </tr>
        </thead>
        <tbody>
          {copy.rows.map((feature, index) => (
            <tr key={feature}>
              <th scope="row">{feature}</th>
              <td>{copy.included}</td>
              <td className={classicFeatures[index] ? undefined : styles.unavailable}>
                {classicFeatures[index] ? copy.included : copy.unavailable}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.actions}>
        <a className="btn btn-primary" href={localizedPath(lang, '/releases')}>{copy.downloads}</a>
        <a className="btn btn-secondary" href={localizedPath(guideLang, '/blog/switching-typeflux-editions')}>{copy.guide}</a>
      </div>
    </main>
  )
}
