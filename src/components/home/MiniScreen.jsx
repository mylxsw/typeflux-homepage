import ScaledDesktop from './ui/ScaledDesktop'
import { CapsuleScene, ChatScene, NotchIsland } from './ui/Scenes'
import styles from './MiniScreen.module.css'

const CAPSULES = ['bottom', 'orb', 'corner', 'notch']

// A real-proportion Mac desktop showing where a capsule or chat form appears.
// The wrapper's img role makes everything inside presentational.
export default function MiniScreen({ variant, sample, ui, demo, label }) {
  const isCapsule = CAPSULES.includes(variant)
  return (
    <div className={styles.screen} data-variant={variant} role="img" aria-label={label}>
      <ScaledDesktop
        desktop={ui.desktop}
        app={ui.voice.app}
        notch={variant === 'notch'}
        island={variant === 'notch' ? <NotchIsland ui={ui} /> : null}
        width={900}
        height={560}
        initialScale={0.54}
      >
        {isCapsule
          ? <CapsuleScene variant={variant} ui={ui} />
          : <ChatScene variant={variant} ui={ui} demo={demo} placeholder={sample.search} />}
      </ScaledDesktop>
    </div>
  )
}
