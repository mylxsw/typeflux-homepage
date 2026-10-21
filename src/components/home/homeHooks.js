import { useCallback, useEffect, useState } from 'react'
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
