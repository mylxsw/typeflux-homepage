// @vitest-environment jsdom
import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'
import { HOME_COPY } from './homeCopy'
import { LAUNCHER_DEMOS } from './homeModel'
import { mount } from '../account/testUtils'

globalThis.React = React

const en = HOME_COPY.en
let view
let reducedMotion = false

class StubObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function stubMatchMedia() {
  window.matchMedia = vi.fn((query) => ({
    matches: query.includes('reduce') ? reducedMotion : false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

async function advance(ms) {
  await act(async () => { vi.advanceTimersByTime(ms) })
}

function fire(node, type, init = {}) {
  act(() => { node.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init })) })
}

function key(node, value) {
  act(() => { node.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true })) })
}

const scene = () => view.container.querySelector('[role="tabpanel"][data-scene]')
const demo = () => view.container.querySelector('#launcher-demo')
const ringStatus = () => view.container.querySelector('#ring [role="status"]').textContent

beforeEach(() => {
  reducedMotion = false
  vi.useFakeTimers()
  vi.stubGlobal('IntersectionObserver', StubObserver)
  stubMatchMedia()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

afterEach(() => {
  view?.unmount()
  view = null
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('HomePage', () => {
  it('renders every section of the new information architecture without pricing', async () => {
    view = await mount(<HomePage />).render()
    for (const id of ['features', 'agent', 'launcher', 'forms', 'voice', 'capture', 'clipboard', 'ring', 'more', 'custom', 'scenarios', 'privacy', 'faq', 'ios']) {
      expect(view.container.querySelector(`#${id}`), id).toBeTruthy()
    }
    expect(view.container.querySelector('#pricing')).toBeNull()
    expect(view.text()).not.toMatch(/Pro plan|Pricing/)
    expect(view.container.querySelector('h1').textContent).toContain('one keystroke from done')
    expect(view.text()).toContain(en.replaces.title)
    expect(view.text()).toContain(en.ios.title)
    expect(view.text()).toContain(en.custom.demo.result)
    expect(view.find('a', en.closing.download).getAttribute('href')).toBe('/releases')
  })

  it('renders localized copy from the URL language', async () => {
    window.history.replaceState({}, '', '/zh-CN/')
    view = await mount(<HomePage />).render()
    expect(view.text()).toContain('一个快捷键')
    expect(view.text()).toContain(HOME_COPY['zh-CN'].ios.title)
    expect(view.text()).toContain(HOME_COPY['zh-CN'].forms.capsule.notch.name)
    expect(view.find('a', HOME_COPY['zh-CN'].hero.download).getAttribute('href')).toBe('/zh-CN/releases')
  })

  it('switches hero scenes by click and keyboard', async () => {
    view = await mount(<HomePage />).render()
    const tabs = [...view.container.querySelectorAll('[role="tab"][id^="hero-tab-"]')]
    expect(tabs).toHaveLength(4)
    expect(scene().dataset.scene).toBe('agent')
    expect(scene().textContent).toContain(en.hero.scenes.agent.answer)

    await view.click(tabs[1])
    expect(scene().dataset.scene).toBe('launcher')
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
    expect(tabs[1].tabIndex).toBe(0)
    expect(tabs[0].tabIndex).toBe(-1)

    key(tabs[1], 'End')
    expect(scene().dataset.scene).toBe('ring')
    expect(document.activeElement).toBe(tabs[3])
    expect(scene().textContent).toContain(en.hero.scenes.ring.hint)

    key(tabs[3], 'ArrowRight')
    expect(scene().dataset.scene).toBe('agent')
    key(tabs[0], 'Enter')
    expect(scene().dataset.scene).toBe('agent')
  })

  it('autoplays scenes and pauses while the visitor interacts', async () => {
    view = await mount(<HomePage />).render()
    await advance(6000)
    expect(scene().dataset.scene).toBe('launcher')

    const tab = view.container.querySelector('#hero-tab-launcher')
    act(() => tab.focus())
    await advance(20000)
    expect(scene().dataset.scene).toBe('launcher')

    act(() => tab.blur())
    await advance(6000)
    expect(scene().dataset.scene).toBe('voice')
  })

  it('types the voice demo and then shows the full sentence', async () => {
    view = await mount(<HomePage />).render()
    await view.click(view.container.querySelector('#hero-tab-voice'))
    const text = en.hero.scenes.voice.text
    const typed = () => scene().querySelector('p').textContent
    await advance(1)
    expect(typed()).toBe('')
    await advance(450)
    expect(typed().length).toBeGreaterThan(0)
    expect(typed().length).toBeLessThan(text.length)
    await advance(text.length * 45 + 100)
    expect(typed()).toBe(text)
  })

  it('stays still when the visitor prefers reduced motion', async () => {
    reducedMotion = true
    view = await mount(<HomePage />).render()
    await advance(30000)
    expect(scene().dataset.scene).toBe('agent')
    expect(demo().dataset.demo).toBe('files')
    expect(demo().textContent).toContain(en.launcher.demos.files.query)
  })

  it('cycles launcher demos and lets visitors pick one', async () => {
    view = await mount(<HomePage />).render()
    const launcherTabs = [...view.container.querySelectorAll('#launcher [role="tab"]')]
    expect(launcherTabs.map((tab) => tab.textContent)).toEqual(LAUNCHER_DEMOS.map((id) => en.launcher.demos[id].label))
    expect(demo().dataset.demo).toBe('files')

    await advance(4500)
    expect(demo().dataset.demo).toBe('cmd')

    const calc = launcherTabs[LAUNCHER_DEMOS.indexOf('calc')]
    await view.click(calc)
    expect(demo().dataset.demo).toBe('calc')
    expect(calc.getAttribute('aria-selected')).toBe('true')
    expect(demo().textContent).toContain('= 1,152')
    await advance(2000)
    expect(demo().textContent).toContain(en.launcher.demos.calc.query)

    key(calc, 'ArrowRight')
    expect(demo().dataset.demo).toBe('fy')
    expect(document.activeElement.id).toBe('launcher-tab-fy')

    // Hovering over the demo holds it in place.
    const stage = demo().parentElement
    fire(stage, 'mouseover')
    await advance(20000)
    expect(demo().dataset.demo).toBe('fy')
    fire(stage, 'mouseout', { relatedTarget: document.body })
    await advance(4500)
    expect(demo().dataset.demo).toBe('cal')
  })

  it('switches the display forms between the voice capsule and the chat', async () => {
    view = await mount(<HomePage />).render()
    const section = view.container.querySelector('#forms')
    const panel = () => section.querySelector('[role="tabpanel"]')
    const labels = () => [...panel().querySelectorAll('[role="img"]')].map((node) => node.getAttribute('aria-label'))
    expect(panel().dataset.group).toBe('capsule')
    expect(labels()).toEqual(['bottom', 'orb', 'corner', 'notch'].map((id) => en.forms.capsule[id].name))
    expect(panel().querySelector('[data-variant="notch"]')).toBeTruthy()

    const [capsuleTab, chatTab] = section.querySelectorAll('[role="tab"]')
    await view.click(chatTab)
    expect(panel().dataset.group).toBe('chat')
    expect(labels()).toEqual(['launcher', 'compact', 'quick', 'workspace'].map((id) => en.forms.chat[id].name))
    expect(panel().textContent).toContain(en.forms.sample.answer)

    key(chatTab, 'ArrowLeft')
    expect(panel().dataset.group).toBe('capsule')
    expect(document.activeElement).toBe(capsuleTab)
  })

  it('shows each capture mode', async () => {
    view = await mount(<HomePage />).render()
    const section = view.container.querySelector('#capture')
    const panel = () => section.querySelector('[role="tabpanel"]')
    expect(panel().dataset.mode).toBe('region')
    expect(panel().textContent).toContain(en.capture.sample.size)

    const tabs = [...section.querySelectorAll('[role="tab"]')]
    await view.click(tabs[2])
    expect(panel().dataset.mode).toBe('scrolling')
    expect(panel().textContent).toContain(en.capture.sample.scrolling)

    key(tabs[2], 'ArrowDown')
    expect(panel().dataset.mode).toBe('recording')
    expect(panel().textContent).toContain(en.capture.sample.recording)
    key(tabs[3], 'End')
    expect(panel().textContent).toContain(en.capture.sample.frames)
    for (const tool of en.capture.tools) expect(section.textContent).toContain(tool)
  })

  it('lets visitors compare agent permission modes', async () => {
    view = await mount(<HomePage />).render()
    const radios = [...view.container.querySelectorAll('#agent [role="radio"]')]
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false'])
    await view.click(radios[2])
    expect(radios.map((radio) => radio.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true'])
    for (const example of en.agent.examples) expect(view.text()).toContain(example)
  })

  it('shows clipboard cards and keeps history forever by default', async () => {
    view = await mount(<HomePage />).render()
    const section = view.container.querySelector('#clipboard')
    expect(section.querySelectorAll('[data-tone]')).toHaveLength(5)
    expect(section.textContent).toContain(en.clipboard.cards.code.body)
    const active = section.querySelector('[class*="retentionActive"]')
    expect(active.textContent).toBe(en.clipboard.retention.at(-1))
  })

  it('switches scenario tabs by click and keyboard', async () => {
    view = await mount(<HomePage />).render()
    const section = view.container.querySelector('#scenarios')
    const panel = () => section.querySelector('[role="tabpanel"]')
    expect(panel().textContent).toContain(en.scenarios.tabs.developer.steps[0])

    const writer = [...section.querySelectorAll('[role="tab"]')].find((tab) => tab.textContent === en.scenarios.tabs.writer.name)
    await view.click(writer)
    expect(panel().textContent).toContain(en.scenarios.tabs.writer.steps[1])
    expect(panel().getAttribute('aria-labelledby')).toBe('scenario-tab-writer')

    key(writer, 'End')
    expect(panel().textContent).toContain(en.scenarios.tabs.global.steps[0])
    expect(document.activeElement.id).toBe('scenario-tab-global')
    key(document.activeElement, 'x')
    expect(panel().getAttribute('aria-labelledby')).toBe('scenario-tab-global')
  })

  it('runs ring actions from the keyboard', async () => {
    view = await mount(<HomePage />).render()
    const surface = view.container.querySelector('#ring [role="application"]')
    expect(ringStatus()).toBe(en.ring.idle)

    key(surface, '3')
    expect(ringStatus()).toBe('Ran: Translate')

    // The run highlight clears, then the arrows start from the first slot.
    await advance(900)
    key(surface, 'ArrowRight')
    key(surface, 'ArrowRight')
    key(surface, 'Enter')
    expect(ringStatus()).toBe('Ran: Ask AI')

    key(surface, 'Escape')
    expect(surface.querySelector('[class*="hasSelection"]')).toBeNull()
    key(surface, 'q')
    key(surface, '9')
    expect(ringStatus()).toBe('Ran: Ask AI')
  })

  it('runs ring actions with press, drag and release', async () => {
    view = await mount(<HomePage />).render()
    const surface = view.container.querySelector('#ring [role="application"]')
    surface.getBoundingClientRect = () => ({ left: 0, top: 0, width: 300, height: 300, right: 300, bottom: 300 })
    const dial = surface.firstElementChild

    // Press at the centre: nothing selected yet.
    fire(surface, 'pointerdown', { clientX: 150, clientY: 150, button: 0 })
    expect(dial.className).not.toMatch(/hasSelection/)

    // Drag right (90°): the third of six slices.
    fire(surface, 'pointermove', { clientX: 290, clientY: 150 })
    expect(dial.className).toMatch(/hasSelection/)
    fire(surface, 'pointerup', { clientX: 290, clientY: 150 })
    expect(ringStatus()).toBe('Ran: Translate')

    // The highlight fades after a moment.
    await advance(900)
    expect(dial.className).not.toMatch(/hasSelection/)

    // Releasing back in the middle cancels.
    fire(surface, 'pointerdown', { clientX: 150, clientY: 10, button: 0 })
    fire(surface, 'pointerup', { clientX: 152, clientY: 150 })
    expect(ringStatus()).toBe('Ran: Translate')
    expect(dial.className).not.toMatch(/hasSelection/)

    // Moves without a press, secondary buttons and cancelled pointers do nothing.
    fire(surface, 'pointermove', { clientX: 150, clientY: 10 })
    fire(surface, 'pointerup', { clientX: 150, clientY: 10 })
    fire(surface, 'pointerdown', { clientX: 150, clientY: 10, button: 2 })
    expect(dial.className).not.toMatch(/hasSelection/)
    fire(surface, 'pointerdown', { clientX: 150, clientY: 10, button: 0 })
    fire(surface, 'pointercancel')
    expect(dial.className).not.toMatch(/hasSelection/)
    expect(ringStatus()).toBe('Ran: Translate')

    // Pressing straight onto a slot and releasing runs it.
    fire(surface, 'pointerdown', { clientX: 150, clientY: 10, button: 0 })
    fire(surface, 'pointerup', { clientX: 150, clientY: 10 })
    expect(ringStatus()).toBe('Ran: Voice input')
  })
})
