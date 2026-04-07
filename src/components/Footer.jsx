import { useI18n } from '../i18n/index.jsx'
import { useTheme } from '../contexts/ThemeContext'
import styles from './Footer.module.css'

export default function Footer({ isPrivacyPage = false }) {
  const { t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const toHomeAnchor = (hash) => (isPrivacyPage ? `/${hash}` : hash)

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <span className={styles.logoText}>Typeflux</span>
            <p className={styles.desc}>{t('footer.desc')}</p>
          </div>
          <div className={styles.links}>
            <div className={styles.col}>
              <h4>{t('footer.product')}</h4>
              <a href={toHomeAnchor('#features')}>{t('footer.features')}</a>
              <a href={toHomeAnchor('#agent')}>{t('footer.agent')}</a>
              <a href="/privacy">{t('footer.privacy')}</a>
            </div>
            <div className={styles.col}>
              <h4>{t('footer.resources')}</h4>
              <a
                href="https://github.com/mylxsw/typeflux"
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
              <a
                href="https://github.com/mylxsw/typeflux/releases"
                target="_blank"
                rel="noopener"
              >
                {t('footer.download')}
              </a>
              <a
                href="https://github.com/mylxsw/typeflux/issues"
                target="_blank"
                rel="noopener"
              >
                {t('footer.feedback')}
              </a>
              <a href="/privacy">{t('footer.privacyPolicy')}</a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>{t('footer.copyright')}</p>
          {/* Theme Toggle */}
          <button 
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </footer>
  )
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  )
}
