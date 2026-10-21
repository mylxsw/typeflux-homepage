import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { RING_ACTIONS, ringKeyCommand, ringSliceAt, ringSlicePosition } from './homeModel'
import { formatCopy } from './homeCopy'
import styles from './RingDemo.module.css'

// Presentational ring, drawn like the app's: a dark disc split into wedges,
// icons inside, labels outside, and a glow on the selected wedge. Positions are
// unit vectors so CSS can size the ring per breakpoint.
export function RingDial({ labels, centerTitle, centerSub, selected = -1, children, ...rest }) {
  const count = RING_ACTIONS.length
  const step = 360 / count
  const style = {
    '--wedge-start': `${selected * step - step / 2}deg`,
    '--wedge-size': `${step}deg`,
    '--divider-start': `${step / 2}deg`,
    '--divider-step': `${step}deg`,
  }
  const glow = selected >= 0 ? ringSlicePosition(selected, count, 1) : null

  return (
    <div className={`${styles.dial} ${selected >= 0 ? styles.hasSelection : ''}`} style={style} {...rest}>
      {glow ? <span className={styles.glow} style={{ '--x': glow.x, '--y': glow.y }} /> : null}
      <span className={styles.disc} />
      {RING_ACTIONS.map((action, index) => {
        const { x, y } = ringSlicePosition(index, count, 1)
        const active = index === selected
        return (
          <span key={action.id} className={active ? styles.slotActive : ''} style={{ '--x': x, '--y': y }}>
            <span className={styles.slot}><Icon name={action.icon} size={26} strokeWidth={1.6} /></span>
            <span className={styles.slotLabel}>{labels[action.id]}</span>
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
