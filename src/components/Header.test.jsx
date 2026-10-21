// @vitest-environment jsdom
import React, { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Header from './Header'
import { mount } from './account/testUtils'

globalThis.React = React

let view
const productButton = () => view.find('button', 'Product')
const productLinks = () => [...view.container.querySelectorAll('#header-product-menu a')]

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  window.scrollTo = vi.fn()
})

afterEach(() => {
  view?.unmount()
  view = null
  document.body.style.overflow = ''
})

describe('Header product menu', () => {
  it('links the main features on the home page and has no pricing link', async () => {
    view = await mount(<Header />).render()
    expect(productLinks().map((a) => [a.textContent, a.getAttribute('href')])).toEqual([
      ['AI Agent', '#agent'],
      ['Launcher', '#launcher'],
      ['Voice Input', '#voice'],
      ['Screenshots', '#capture'],
      ['Clipboard', '#clipboard'],
      ['Ring', '#ring'],
      ['Make it yours', '#custom'],
    ])
    expect(view.text()).not.toContain('Pricing')
  })

  it('points to the localized home page from inner pages', async () => {
    window.history.replaceState({}, '', '/zh-CN/privacy')
    view = await mount(<Header isPrivacyPage />).render()
    expect(productLinks()[0].getAttribute('href')).toBe('/zh-CN#agent')
    expect(productLinks()[2].textContent).toBe('语音输入')
    expect(view.find('button', '产品')).toBeTruthy()
  })

  it('opens on click and closes on Escape, outside clicks and navigation', async () => {
    view = await mount(<Header />).render()
    const button = productButton()
    expect(button.getAttribute('aria-expanded')).toBe('false')

    await view.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')
    act(() => button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    expect(button.getAttribute('aria-expanded')).toBe('false')

    await view.click(button)
    act(() => button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })))
    expect(button.getAttribute('aria-expanded')).toBe('true')
    act(() => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
    expect(button.getAttribute('aria-expanded')).toBe('false')

    const target = document.createElement('section')
    target.id = 'ring'
    document.body.append(target)
    await view.click(button)
    const link = productLinks()[5]
    act(() => link.focus())
    await view.click(link)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: -92, behavior: 'smooth' })
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).not.toBe(link)
    target.remove()
  })

  it('lists product links first in the mobile menu', async () => {
    view = await mount(<Header />).render()
    const mobile = [...view.container.querySelectorAll('nav')].at(-1)
    const labels = [...mobile.querySelectorAll('a')].map((a) => a.textContent)
    expect(labels.slice(0, 7)).toEqual(['AI Agent', 'Launcher', 'Voice Input', 'Screenshots', 'Clipboard', 'Ring', 'Make it yours'])
  })
})
