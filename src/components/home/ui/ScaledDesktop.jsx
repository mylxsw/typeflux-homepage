import { useRef } from 'react'
import Desktop from './Desktop'
import { useFitScale } from '../homeHooks'
import styles from './ScaledDesktop.module.css'

// Lays children out at a fixed design size and scales them to the container,
// so a scene keeps the same proportions from the hero down to small cards.
export function Scaled({ width, height, initialScale = 1, className = '', children }) {
  const ref = useRef(null)
  const scale = useFitScale(ref, width, initialScale)

  return (
    <div ref={ref} className={`${styles.frame} ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <div className={styles.canvas} style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  )
}

export default function ScaledDesktop({ width = 1200, height = 750, initialScale = 1, className = '', ...desktopProps }) {
  return (
    <Scaled width={width} height={height} initialScale={initialScale} className={className}>
      <Desktop {...desktopProps} className={styles.desktop} />
    </Scaled>
  )
}
