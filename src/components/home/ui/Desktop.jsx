// A macOS desktop in em units: wallpaper, menu bar and an optional notch.
// The hero uses it full size; the form illustrations shrink it by font size.
import { useId } from 'react'
import styles from './Desktop.module.css'

function AppleGlyph() {
  return (
    <svg viewBox="0 0 14 17" className={styles.apple} aria-hidden="true">
      <path d="M11.6 9c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7C3.4 4.4 2.1 5.2 1.4 6.5c-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.5 2.2 2.6 2.1 1-.1 1.4-.7 2.7-.7 1.2 0 1.6.7 2.6.6 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.4-.9-2.4-3.6zM9.6 3c.5-.7.9-1.6.8-2.5-.8 0-1.7.5-2.3 1.2-.5.6-.9 1.5-.8 2.4.9.1 1.8-.4 2.3-1.1z" fill="currentColor" />
    </svg>
  )
}

// Typeflux's status item: the app draws SF Symbol infinity.circle.fill as a
// template image, a filled disc with the infinity sign cut out of it.
function TypefluxStatusIcon() {
  const id = `tf-status-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg viewBox="0 0 20 20" className={styles.statusIcon} data-status-item="typeflux" aria-hidden="true">
      <mask id={id}>
        <rect width="20" height="20" fill="#fff" />
        <path d="M10 10c-1.2-1.5-2.3-2.3-3.5-2.3a2.3 2.3 0 0 0 0 4.6c1.2 0 2.3-.8 3.5-2.3s2.3-2.3 3.5-2.3a2.3 2.3 0 0 1 0 4.6c-1.2 0-2.3-.8-3.5-2.3z" fill="none" stroke="#000" strokeWidth="1.7" />
      </mask>
      <circle cx="10" cy="10" r="9" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  )
}

// `island` renders flush with the top edge, over the menu bar (the notch island).
export default function Desktop({ desktop, app, notch = false, island, className = '', children, ...rest }) {
  return (
    <div className={`${styles.desktop} ${className}`} {...rest}>
      <div className={styles.menubar} aria-hidden="true">
        <span className={styles.menuLeft}>
          <AppleGlyph />
          <b>{app}</b>
          {desktop.menus.map((menu) => <span key={menu}>{menu}</span>)}
        </span>
        {notch ? <span className={styles.notch} /> : null}
        <span className={styles.menuRight}>
          <TypefluxStatusIcon />
          <span className={styles.wifi} />
          <span className={styles.battery}><i /></span>
          <span>{desktop.clock}</span>
        </span>
      </div>
      {island ? <div className={styles.island}>{island}</div> : null}
      <div className={styles.stage}>{children}</div>
    </div>
  )
}
