// Scenes on the 1200 × 750 design desktop: each puts a redrawn surface where
// it appears on a real Mac (Spotlight height, under the menu bar, at the
// notch, at the pointer).
import { AppsPanel, LauncherFrame, QuickAskPanel } from './Launcher'
import { ChatWorkspace } from './Surfaces'
import VoiceCapsule from './Voice'
import styles from './Scenes.module.css'

// A light document window behind the overlays, like the app being typed into.
export function DocumentWindow({ title, children, className = '' }) {
  return (
    <div className={`${styles.document} ${className}`}>
      <div className={styles.documentBar}>
        <span className={styles.lights}><i /><i /><i /></span>
        <span>{title}</span>
      </div>
      <div className={styles.documentBody}>{children}</div>
    </div>
  )
}

function Lines({ count = 5 }) {
  return <span className={styles.lines}>{Array.from({ length: count }, (_, i) => <i key={i} />)}</span>
}

export function CapsuleScene({ variant, ui }) {
  return (
    <>
      <DocumentWindow title={ui.voice.app}><Lines /></DocumentWindow>
      {variant === 'notch' ? null : (
        <span className={`${styles.capsule} ${styles[`capsule_${variant}`]}`}>
          <VoiceCapsule variant={variant} voice={ui.voice} time={variant === 'orb' ? '0:09' : '0:03'} />
        </span>
      )}
    </>
  )
}

// The notch island lives at the desktop level, flush with the top edge.
export function NotchIsland({ ui }) {
  return <VoiceCapsule variant="notch" voice={ui.voice} />
}

export function ChatScene({ variant, ui, demo, placeholder }) {
  if (variant === 'workspace') {
    return <span className={styles.workspace}><ChatWorkspace ui={ui} demo={demo} /></span>
  }
  return (
    <>
      <DocumentWindow title={ui.voice.app} className={styles.dimmed}><Lines /></DocumentWindow>
      <span className={`${styles.panel} ${styles[`panel_${variant}`]}`}>
        {variant === 'launcher' ? <AppsPanel ui={ui} placeholder={placeholder} rows={5} /> : null}
        {variant === 'compact' ? <LauncherFrame ui={ui} placeholder={placeholder} footer="hidden" bare /> : null}
        {variant === 'quick' ? <QuickAskPanel ui={ui} compact /> : null}
      </span>
    </>
  )
}
