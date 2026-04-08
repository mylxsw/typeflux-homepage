import { useState, useEffect, useCallback, useRef } from 'react'
import { useI18n, languages } from '../i18n/index.jsx'
import { useTheme } from '../contexts/ThemeContext'
import styles from './Header.module.css'

export default function Header({ isPrivacyPage = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { t, lang, setLanguage } = useI18n()
  const { theme, toggleTheme } = useTheme()
  const langRef = useRef(null)
  const toHomeAnchor = useCallback((hash) => {
    return isPrivacyPage ? `/${hash}` : hash
  }, [isPrivacyPage])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => {
      document.body.style.overflow = !prev ? 'hidden' : ''
      return !prev
    })
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }, [])

  const handleNavClick = useCallback((e) => {
    const href = e.currentTarget.getAttribute('href')
    if (href?.startsWith('#')) {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 92
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }
    closeMenu()
  }, [closeMenu])

  const handleLangSelect = useCallback((code) => {
    setLanguage(code)
    setLangOpen(false)
  }, [setLanguage])

  const currentLang = languages.find(l => l.code === lang) || languages[0]

  const navLinks = [
    { href: toHomeAnchor('#features'), label: t('nav.features') },
    { href: toHomeAnchor('#agent'), label: t('nav.agent') },
    { href: '/privacy', label: t('nav.privacy') },
    { href: 'https://github.com/mylxsw/typeflux', label: t('nav.github'), external: true },
  ]

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <a href="/" className={styles.logo}>
            <img src="/app.png" alt="Typeflux" className={styles.logoIcon} />
            <span className={styles.logoText}>Typeflux</span>
          </a>

          <nav className={styles.nav}>
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className={styles.navLink}
                onClick={link.external ? undefined : handleNavClick}
                {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.actions}>
            <div className={styles.utilityGroup}>
              <div
                className={`lang-switcher ${langOpen ? 'open' : ''}`}
                ref={langRef}
              >
                <button
                  className="lang-btn"
                  onClick={() => setLangOpen(!langOpen)}
                  aria-label="Select language"
                >
                  <span>{currentLang.flag}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="lang-dropdown">
                  {languages.map(l => (
                    <div
                      key={l.code}
                      className={`lang-option ${l.code === lang ? 'active' : ''}`}
                      onClick={() => handleLangSelect(l.code)}
                    >
                      <span className="lang-flag">{l.flag}</span>
                      <span>{l.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={`theme-toggle ${styles.themeToggle}`}
                onClick={toggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </button>
            </div>

            <a
              href="https://github.com/mylxsw/typeflux/releases"
              target="_blank"
              rel="noopener"
              className={`btn btn-primary ${styles.cta}`}
            >
              <DownloadIcon />
              {t('nav.download')}
            </a>
            <button className={styles.menuBtn} onClick={toggleMenu} aria-label="Menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 12h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <nav className={styles.mobileNav}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={styles.mobileNavLink}
              onClick={link.external ? closeMenu : handleNavClick}
              {...(link.external ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {link.label}
            </a>
          ))}

          <div className={styles.mobileSettingsSection}>
            <div className={styles.mobileSectionTitle}>Appearance / 主题</div>
            <button
              type="button"
              className={styles.mobileThemeBtn}
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <span className={styles.mobileThemeIcon}>
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
              </span>
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>

          <div className={styles.mobileLangSection}>
            <div className={styles.mobileLangTitle}>Language / 语言</div>
            <div className={styles.mobileLangOptions}>
              {languages.map(l => (
                <button
                  key={l.code}
                  className={`${styles.mobileLangBtn} ${l.code === lang ? styles.mobileLangActive : ''}`}
                  onClick={() => handleLangSelect(l.code)}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          <a
            href="https://github.com/mylxsw/typeflux/releases"
            target="_blank"
            rel="noopener"
            className={`btn btn-primary ${styles.mobileCta}`}
            onClick={closeMenu}
          >
            {t('nav.download')}
          </a>
        </nav>
      </div>
    </>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v10m0 0l-3.5-3.5M8 11l3.5-3.5M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
