import Icon from './Icon'
import styles from './MiniScreen.module.css'

function Wave() {
  return <span className={styles.wave} aria-hidden="true"><i /><i /><i /><i /><i /></span>
}

function Bars({ count, className = '' }) {
  return Array.from({ length: count }, (_, i) => <span key={i} className={`${styles.bar} ${className}`} />)
}

// What sits on top of the desktop for each illustration.
function Overlay({ variant, sample }) {
  switch (variant) {
    case 'bottom':
      return (
        <div className={styles.capsuleBottom}>
          <Wave />
          <span>{sample.transcript}</span>
        </div>
      )
    case 'orb':
      return (
        <div className={styles.capsuleOrb}>
          <span className={styles.orb} />
          <span className={styles.orbRing} />
        </div>
      )
    case 'corner':
      return (
        <div className={styles.cornerCard}>
          <span className={styles.cardTitle}><Wave />{sample.listening}</span>
          <span className={styles.cardText}>{sample.transcript}</span>
        </div>
      )
    case 'notch':
      return (
        <div className={styles.island}>
          <Wave />
          <span>{sample.transcript}</span>
        </div>
      )
    case 'launcher':
      return (
        <div className={`${styles.panel} ${styles.launcherPanel}`}>
          <span className={styles.inputRow}><Icon name="search" size={10} />{sample.search}</span>
          <span className={`${styles.resultRow} ${styles.resultActive}`}><span className={styles.dot} /><Bars count={1} /></span>
          <span className={styles.resultRow}><span className={styles.dot} /><Bars count={1} /></span>
          <span className={styles.resultRow}><Icon name="sparkles" size={10} /><Bars count={1} /></span>
        </div>
      )
    case 'compact':
      return (
        <div className={`${styles.panel} ${styles.compactPanel}`}>
          <span className={styles.inputRow}><Icon name="search" size={10} />{sample.search}</span>
        </div>
      )
    case 'quick':
      return (
        <div className={`${styles.panel} ${styles.launcherPanel}`}>
          <span className={styles.inputRow}><Icon name="sparkles" size={10} />qa</span>
          <span className={styles.answer}>{sample.answer}</span>
        </div>
      )
    case 'workspace':
      return (
        <div className={styles.workspace}>
          <span className={styles.wsSidebar}><Bars count={4} /></span>
          <span className={styles.wsChat}>
            <span className={styles.wsBubbleUser} />
            <span className={styles.wsStep} />
            <span className={styles.wsStep} />
            <span className={styles.wsBubble} />
            <span className={styles.wsComposer} />
          </span>
          <span className={styles.wsPanel}><span className={styles.wsUrl} /><Bars count={5} /></span>
        </div>
      )
    case 'region':
      return (
        <>
          <span className={styles.selection}><span className={styles.sizeLabel}>{sample.size}</span></span>
          <span className={styles.toolbar}>
            <Icon name="arrowRight" size={10} /><Icon name="scanText" size={10} /><Icon name="translate" size={10} /><Icon name="sparkles" size={10} />
          </span>
        </>
      )
    case 'fullScreen':
      return (
        <>
          <span className={styles.flash} />
          <span className={styles.thumb} />
        </>
      )
    case 'scrolling':
      return (
        <>
          <span className={styles.longPage}>
            <Bars count={9} className={styles.pageLine} />
          </span>
          <span className={styles.statusPill}>{sample.scrolling}</span>
        </>
      )
    case 'recording':
      return (
        <>
          <span className={`${styles.selection} ${styles.recSelection}`} />
          <span className={styles.recPill}><span className={styles.recDot} />{sample.recording}</span>
          <span className={styles.camera} />
        </>
      )
    case 'gif':
      return (
        <span className={styles.filmstrip}>
          {Array.from({ length: 5 }, (_, i) => <span key={i} className={styles.frame} style={{ '--frame': i }} />)}
          <span className={styles.frameLabel}><Icon name="play" size={10} />GIF · {sample.frames}</span>
        </span>
      )
    default:
      return null
  }
}

// A tiny stylised Mac desktop used to show where things appear on screen.
export default function MiniScreen({ variant, sample, label }) {
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
        <Overlay variant={variant} sample={sample} />
      </span>
    </div>
  )
}
