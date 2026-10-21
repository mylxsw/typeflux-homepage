import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Icon from './Icon'
import { RING_ACTIONS, RING_GEOMETRY, ringHighlightPath, ringPolar, ringKeyCommand, ringSliceAt } from './homeModel'

const { BOX, C, DISC, HUB, ICON_R, LABEL_R } = RING_GEOMETRY
import { formatCopy } from './homeCopy'
import styles from './RingDemo.module.css'

// Presentational ring, drawn like the app's: a dark disc split into wedges,
// icons inside, labels outside and a liquid highlight on the selection.
export function RingDial({ labels, centerTitle, centerSub, selected = -1, children, ...rest }) {
  const count = RING_ACTIONS.length
  const step = 360 / count
  // Gradient ids must be unique per ring; useId's punctuation is not valid in url().
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')

  return (
    <div className={styles.dial} {...rest}>
      <svg className={styles.svg} viewBox={`0 0 ${BOX} ${BOX}`} aria-hidden="true">
        <defs>
          <radialGradient id={`${id}-disc`} cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#323236" />
            <stop offset="100%" stopColor="#242427" />
          </radialGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#a585d8" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#8a6aa8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#5a4d66" stopOpacity="0.55" />
          </radialGradient>
          <radialGradient id={`${id}-hub`} cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#3a3a3f" />
            <stop offset="100%" stopColor="#26262a" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={DISC} fill={`url(#${id}-disc)`} stroke="rgba(255,255,255,0.12)" />
        {selected >= 0 ? <path className={styles.highlight} d={ringHighlightPath(selected, count)} fill={`url(#${id}-glow)`} /> : null}
        {RING_ACTIONS.map((action, i) => {
          const angle = i * step + step / 2
          const [x1, y1] = ringPolar(angle, HUB + 6)
          const [x2, y2] = ringPolar(angle, DISC)
          return <line key={action.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.08)" />
        })}
        <circle cx={C} cy={C} r={HUB + 4} fill="#0e0e10" />
        <circle cx={C} cy={C} r={HUB - 4} fill={`url(#${id}-hub)`} stroke="rgba(255,255,255,0.08)" />
      </svg>
      {RING_ACTIONS.map((action, index) => {
        const [ix, iy] = ringPolar(index * step, ICON_R)
        const [lx, ly] = ringPolar(index * step, LABEL_R)
        const active = index === selected
        return (
          <span key={action.id} className={active ? styles.slotActive : ''}>
            <span className={styles.slot} style={{ left: `${(ix / BOX) * 100}%`, top: `${(iy / BOX) * 100}%` }}>
              <Icon name={action.icon} size={28} strokeWidth={1.5} />
            </span>
            <span className={styles.slotLabel} style={{ left: `${(lx / BOX) * 100}%`, top: `${(ly / BOX) * 100}%` }}>
              {labels[action.id]}
            </span>
          </span>
        )
      })}
      <span className={styles.center}>
        <strong>{centerTitle}</strong>
        {centerSub ? <small>{centerSub}</small> : null}
      </span>
      {children}
    </div>
  )
}

export default function RingDemo({ copy, ui }) {
  const count = RING_ACTIONS.length
  const [selected, setSelected] = useState(-1)
  const [ran, setRan] = useState(null)
  const [pressing, setPressing] = useState(false)
  const dialRef = useRef(null)
  const centre = useRef({ x: 0, y: 0 })
  const ranTimer = useRef(null)

  useEffect(() => () => clearTimeout(ranTimer.current), [])

  const run = useCallback((index) => {
    const action = RING_ACTIONS[index]
    if (!action) return
    setSelected(index)
    setRan(action.id)
    clearTimeout(ranTimer.current)
    ranTimer.current = setTimeout(() => setSelected(-1), 900)
  }, [])

  const sliceFromEvent = (event) => ringSliceAt(event.clientX - centre.current.x, event.clientY - centre.current.y, count)

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const rect = dialRef.current.getBoundingClientRect()
    centre.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    clearTimeout(ranTimer.current)
    setPressing(true)
    setSelected(sliceFromEvent(event))
  }

  const handlePointerMove = (event) => {
    if (!pressing) return
    setSelected(sliceFromEvent(event))
  }

  const handlePointerUp = (event) => {
    if (!pressing) return
    setPressing(false)
    const index = sliceFromEvent(event)
    if (index >= 0) run(index)
    else setSelected(-1)
  }

  const handlePointerCancel = () => {
    setPressing(false)
    setSelected(-1)
  }

  const handleKeyDown = (event) => {
    const command = ringKeyCommand(event.key, selected, count)
    if (!command) return
    event.preventDefault()
    if (command.type === 'run') run(command.index)
    else setSelected(command.index)
  }

  const status = ran ? formatCopy(copy.ran, { action: copy.actions[ran] }) : copy.idle

  return (
    <div className={styles.demo}>
      <p className={styles.tryTitle}>{copy.tryTitle}</p>
      <div
        ref={dialRef}
        className={styles.surface}
        role="application"
        aria-roledescription="ring menu"
        aria-label={copy.tryHint}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <RingDial labels={copy.actions} centerTitle={copy.centerTitle} centerSub={ui.ring.actionsCount} selected={selected} />
      </div>
      <p className={styles.hint}>{copy.tryHint}</p>
      <p className={styles.status} role="status" aria-live="polite">{status}</p>
      <ol className={styles.srList}>
        {RING_ACTIONS.map((action, index) => (
          <li key={action.id}>{index + 1}. {copy.actions[action.id]}</li>
        ))}
      </ol>
    </div>
  )
}
