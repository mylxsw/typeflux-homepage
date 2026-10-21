import { AppsPanel, LauncherFrame, QuickAskPanel } from './ui/Launcher'
import { ChatWorkspace } from './ui/Surfaces'
import VoiceCapsule from './ui/Voice'
import styles from './MiniScreen.module.css'

function Bars({ count, className = '' }) {
  return Array.from({ length: count }, (_, i) => <span key={i} className={`${styles.bar} ${className}`} />)
}

// What sits on top of the desktop for each illustration.
function Overlay({ variant, sample, ui, demo }) {
  switch (variant) {
    case 'bottom':
    case 'orb':
    case 'corner':
    case 'notch':
      return (
        <span className={`${styles.capsuleSlot} ${styles[`slot_${variant}`]}`}>
          <VoiceCapsule variant={variant} voice={ui.voice} />
        </span>
      )
    case 'launcher':
      return <span className={`${styles.panelSlot} ${styles.slot_launcher}`}><AppsPanel ui={ui} placeholder={sample.search} rows={4} /></span>
    case 'compact':
      return <span className={`${styles.panelSlot} ${styles.slot_compact}`}><LauncherFrame ui={ui} placeholder={sample.search} footer="hidden" className={styles.bareFrame} /></span>
    case 'quick':
      return <span className={`${styles.panelSlot} ${styles.slot_quick}`}><QuickAskPanel ui={ui} compact /></span>
    case 'workspace':
      return <span className={`${styles.panelSlot} ${styles.slot_workspace}`}><ChatWorkspace ui={ui} demo={demo} /></span>
    default:
      return null
  }
}

// A tiny stylised Mac desktop used to show where things appear on screen.
export default function MiniScreen({ variant, sample, ui, demo, label }) {
  const hasNotch = variant === 'notch'
  return (
    <div className={styles.screen} data-variant={variant} role="img" aria-label={label}>
      <span className={styles.menubar} aria-hidden="true">
        <span className={styles.menuLeft}><Bars count={3} className={styles.menuItem} /></span>
        {hasNotch ? <span className={styles.notch} /> : null}
        <span className={styles.menuRight}><Bars count={2} className={styles.menuItem} /></span>
      </span>
      <span className={styles.appWindow} aria-hidden="true" />
      <span className={styles.overlay} aria-hidden="true">
        <Overlay variant={variant} sample={sample} ui={ui} demo={demo} />
      </span>
    </div>
  )
}
