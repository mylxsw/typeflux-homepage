import { useState, useEffect, useCallback, useRef } from 'react'
import { useI18n, languages } from '../i18n/index.jsx'
import styles from './Header.module.css'

export default function Header({ isPrivacyPage = false }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { t, lang, setLanguage } = useI18n()
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
            {/* Language Switcher */}
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
          
          {/* Mobile Language Options */}
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
