import { useCallback, useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import RingDial from './RingDial'
import { RING_ACTIONS, ringKeyCommand } from './homeModel'
import { formatCopy } from './homeCopy'
import { usePrefersReducedMotion } from './homeHooks'
import { RING, clampCenter, pickSlot, pullFor, releaseAction, stepJelly } from './ringModel'
import styles from './RingStage.module.css'

const COUNT = RING_ACTIONS.length
// Wide screens lay the stage out at 960 × 560; narrow ones switch to a
// portrait 520 × 600 layout so the ring stays large enough to aim at.
const LAYOUTS = { wide: [960, 560], compact: [520, 600] }
const COMPACT_BELOW = 640
const FLASH_MS = 90
const CLOSE_MS = 170
const TOAST_MS = 2600

// A desktop where the ring can be tried like in the app: hold the mouse (or
// Space) to open it at the pointer, flick toward an action and let go. A tap
// keeps it open for clicks, 1–6, the arrows and Return; Esc closes it.
export default function RingStage({ copy, ui }) {
  const reduced = usePrefersReducedMotion()
  const stageRef = useRef(null)
  const state = useRef({ open: false, trigger: null, pressAt: null, travel: 0, ptr: null, center: [0, 0], scale: 1, sel: -1, kbSel: -1 })
  const jellyRef = useRef({ angle: 0, ext: 0 })
  const targetRef = useRef({ angle: 0, ext: 0 })
  const frame = useRef(0)
  const timers = useRef([])
  const [ring, setRing] = useState(null)
  const [toast, setToast] = useState(null)
  const [holding, setHolding] = useState(false)

  const later = useCallback((fn, ms) => { timers.current.push(setTimeout(fn, ms)) }, [])
  useEffect(() => () => {
    timers.current.forEach(clearTimeout)
    cancelAnimationFrame(frame.current)
  }, [])

  const paint = useCallback((patch = {}) => {
    const s = state.current
    setRing((prev) => (prev ? { ...prev, sel: s.kbSel >= 0 ? s.kbSel : s.sel, jelly: { ...jellyRef.current }, ...patch } : prev))
  }, [])

  const animate = useCallback(() => {
    if (reduced) {
      jellyRef.current = { ...targetRef.current }
      paint()
      return
    }
    if (frame.current) return
    const step = () => {
      frame.current = 0
      const { jelly, moving } = stepJelly(jellyRef.current, targetRef.current)
      jellyRef.current = jelly
      paint()
      if (moving) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
  }, [paint, reduced])

  const localPoint = (event) => {
    const rect = stageRef.current.getBoundingClientRect()
    const scale = state.current.scale || 1
    return [(event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale]
  }

  const offset = () => {
    const s = state.current
    return [s.ptr[0] - s.center[0], s.ptr[1] - s.center[1]]
  }

  const track = useCallback(() => {
    const s = state.current
    if (!s.open || !s.ptr) return
    // Furthest travel while held: flicking out and back still counts as a
    // gesture (so it cancels) rather than a tap.
    if (s.trigger && s.pressAt) s.travel = Math.max(s.travel, Math.hypot(s.ptr[0] - s.pressAt[0], s.ptr[1] - s.pressAt[1]))
    const [dx, dy] = [s.ptr[0] - s.center[0], s.ptr[1] - s.center[1]]
    const slot = pickSlot(dx, dy, COUNT)
    if (slot >= 0) { s.sel = slot; s.kbSel = -1 } else if (s.kbSel < 0) s.sel = -1
    targetRef.current = { angle: Math.atan2(-dy, dx), ext: pullFor(Math.hypot(dx, dy)) }
    // The selection updates at once; only the rim eases over frames.
    paint()
    animate()
  }, [animate, paint])

  const open = useCallback((point, trigger) => {
    const s = state.current
    const node = stageRef.current
    const rect = node.getBoundingClientRect()
    const width = rect.width / s.scale
    const height = rect.height / s.scale
    s.center = clampCenter(point || [width / 2, height / 2], width, height)
    s.ptr = point || s.center
    s.open = true
    s.trigger = trigger
    s.pressAt = s.ptr
    s.travel = 0
    s.sel = -1
    s.kbSel = -1
    jellyRef.current = { angle: 0, ext: 0 }
    targetRef.current = { angle: 0, ext: 0 }
    setToast(null)
    setRing({ key: Date.now(), center: s.center, sel: -1, jelly: { angle: 0, ext: 0 }, phase: 'opening', flash: false })
    track()
  }, [track])

  const close = useCallback(() => {
    const s = state.current
    if (!s.open) return
    s.open = false
    s.trigger = null
    setRing((prev) => (prev ? { ...prev, phase: 'closing' } : prev))
    later(() => setRing((prev) => (prev && prev.phase === 'closing' ? null : prev)), CLOSE_MS)
  }, [later])

  const execute = useCallback((index) => {
    const s = state.current
    const action = RING_ACTIONS[index]
    if (!action) return
    s.sel = index
    s.kbSel = -1
    paint({ sel: index, flash: true })
    later(() => {
      close()
      setToast({ id: action.id, key: Date.now() })
      later(() => setToast(null), TOAST_MS)
    }, FLASH_MS)
  }, [close, later, paint])

  const release = useCallback(() => {
    const s = state.current
    if (!s.open || !s.trigger) return
    s.trigger = null
    const [dx, dy] = offset()
    const decision = releaseAction({ moved: s.travel, dist: Math.hypot(dx, dy), selected: s.sel })
    if (decision === 'run') execute(s.sel)
    else if (decision === 'cancel') close()
  }, [close, execute])

  // The stage is laid out at a fixed design size and scaled to fit.
  const [layout, setLayout] = useState('wide')
  useEffect(() => {
    const node = stageRef.current
    if (!node) return undefined
    const update = () => {
      const width = node.parentElement?.clientWidth || LAYOUTS.wide[0]
      const next = width < COMPACT_BELOW ? 'compact' : 'wide'
      setLayout(next)
      state.current.scale = Math.min(1, width / LAYOUTS[next][0])
      node.style.setProperty('--stage-scale', String(state.current.scale))
    }
    update()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(update)
    observer.observe(node.parentElement || node)
    return () => observer.disconnect()
  }, [])

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return
    const s = state.current
    const point = localPoint(event)
    s.ptr = point
    stageRef.current.focus({ preventScroll: true })
    if (s.open) {
      // While open: a click on a sector runs it; far outside closes.
      const [dx, dy] = [point[0] - s.center[0], point[1] - s.center[1]]
      const dist = Math.hypot(dx, dy)
      const slot = pickSlot(dx, dy, COUNT, RING.R_IN - 4)
      if (slot >= 0 && dist <= RING.LABEL_R + 40) execute(slot)
      else if (dist > RING.R_OUT + 80) close()
      return
    }
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setHolding(true)
    open(point, 'pointer')
  }

  const handlePointerMove = (event) => {
    state.current.ptr = localPoint(event)
    track()
  }

  const handlePointerUp = () => {
    setHolding(false)
    if (state.current.trigger === 'pointer') release()
  }

  const handleKeyDown = (event) => {
    const s = state.current
    if (event.code === 'Space' || event.key === ' ') {
      event.preventDefault()
      if (event.repeat) return
      if (s.open && !s.trigger) { close(); return }
      if (!s.open) { setHolding(true); open(s.ptr, 'key') }
      return
    }
    if (!s.open) return
    if (event.key === 'Escape') { event.preventDefault(); close(); return }
    const command = ringKeyCommand(event.key, s.kbSel >= 0 ? s.kbSel : s.sel, COUNT)
    if (!command) return
    event.preventDefault()
    if (command.type === 'run') execute(command.index)
    else { s.kbSel = command.index; s.sel = command.index; paint() }
  }

  const handleKeyUp = (event) => {
    if (event.code !== 'Space' && event.key !== ' ') return
    event.preventDefault()
    setHolding(false)
    if (state.current.trigger === 'key') release()
  }

  const handleBlur = () => {
    setHolding(false)
    close()
  }

  const action = toast ? RING_ACTIONS.find((a) => a.id === toast.id) : null
  const doc = copy.doc

  return (
    <div className={`${styles.frame} ${layout === 'compact' ? styles.compact : ''}`}>
      <div
        ref={stageRef}
        className={styles.stage}
        tabIndex={0}
        role="application"
        aria-roledescription="ring menu"
        aria-label={copy.label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className={styles.menubar} aria-hidden="true">
          <b>{doc.title}</b>
          {ui.desktop.menus.slice(0, 4).map((menu) => <span key={menu}>{menu}</span>)}
          <i />
          <span>{ui.desktop.clock}</span>
        </div>
        <div className={styles.doc} aria-hidden="true">
          <div className={styles.docBar}><span /><span /><span /><em>{doc.title}</em></div>
          <div className={styles.docBody}>
            <b>{doc.heading}</b>
            <p>{doc.lines[0]}</p>
            <p>2. <mark>{doc.selected}</mark></p>
            <p>{doc.lines[1]}</p>
            <p>{doc.lines[2]}</p>
          </div>
        </div>
        <div className={`${styles.pressing} ${holding ? styles.pressingOn : ''}`} aria-hidden="true">{copy.holding}</div>

        {ring ? (
          <div
            key={ring.key}
            className={`${styles.ring} ${styles[ring.phase] || ''} ${reduced ? styles.still : ''}`}
            style={{ '--x': `${ring.center[0] - RING.C}px`, '--y': `${ring.center[1] - RING.C}px` }}
            data-open={ring.phase !== 'closing' || undefined}
          >
            <span className={styles.blur} />
            <RingDial
              className={styles.dial}
              labels={copy.actions}
              centerTitle={copy.centerTitle}
              centerSub={ui.ring.actionsCount}
              selected={ring.sel}
              jelly={ring.jelly}
              flash={ring.flash}
            />
          </div>
        ) : null}

        <div className={`${styles.toast} ${action ? styles.toastOn : ''}`} aria-hidden="true">
          {action ? (
            <>
              <span className={styles.toastIcon}><Icon name={action.icon} size={15} strokeWidth={1.9} /></span>
              <span><b>{formatCopy(copy.ran, { action: copy.actions[action.id] })}</b><small>{copy.effects[action.id]}</small></span>
            </>
          ) : null}
        </div>
      </div>
      <p className={styles.live} role="status" aria-live="polite">
        {action ? `${formatCopy(copy.ran, { action: copy.actions[action.id] })}. ${copy.effects[action.id]}` : ''}
      </p>
      <ol className={styles.srList}>
        {RING_ACTIONS.map((a, i) => <li key={a.id}>{i + 1}. {copy.actions[a.id]}</li>)}
      </ol>
    </div>
  )
}
