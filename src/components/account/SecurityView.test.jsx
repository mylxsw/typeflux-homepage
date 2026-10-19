// @vitest-environment jsdom
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AccountPage from './AccountPage'
import { apiError, flush, mount, routeFetch } from './testUtils'

const A = '/api/v1/auth/web/account'
let view, navigate, session

function sessionWith(patch = {}) {
  return {
    authenticated: true,
    user: { id: 'u1', email: 'lin@example.com', name: '', providers: ['password', 'google'], hasPassword: true, ...patch.user },
    csrf: 'csrf-1', persistent: true, expiresAt: 0, reauthUntil: 0, reauthProvider: '', linkableProviders: ['google', 'github'],
    ...patch,
    ...(patch.user ? { user: { id: 'u1', email: 'lin@example.com', name: '', providers: [], hasPassword: false, ...patch.user } } : {}),
  }
}
const confirmed = (patch = {}) => sessionWith({ reauthUntil: Date.now() / 1000 + 600, reauthProvider: 'password', ...patch })

beforeEach(() => {
  window.history.replaceState({}, '', '/account/security')
  navigate = vi.fn()
  session = sessionWith()
})
afterEach(() => { view?.unmount(); view = null; vi.unstubAllGlobals() })

const page = () => mount(<AccountPage route="/account/security" navigate={navigate} />, { load: vi.fn(async () => session) }).render()
const button = (text) => [...view.container.querySelectorAll('button')].find((b) => b.textContent === text)
function rowButton(provider, text) {
  const row = [...view.container.querySelectorAll('strong')].find((node) => node.textContent === provider)?.closest('div').parentElement
  const found = row?.querySelector('button')
  return found && found.textContent === text ? found : undefined
}
async function type(selector, value) {
  const input = view.container.querySelector(selector)
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
}
async function submit() {
  await act(async () => view.container.querySelector('[role="dialog"] form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  await flush()
}

describe('sign-in methods', () => {
  it('lists the password, linked and linkable providers', async () => {
    view = await page()
    expect(view.text()).toContain('Sign-in methods')
    expect(view.text()).toContain('Password set')
    expect(rowButton('Google', 'Unlink')).toBeTruthy()
    expect(rowButton('GitHub', 'Link')).toBeTruthy()
    expect(view.text()).not.toContain('Apple')
    expect(view.find('a[aria-current="page"]').textContent).toBe('Sign-in & security')
  })

  it('confirms with a password, then starts linking', async () => {
    const fetchMock = routeFetch({
      [`${A}/reauth/password`]: (path, init) => {
        if (JSON.parse(init.body).password !== 'Password1') return apiError('AUTH_INVALID_CREDENTIALS', 401)
        session = confirmed()
        return {}
      },
      [`${A}/link/github/start`]: { authorization_url: 'https://github.com/login/oauth/authorize?state=s' },
    })
    view = await page()
    await view.click(rowButton('GitHub', 'Link'))
    expect(view.find('[role="dialog"]').textContent).toContain("Confirm it's you")
    expect(view.text()).toContain('Continue with Google')
    await type('input[type="password"]', 'wrong')
    await submit()
    expect(view.find('[role="alert"]', 'Incorrect password.')).toBeTruthy()
    expect(view.text()).not.toContain('Sign in to see your account')
    await type('input[type="password"]', 'Password1')
    await submit()
    expect(navigate).toHaveBeenCalledWith('https://github.com/login/oauth/authorize?state=s')
    const start = fetchMock.mock.calls.find(([path]) => path.endsWith('/link/github/start'))
    expect(JSON.parse(start[1].body)).toEqual({ next: '/account/security' })
    expect(start[1].headers['X-CSRF-Token']).toBe('csrf-1')
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('confirms with a linked provider by leaving for the provider', async () => {
    routeFetch({ [`${A}/reauth/google/start`]: { authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth?s' } })
    window.history.replaceState({}, '', '/zh-CN/account/security')
    view = await page()
    await view.click(button('解除关联'))
    await view.click(view.find('[role="dialog"] button', '使用 Google 确认'))
    expect(navigate).toHaveBeenCalledWith('https://accounts.google.com/o/oauth2/v2/auth?s')
  })

  it('unlinks right away while confirmed, and handles an expired confirmation', async () => {
    session = confirmed({ user: { providers: ['password', 'google', 'github'], hasPassword: true } })
    routeFetch({
      [`${A}/providers/github`]: () => {
        session = confirmed({ user: { providers: ['password', 'google'], hasPassword: true } })
        return {}
      },
      // The window closed on the server between page load and the click.
      [`${A}/providers/google`]: apiError('AUTH_REAUTH_REQUIRED', 403),
    })
    view = await page()
    expect(view.find('[role="status"]', 'Identity confirmed. You can make changes until')).toBeTruthy()
    await view.click(rowButton('GitHub', 'Unlink'))
    expect(view.find('[role="status"]', 'GitHub has been unlinked.')).toBeTruthy()
    expect(rowButton('GitHub', 'Link')).toBeTruthy()
    await view.click(rowButton('Google', 'Unlink'))
    expect(view.find('[role="dialog"]')).toBeTruthy()
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })))
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('never offers to remove the only way to sign in', async () => {
    session = sessionWith({ user: { providers: ['github'], hasPassword: false }, linkableProviders: ['github'] })
    view = await page()
    expect(view.text()).toContain('This is your only way to sign in.')
    expect(rowButton('GitHub', 'Unlink').disabled).toBe(true)
    expect(view.text()).toContain('No password')
  })

  it('reports provider outcomes once and strips them from the address', async () => {
    window.history.replaceState({}, '', '/account/security?linked=google')
    view = await page()
    expect(view.find('[role="status"]', 'Google is now linked.')).toBeTruthy()
    expect(location.search).toBe('')
    view.unmount()
    window.history.replaceState({}, '', '/account/security?reauth_error=AUTH_REAUTH_MISMATCH')
    view = await page()
    expect(view.find('[role="alert"]', 'That account is not linked to this Typeflux account.')).toBeTruthy()
    view.unmount()
    window.history.replaceState({}, '', '/account/security?link_error=SOMETHING_NEW')
    view = await page()
    expect(view.find('[role="alert"]', 'Something went wrong.')).toBeTruthy()
    view.unmount()
    window.history.replaceState({}, '', '/account/security?reauth=ok')
    view = await page()
    expect(view.find('[role="status"]', 'Identity confirmed.')).toBeTruthy()
  })

  it('returns to the signed-out view when the session expires', async () => {
    session = confirmed()
    routeFetch({ [`${A}/providers/google`]: apiError('AUTH_REQUIRED', 401) })
    view = await page()
    await view.click(rowButton('Google', 'Unlink'))
    expect(view.text()).toContain('Sign in to see your account')
  })

  it('shows provider errors from actions', async () => {
    session = confirmed()
    routeFetch({ [`${A}/link/github/start`]: apiError('AUTH_PROVIDER_ALREADY_LINKED', 409) })
    view = await page()
    await view.click(rowButton('GitHub', 'Link'))
    expect(view.find('[role="alert"]', 'This provider is already linked.')).toBeTruthy()
    routeFetch({ [`${A}/reauth/google/start`]: apiError('RATE_LIMITED', 429) })
    session = sessionWith()
    view.unmount()
    view = await page()
    await view.click(rowButton('GitHub', 'Link'))
    await view.click(view.find('[role="dialog"] button', 'Continue with Google'))
    expect(view.find('[role="alert"]', 'Too many attempts.')).toBeTruthy()
  })
})

describe('account deletion', () => {
  it('confirms, requires the typed email, deletes and signs the page out', async () => {
    session = confirmed()
    const fetchMock = routeFetch({ [`${A}/delete`]: { deleted: true } })
    view = await page()
    await view.click(button('Delete account…'))
    const dialog = view.find('[role="dialog"]')
    expect(dialog.textContent).toContain('Type lin@example.com to confirm.')
    const confirmButton = () => button('Permanently delete')
    expect(confirmButton().disabled).toBe(true)
    await type('[role="dialog"] input[type="email"]', 'someone@example.com')
    expect(confirmButton().disabled).toBe(true)
    await type('[role="dialog"] input[type="email"]', ' LIN@example.com ')
    expect(confirmButton().disabled).toBe(false)
    await submit()
    const call = fetchMock.mock.calls.find(([path]) => path.endsWith('/delete'))
    expect(JSON.parse(call[1].body)).toEqual({ email: 'LIN@example.com' })
    expect(view.text()).toContain('Your account has been deleted')
    expect(view.find('a', 'Back to home').getAttribute('href')).toBe('/')
  })

  it('asks Apple accounts to confirm with Apple, even after a password confirmation', async () => {
    session = confirmed({ user: { providers: ['password', 'apple'], hasPassword: true }, linkableProviders: ['apple'] })
    routeFetch({ [`${A}/reauth/apple/start`]: { authorization_url: 'https://appleid.apple.com/auth/authorize?x' } })
    view = await page()
    await view.click(button('Delete account…'))
    const dialog = view.find('[role="dialog"]')
    expect(dialog.textContent).toContain('confirm with Apple')
    expect(dialog.querySelector('input[type="password"]')).toBeNull()
    await view.click(view.find('[role="dialog"] button', 'Continue with Apple'))
    expect(navigate).toHaveBeenCalledWith('https://appleid.apple.com/auth/authorize?x')
  })

  it('explains when Apple confirmation is not available on the website', async () => {
    session = confirmed({ user: { providers: ['password', 'apple'], hasPassword: true }, linkableProviders: [] })
    view = await page()
    await view.click(button('Delete account…'))
    expect(view.find('[role="dialog"] [role="alert"]', 'Confirm with Apple to delete this account.')).toBeTruthy()
  })

  it('asks again when the confirmation was used up, and reports other failures', async () => {
    session = confirmed()
    let answer = apiError('AUTH_REAUTH_REQUIRED', 403)
    routeFetch({ [`${A}/delete`]: () => answer })
    view = await page()
    await view.click(button('Delete account…'))
    await type('[role="dialog"] input[type="email"]', 'lin@example.com')
    await submit()
    expect(view.find('[role="dialog"]').textContent).toContain("Confirm it's you")
    expect(view.find('[role="alert"]', "Please confirm it's you again.")).toBeTruthy()
    await view.click(button('Cancel'))
    answer = apiError('BILLING_DELETE_FAILED', 502)
    await view.click(button('Delete account…'))
    await type('[role="dialog"] input[type="email"]', 'lin@example.com')
    await submit()
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
    expect(view.find('[role="alert"]', 'Your subscription could not be cancelled')).toBeTruthy()
    await view.click(button('Delete account…'))
    await act(async () => view.find('[role="dialog"]').parentElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })))
    expect(view.container.querySelector('[role="dialog"]')).toBeNull()
  })
})
