// @vitest-environment jsdom
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAccountSession } from '../../contexts/AccountSessionContext.jsx'
import Header from '../Header'
import AccountMenu from './AccountMenu'
import { mount, signedIn } from './testUtils'

let view
beforeEach(() => { localStorage.clear(); window.history.replaceState({}, '', '/') })
afterEach(() => { view?.unmount(); view = null; vi.restoreAllMocks() })

function Probe() {
  const s = useAccountSession()
  return <div><output>{s.status}|{s.user?.email || ''}|{s.csrf}</output>
    <button onClick={s.expire}>expire</button><button onClick={() => s.refresh()}>refresh</button><button onClick={() => s.signOut()}>out</button></div>
}
const status = () => view.container.querySelector('output').textContent

describe('AccountSessionProvider', () => {
  it('loads once and exposes the signed-in identity', async () => {
    view = await mount(<Probe />).render()
    expect(status()).toBe('signedIn|lin@example.com|csrf-1')
  })
  it('reports signed out, errors and disabled', async () => {
    view = await mount(<Probe />, { session: { authenticated: false } }).render()
    expect(status()).toBe('signedOut||')
    view.unmount()
    view = await mount(<Probe />, { load: vi.fn(async () => { throw new Error('down') }) }).render()
    expect(status()).toBe('error||')
    view.unmount()
    const load = vi.fn()
    view = await mount(<Probe />, { enabled: false, load }).render()
    expect(status()).toBe('disabled||')
    await view.click(view.find('button', 'refresh'))
    expect(load).not.toHaveBeenCalled()
  })
  it('signs out, re-reads the session when sign-out fails, and expires on demand', async () => {
    const logout = vi.fn(async () => { throw new Error('offline') })
    view = await mount(<Probe />, { logout }).render()
    await view.click(view.find('button', 'out'))
    expect(logout).toHaveBeenCalledWith('csrf-1')
    // The cookie may still be valid, so the identity is shown as the server reports it.
    expect(status()).toBe('signedIn|lin@example.com|csrf-1')
    logout.mockResolvedValue({})
    await view.click(view.find('button', 'out'))
    expect(status()).toBe('signedOut||')
    await view.click(view.find('button', 'refresh'))
    expect(status()).toBe('signedIn|lin@example.com|csrf-1')
    await view.click(view.find('button', 'expire'))
    expect(status()).toBe('signedOut||')
  })
  it('ignores a stale load that finishes after a newer one', async () => {
    let finishFirst
    const load = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { finishFirst = resolve }))
      .mockImplementation(async () => signedIn)
    view = await mount(<Probe />, { load }).render()
    await view.click(view.find('button', 'refresh'))
    expect(status()).toBe('signedIn|lin@example.com|csrf-1')
    await act(async () => finishFirst({ authenticated: false }))
    expect(status()).toBe('signedIn|lin@example.com|csrf-1')
  })
  it('renders nothing account-related without a provider', async () => {
    const { createRoot } = await import('react-dom/client')
    const div = document.createElement('div')
    const root = createRoot(div)
    await act(async () => root.render(<Probe />))
    expect(div.querySelector('output').textContent).toBe('disabled||')
    await act(async () => div.querySelector('button').click())
    act(() => root.unmount())
  })
})

describe('AccountMenu', () => {
  it('shows a sign-in link when signed out', async () => {
    view = await mount(<AccountMenu />, { session: { authenticated: false } }).render()
    const link = view.find('a', 'Sign in')
    expect(link.getAttribute('href')).toBe('/login?next=%2Faccount')
  })
  it('renders nothing while loading or disabled', async () => {
    view = await mount(<AccountMenu />, { load: () => new Promise(() => {}) }).render()
    expect(view.text()).toBe('')
    view.unmount()
    view = await mount(<AccountMenu />, { enabled: false }).render()
    expect(view.text()).toBe('')
  })
  it('opens the avatar menu, closes on Escape or outside clicks and signs out', async () => {
    view = await mount(<AccountMenu />).render()
    const trigger = view.find('button')
    expect(trigger.getAttribute('aria-label')).toBe('Account menu: lin@example.com')
    await view.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect([...view.container.querySelectorAll('[role="menuitem"]')].map((n) => n.textContent)).toEqual(['Dashboard', 'Usage', 'Billing', 'Sign-in & security', 'Sign out'])
    expect(view.find('a', 'Usage').getAttribute('href')).toBe('/account/usage')
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })))
    expect(view.container.querySelector('[role="menu"]')).toBeNull()
    await view.click(trigger)
    await act(async () => document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
    expect(view.container.querySelector('[role="menu"]')).toBeNull()
    await view.click(trigger)
    await act(async () => view.find('[role="menu"]').dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
    expect(view.container.querySelector('[role="menu"]')).not.toBeNull()
    await view.click(view.find('a', 'Billing'))
    expect(view.container.querySelector('[role="menu"]')).toBeNull()
    await view.click(trigger)
    await view.click(view.find('button', 'Sign out'))
    expect(view.logout).toHaveBeenCalledWith('csrf-1')
    expect(view.find('a', 'Sign in')).toBeTruthy()
  })
  it('lists account links in the mobile menu', async () => {
    const onNavigate = vi.fn()
    view = await mount(<AccountMenu variant="mobile" onNavigate={onNavigate} />).render()
    expect(view.text()).toContain('lin@example.com')
    await view.click(view.find('a', 'Dashboard'))
    await view.click(view.find('button', 'Sign out'))
    expect(onNavigate).toHaveBeenCalledTimes(2)
    expect(view.find('a', 'Sign in').className).toMatch(/mobileLink/)
  })
  it('appears in the header but not on sign-in pages or when the feature is off', async () => {
    view = await mount(<Header accountEnabled />).render()
    expect(view.container.querySelectorAll('button[aria-haspopup="menu"]')).toHaveLength(1)
    expect(view.text()).toContain('lin@example.com')
    view.unmount()
    view = await mount(<Header accountEnabled isAuthPage />).render()
    expect(view.container.querySelector('button[aria-haspopup="menu"]')).toBeNull()
    view.unmount()
    view = await mount(<Header accountEnabled={false} />).render()
    expect(view.container.querySelector('button[aria-haspopup="menu"]')).toBeNull()
    expect(view.text()).not.toContain('lin@example.com')
  })
})
