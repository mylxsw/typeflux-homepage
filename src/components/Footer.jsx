import { useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { useTheme } from '../contexts/ThemeContext'
import styles from './Footer.module.css'

export default function Footer({ isPrivacyPage = false }) {
  const { t } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const [isWechatOpen, setIsWechatOpen] = useState(false)
  const toHomeAnchor = (hash) => (isPrivacyPage ? `/${hash}` : hash)

  return (
    <>
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.inner}>
            <div className={styles.brand}>
            <span className={styles.logoText}>Typeflux</span>
            <p className={styles.desc}>{t('footer.desc')}</p>
            <div className={styles.profileLinks} aria-label={t('footer.profileLinks')}>
              <a
                href="https://x.com/mylxsw"
                target="_blank"
                rel="noopener"
                className={styles.iconLink}
                aria-label="X"
                data-tooltip="X"
              >
                <XIcon />
              </a>
              <a
                href="https://github.com/mylxsw"
                target="_blank"
                rel="noopener"
                className={styles.iconLink}
                aria-label={t('footer.authorGithub')}
                data-tooltip={t('footer.authorGithub')}
              >
                <GithubIcon />
              </a>
              <a
                href="https://gulu.ai"
                target="_blank"
                rel="noopener"
                className={styles.iconLink}
                aria-label={t('footer.aboutMe')}
                data-tooltip={t('footer.aboutMe')}
              >
                <AboutIcon />
              </a>
              <button
                type="button"
                className={`${styles.inlineButton} ${styles.iconLink}`}
                onClick={() => setIsWechatOpen(true)}
                aria-label={t('footer.wechat')}
                data-tooltip={t('footer.wechat')}
              >
                <WechatIcon />
              </button>
            </div>
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

      {isWechatOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsWechatOpen(false)}
          role="presentation"
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={t('footer.wechatModalTitle')}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setIsWechatOpen(false)}
              aria-label={t('footer.close')}
            >
              ×
            </button>
            <h3>{t('footer.wechatModalTitle')}</h3>
            <img
              src="/wechat.jpg"
              alt={t('footer.wechatQrAlt')}
              className={styles.qrImage}
            />
          </div>
        </div>
      )}
    </>
  )
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4h3.2l4.25 5.67L16.55 4H20l-6.87 7.92L20.5 20h-3.22l-4.73-6.17L7.14 20H3.7l7.07-8.16L4 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.75a8.25 8.25 0 0 0-2.61 16.08c.41.07.56-.18.56-.4v-1.42c-2.28.5-2.76-.96-2.76-.96-.37-.97-.91-1.22-.91-1.22-.75-.5.06-.49.06-.49.83.06 1.27.85 1.27.85.73 1.27 1.92.9 2.38.69.07-.53.28-.9.51-1.11-1.82-.21-3.73-.92-3.73-4.09 0-.9.32-1.64.84-2.22-.09-.21-.36-1.06.08-2.2 0 0 .68-.22 2.23.84a7.5 7.5 0 0 1 4.06 0c1.55-1.06 2.23-.84 2.23-.84.44 1.14.17 1.99.08 2.2.52.58.84 1.32.84 2.22 0 3.18-1.92 3.88-3.75 4.08.29.26.55.77.55 1.56v2.31c0 .22.15.48.57.4A8.25 8.25 0 0 0 12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AboutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.5c4.694 0 8.5 3.806 8.5 8.5s-3.806 8.5-8.5 8.5S3.5 16.694 3.5 12 7.306 3.5 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M12 10.2a2.15 2.15 0 1 0 0-4.3 2.15 2.15 0 0 0 0 4.3Zm-3.45 6.05c.58-1.73 2.03-2.75 3.45-2.75s2.87 1.02 3.45 2.75"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WechatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.36 5C5.85 5 3 7.4 3 10.35c0 1.68.92 3.18 2.37 4.16L4.6 17l2.78-1.39c.62.16 1.28.25 1.98.25.18 0 .36-.01.53-.03"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.88 8.2c3.38 0 6.12 2.28 6.12 5.1 0 1.42-.7 2.7-1.85 3.62l.52 2.08-2.22-1.1c-.8.28-1.67.43-2.57.43-3.38 0-6.13-2.28-6.13-5.03 0-2.82 2.75-5.1 6.13-5.1Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.85" cy="10.15" r="1" fill="currentColor" />
      <circle cx="11.1" cy="10.15" r="1" fill="currentColor" />
      <circle cx="13.3" cy="13.05" r="1" fill="currentColor" />
      <circle cx="16.65" cy="13.05" r="1" fill="currentColor" />
    </svg>
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
