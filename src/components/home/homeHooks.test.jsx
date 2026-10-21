// @vitest-environment jsdom
import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAutoCycle, usePrefersReducedMotion, useTypewriter } from './homeHooks'

globalThis.React = React
globalThis.IS_REACT_ACT_ENVIRONMENT = true

let root
let container

function render(node) {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  act(() => root.render(node))
}

afterEach(() => {
  act(() => root?.unmount())
  container?.remove()
  root = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function Motion() {
  return <span>{usePrefersReducedMotion() ? 'reduced' : 'full'}</span>
}

describe('usePrefersReducedMotion', () => {
  it('follows the media query and its changes', () => {
    let listener
    const media = {
      matches: true,
      addEventListener: vi.fn((_, fn) => { listener = fn }),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('matchMedia', vi.fn(() => media))
    render(<Motion />)
    expect(container.textContent).toBe('reduced')

    media.matches = false
    act(() => listener())
    expect(container.textContent).toBe('full')

    act(() => root.unmount())
    root = null
    expect(media.removeEventListener).toHaveBeenCalledWith('change', listener)
  })

  it('assumes full motion when matchMedia is unavailable', () => {
    vi.stubGlobal('matchMedia', undefined)
    render(<Motion />)
    expect(container.textContent).toBe('full')
  })
})

function Typer({ text, active }) {
  const { shown, typing } = useTypewriter(text, active, { msPerChar: 10 })
  return <span data-typing={typing}>{shown}</span>
}

describe('useTypewriter', () => {
  it('shows the full text while idle and restarts when reactivated', () => {
    vi.useFakeTimers()
    render(<Typer text="abc" active={false} />)
    expect(container.textContent).toBe('abc')

    act(() => root.render(<Typer text="abc" active />))
    act(() => { vi.advanceTimersByTime(1) })
    expect(container.textContent).toBe('')
    act(() => { vi.advanceTimersByTime(20) })
    expect(container.textContent).toBe('ab')
    expect(container.firstChild.dataset.typing).toBe('true')
    act(() => { vi.advanceTimersByTime(100) })
    expect(container.textContent).toBe('abc')
    expect(container.firstChild.dataset.typing).toBe('false')

    act(() => root.render(<Typer text="abc" active={false} />))
    expect(container.textContent).toBe('abc')
  })

  it('handles empty text', () => {
    render(<Typer text="" active />)
    expect(container.textContent).toBe('')
    expect(container.firstChild.dataset.typing).toBe('false')
  })
})

function Cycle({ count, paused }) {
  const [index, select] = useAutoCycle(count, { interval: 100, paused })
  return <button type="button" onClick={() => select(0)}>{index}</button>
}

describe('useAutoCycle', () => {
  it('advances, wraps, and restarts the timer after a manual choice', () => {
    vi.useFakeTimers()
    render(<Cycle count={3} />)
    for (const expected of ['1', '2', '0']) {
      act(() => { vi.advanceTimersByTime(100) })
      expect(container.textContent).toBe(expected)
    }

    act(() => { vi.advanceTimersByTime(90) })
    act(() => container.firstChild.click())
    act(() => { vi.advanceTimersByTime(90) })
    expect(container.textContent).toBe('0')
    act(() => { vi.advanceTimersByTime(10) })
    expect(container.textContent).toBe('1')
  })

  it('stays put when paused or with a single item', () => {
    vi.useFakeTimers()
    render(<Cycle count={3} paused />)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(container.textContent).toBe('0')

    act(() => root.render(<Cycle count={1} />))
    act(() => { vi.advanceTimersByTime(1000) })
    expect(container.textContent).toBe('0')
  })
})
