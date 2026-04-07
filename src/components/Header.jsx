import { useState, useEffect, useCallback } from 'react'
import styles from './Header.module.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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

  const navLinks = [
    { href: '#features', label: '功能' },
    { href: '#agent', label: '随口说' },
    { href: '#privacy', label: '隐私' },
    { href: 'https://github.com/mylxsw/typeflux', label: 'GitHub', external: true },
  ]

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          <a href="/" className={styles.logo}>
            <svg className={styles.logoIcon} viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="currentColor"/>
              <path d="M8 12h16v2H8zm0 4h12v2H8zm0 4h14v2H8z" fill="white" opacity="0.9"/>
              <circle cx="24" cy="10" r="4" fill="white" opacity="0.9"/>
            </svg>
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
            <a
              href="https://github.com/mylxsw/typeflux/releases"
              target="_blank"
              rel="noopener"
              className={`btn btn-primary ${styles.cta}`}
            >
              <DownloadIcon />
              免费下载
            </a>
            <button className={styles.menuBtn} onClick={toggleMenu} aria-label="菜单">
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
          <a
            href="https://github.com/mylxsw/typeflux/releases"
            target="_blank"
            rel="noopener"
            className={`btn btn-primary ${styles.mobileCta}`}
            onClick={closeMenu}
          >
            免费下载
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
