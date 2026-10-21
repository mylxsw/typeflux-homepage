// @vitest-environment jsdom
import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage'
import { HOME_COPY } from './homeCopy'
import { LAUNCHER_DEMOS, TERMINAL_LINES } from './homeModel'
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
const FLASH = 90
const CLOSE = 170
const ringStage = () => view.container.querySelector('#ring [role="application"]')
const ringEl = () => ringStage().querySelector('[data-open], [class*="closing"]')
const slotOn = () => ringStage().querySelector('[data-slot][data-on]')?.dataset.slot ?? null
const toastText = () => ringStage().querySelector('[class*="toast"]').textContent
const liveText = () => view.container.querySelector('#ring [role="status"]').textContent

function press(node, type, x, y, button = 0) {
  node.getBoundingClientRect = () => ({ left: 0, top: 0, width: 960, height: 560 })
  act(() => { node.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, button })) })
}

function keyEvent(node, type, value) {
  act(() => { node.dispatchEvent(new KeyboardEvent(type, { key: value, code: value === ' ' ? 'Space' : value, bubbles: true, cancelable: true })) })
}

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

  it('draws the voice section as dictation into Mail with the bottom capsule', async () => {
    view = await mount(<HomePage />).render()
    const voice = view.container.querySelector('#voice')
    const screen = voice.querySelector('[role="img"]')
    expect(screen.getAttribute('aria-label')).toContain(en.voice.demo.draft)
    expect(screen.textContent).toContain(en.voice.demo.persona)
    expect(screen.textContent).toContain(en.ui.desktop.clock)
    expect(voice.querySelectorAll('dl > div')).toHaveLength(en.voice.stats.length)
  })

  it('keeps the agent composer docked below the conversation', async () => {
    view = await mount(<HomePage />).render()
    const workspace = view.container.querySelector('#agent [role="img"]')
    const main = workspace.lastElementChild
    const [top, thread, composer] = main.children
    expect(main.children).toHaveLength(3)
    expect(top.textContent).toContain(en.ui.chat.newChat)
    expect(thread.textContent).toContain(en.agent.demo.user)
    expect(thread.textContent).toContain(en.agent.demo.answer)
    expect(composer.textContent).toContain(en.ui.chat.composer)
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
    expect(scene().textContent).toContain(en.agent.demo.answer)
    expect(scene().textContent).toContain(en.ui.desktop.clock)

    await view.click(tabs[1])
    expect(scene().dataset.scene).toBe('launcher')
    expect(scene().textContent).toContain(en.ui.apps.items[0])
    expect(tabs[1].getAttribute('aria-selected')).toBe('true')
    expect(tabs[1].tabIndex).toBe(0)
    expect(tabs[0].tabIndex).toBe(-1)

    key(tabs[1], 'End')
    expect(scene().dataset.scene).toBe('ring')
    expect(document.activeElement).toBe(tabs[3])
    expect(scene().textContent).toContain(en.hero.scenes.ring.hint)
    expect(scene().textContent).toContain(en.ui.ring.actionsCount)

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

  it('types the voice demo next to the listening capsule', async () => {
    view = await mount(<HomePage />).render()
    await view.click(view.container.querySelector('#hero-tab-voice'))
    const text = en.hero.scenes.voice.text
    const typed = () => scene().querySelector('[class*="typed"]').textContent
    expect(scene().textContent).toContain(`${en.ui.voice.listening} · ${en.ui.voice.app}`)
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
    expect(demo().dataset.demo).toBe('apps')
    expect(demo().textContent).toContain(en.ui.apps.items[0])
  })

  it('cycles launcher demos and lets visitors pick one', async () => {
    view = await mount(<HomePage />).render()
    const launcherTabs = [...view.container.querySelectorAll('#launcher [role="tab"]')]
    expect(launcherTabs.map((tab) => tab.textContent)).toEqual(LAUNCHER_DEMOS.map((id) => en.launcher.demos[id]))
    expect(demo().dataset.demo).toBe('apps')

    await advance(5500)
    expect(demo().dataset.demo).toBe('files')
    expect(demo().textContent).toContain(en.ui.files.contentItem[0])

    const pick = async (id) => {
      await view.click(launcherTabs[LAUNCHER_DEMOS.indexOf(id)])
      expect(demo().dataset.demo).toBe(id)
      expect(launcherTabs[LAUNCHER_DEMOS.indexOf(id)].getAttribute('aria-selected')).toBe('true')
      return demo().textContent
    }
    expect(await pick('cmd')).toContain(TERMINAL_LINES[0][2])
    expect(await pick('translate')).toContain(en.ui.translate.defs[0][1])
    expect(await pick('quickAsk')).toContain(en.ui.quickAsk.tail)
    expect(await pick('monitor')).toContain('WindowServer')
    expect(await pick('system')).toContain(en.ui.system.device)
    const calendar = await pick('calendar')
    expect(calendar).toContain(en.ui.calendar.month)
    expect(calendar).toContain('Halloween')
    expect(calendar).not.toContain('九月')

    key(launcherTabs[LAUNCHER_DEMOS.indexOf('calendar')], 'ArrowRight')
    expect(demo().dataset.demo).toBe('monitor')
    expect(document.activeElement.id).toBe('launcher-tab-monitor')

    // Hovering over the demo holds it in place.
    const stage = demo().parentElement
    fire(stage, 'mouseover')
    await advance(20000)
    expect(demo().dataset.demo).toBe('monitor')
    fire(stage, 'mouseout', { relatedTarget: document.body })
    await advance(5500)
    expect(demo().dataset.demo).toBe('system')
  })

  it('shows lunar dates and the holiday plan on the Chinese calendar', async () => {
    window.history.replaceState({}, '', '/zh-CN/')
    view = await mount(<HomePage />).render()
    await view.click(view.container.querySelector('#launcher-tab-calendar'))
    const text = demo().textContent
    expect(text).toContain('九月')
    expect(text).toContain('国庆节')
    expect(text).toContain('霜降')
    expect(demo().querySelectorAll('[class*="dayOff"]')).toHaveLength(7)
    expect(demo().querySelectorAll('[class*="dayWork"]')).toHaveLength(1)
    expect(demo().querySelector('[class*="dayToday"]').textContent).toContain('21')
  })

  it('switches the display forms between the voice capsule and the chat', async () => {
    view = await mount(<HomePage />).render()
    const section = view.container.querySelector('#forms')
    const panel = () => section.querySelector('[role="tabpanel"]')
    const labels = () => [...panel().querySelectorAll('[data-variant]')].map((node) => node.getAttribute('aria-label'))
    expect(panel().dataset.group).toBe('capsule')
    expect(labels()).toEqual(['bottom', 'orb', 'corner', 'notch'].map((id) => en.forms.capsule[id].name))
    expect(panel().querySelector('[data-variant="notch"]').textContent).toContain(en.ui.voice.transcript)
    expect(panel().querySelector('[data-variant="corner"]').textContent).toContain(en.ui.voice.app)

    const [capsuleTab, chatTab] = section.querySelectorAll('[role="tab"]')
    await view.click(chatTab)
    expect(panel().dataset.group).toBe('chat')
    expect(labels()).toEqual(['launcher', 'compact', 'quick', 'workspace'].map((id) => en.forms.chat[id].name))
    expect(panel().querySelector('[data-variant="workspace"]').textContent).toContain(en.ui.chat.search)
    expect(panel().querySelector('[data-variant="quick"]').textContent).toContain(en.ui.quickAsk.title)

    key(chatTab, 'ArrowLeft')
    expect(panel().dataset.group).toBe('capsule')
    expect(document.activeElement).toBe(capsuleTab)
  })

  it('shows each capture mode', async () => {
    view = await mount(<HomePage />).render()
    const section = view.container.querySelector('#capture')
    const panel = () => section.querySelector('[role="tabpanel"]')
    const ui = en.ui.capture
    expect(panel().dataset.mode).toBe('region')
    expect(panel().textContent).toContain(ui.size)

    const tabs = [...section.querySelectorAll('[role="tab"]')]
    await view.click(tabs[1])
    expect(panel().querySelector('[class*="flash"]')).toBeTruthy()
    await view.click(tabs[2])
    expect(panel().dataset.mode).toBe('scrolling')
    expect(panel().textContent).toContain(ui.scrolling)

    key(tabs[2], 'ArrowDown')
    expect(panel().dataset.mode).toBe('recording')
    expect(panel().textContent).toContain(ui.start)
    expect(panel().textContent).toContain(ui.recordInfo)
    key(tabs[3], 'End')
    expect(panel().textContent).toContain(ui.saveGif)
    expect(panel().textContent).toContain(ui.trimStart)
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

  it('switches the clipboard between the list and the shelf', async () => {
    view = await mount(<HomePage />).render()
    const section = view.container.querySelector('#clipboard')
    const form = () => section.querySelector('[data-form]')
    const [list, shelf] = section.querySelectorAll('[aria-pressed]')
    expect(form().dataset.form).toBe('list')
    expect(form().textContent).toContain(en.ui.clipboard.items[0][0])
    expect(form().textContent).toContain(en.ui.clipboard.count)

    await view.click(shelf)
    expect(shelf.getAttribute('aria-pressed')).toBe('true')
    expect(form().dataset.form).toBe('shelf')
    expect(form().querySelectorAll('li')).toHaveLength(5)
    expect(form().textContent).toContain(en.clipboard.cards.code.body)
    await view.click(list)
    expect(form().dataset.form).toBe('list')

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

  it('opens the ring at the pointer, follows the flick and runs on release', async () => {
    view = await mount(<HomePage />).render()
    const stage = ringStage()
    expect(ringEl()).toBeNull()

    press(stage, 'pointerdown', 400, 300)
    expect(ringEl()).toBeTruthy()
    expect(ringEl().style.getPropertyValue('--x')).toBe(`${400 - 310}px`)
    expect(slotOn()).toBeNull()

    // Flick right: the "translate" slot (index 2 of 6) lights up.
    press(stage, 'pointermove', 520, 300)
    expect(slotOn()).toBe('translate')
    // Far past the rim the selection follows the direction.
    press(stage, 'pointermove', 700, 300)
    await advance(400)
    expect(slotOn()).toBe('translate')

    press(stage, 'pointerup', 700, 300)
    await advance(FLASH)
    expect(toastText()).toContain(en.ring.effects.translate)
    expect(liveText()).toContain('Ran “Translate selection”')
    await advance(CLOSE)
    expect(ringEl()).toBeNull()
    await advance(2600)
    expect(toastText()).toBe('')
  })

  it('cancels when released back in the centre', async () => {
    view = await mount(<HomePage />).render()
    const stage = ringStage()
    press(stage, 'pointerdown', 400, 300)
    press(stage, 'pointermove', 400, 150)
    expect(slotOn()).toBe('dictation')
    press(stage, 'pointermove', 405, 295)
    expect(slotOn()).toBeNull()
    press(stage, 'pointerup', 405, 295)
    await advance(CLOSE + FLASH)
    expect(ringEl()).toBeNull()
    expect(liveText()).toBe('')
  })

  it('stays open after a tap for clicks, numbers, arrows and Escape', async () => {
    view = await mount(<HomePage />).render()
    const stage = ringStage()
    press(stage, 'pointerdown', 400, 300)
    press(stage, 'pointerup', 402, 301)
    expect(ringEl()).toBeTruthy()

    // Clicking a sector runs it.
    press(stage, 'pointerdown', 400, 200)
    await advance(FLASH + CLOSE)
    expect(liveText()).toContain('Voice input')
    expect(ringEl()).toBeNull()

    // Tap, then arrows and Return.
    press(stage, 'pointerdown', 400, 300)
    press(stage, 'pointerup', 400, 300)
    key(stage, 'ArrowRight')
    key(stage, 'ArrowRight')
    expect(slotOn()).toBe('ask')
    key(stage, 'Enter')
    await advance(FLASH + CLOSE)
    expect(liveText()).toContain('Ask anything')

    // Tap, then a number key.
    press(stage, 'pointerdown', 400, 300)
    press(stage, 'pointerup', 400, 300)
    key(stage, '6')
    await advance(FLASH + CLOSE)
    expect(liveText()).toContain('Clipboard history')

    // Tap, ignore other keys, close with Escape and with a click far away.
    press(stage, 'pointerdown', 400, 300)
    press(stage, 'pointerup', 400, 300)
    key(stage, 'q')
    key(stage, 'Escape')
    await advance(CLOSE)
    expect(ringEl()).toBeNull()
    key(stage, 'Enter')
    press(stage, 'pointerdown', 400, 300)
    press(stage, 'pointerup', 400, 300)
    press(stage, 'pointerdown', 900, 540)
    await advance(CLOSE)
    expect(ringEl()).toBeNull()
  })

  it('works with Space like the app shortcut', async () => {
    view = await mount(<HomePage />).render()
    const stage = ringStage()
    press(stage, 'pointermove', 400, 300)
    keyEvent(stage, 'keydown', ' ')
    expect(ringEl()).toBeTruthy()
    press(stage, 'pointermove', 320, 360)
    expect(slotOn()).toBe('screenshotText')
    keyEvent(stage, 'keyup', ' ')
    await advance(FLASH + CLOSE)
    expect(liveText()).toContain('Copy text from screen')

    // A quick tap keeps it open; pressing again closes it.
    keyEvent(stage, 'keydown', ' ')
    keyEvent(stage, 'keyup', ' ')
    expect(ringEl()).toBeTruthy()
    keyEvent(stage, 'keydown', ' ')
    await advance(CLOSE)
    expect(ringEl()).toBeNull()

    // Secondary buttons, cancelled pointers and blur do nothing harmful.
    press(stage, 'pointerdown', 400, 300, 2)
    expect(ringEl()).toBeNull()
    press(stage, 'pointerdown', 400, 300)
    press(stage, 'pointercancel', 400, 300)
    act(() => { stage.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
    await advance(CLOSE)
    expect(ringEl()).toBeNull()
  })
})
