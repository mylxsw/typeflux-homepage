import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { typedLength } from './homeModel'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Starts as false on the server and the first client render so hydration
// matches, then follows the visitor's system setting.
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia?.(REDUCED_MOTION_QUERY)
    if (!media) return undefined
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener?.('change', update)
    return () => media.removeEventListener?.('change', update)
  }, [])

  return reduced
}

// Shows `text` progressively while `active`. The full text is shown when the
// demo is idle and before the first tick (including on the server), so the
// markup always carries the real copy.
export function useTypewriter(text, active, { msPerChar = 45 } = {}) {
  const [length, setLength] = useState(null)

  useEffect(() => {
    if (!active || !text) return undefined
    const start = Date.now()
    const reset = setTimeout(() => setLength(0), 0)
    const timer = setInterval(() => {
      const next = typedLength(text, Date.now() - start, msPerChar)
      setLength(next)
      if (next >= text.length) clearInterval(timer)
    }, msPerChar)
    return () => {
      clearTimeout(reset)
      clearInterval(timer)
      setLength(null)
    }
  }, [active, text, msPerChar])

  const typing = Boolean(active && text) && length !== null && length < text.length
  const shown = active && length !== null ? text.slice(0, length) : text
  return { shown, typing }
}

// Cycles through `count` items every `interval` ms unless paused. Choosing an
// item manually restarts the timer from that item.
export function useAutoCycle(count, { interval = 5000, paused = false } = {}) {
  const [index, setIndex] = useState(0)
  const [epoch, setEpoch] = useState(0)

  useEffect(() => {
    if (paused || count < 2) return undefined
    const timer = setTimeout(() => setIndex((current) => (current + 1) % count), interval)
    return () => clearTimeout(timer)
  }, [index, epoch, paused, count, interval])

  const select = useCallback((next) => {
    setIndex(next)
    setEpoch((value) => value + 1)
  }, [])

  return [index, select]
}

// Layout effects only run in the browser; on the server this is a no-op.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

// Scale factor that fits content designed at `designWidth` px into the
// element behind `ref`. Starts at `initial` so server and first client
// renders match, then follows the element's width.
export function useFitScale(ref, designWidth, initial = 1) {
  const [scale, setScale] = useState(initial)

  useIsomorphicLayoutEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const update = () => {
      const width = node.getBoundingClientRect().width
      if (width > 0) setScale(width / designWidth)
    }
    update()
    if (typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref, designWidth])

  return scale
}
