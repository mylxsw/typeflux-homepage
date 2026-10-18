/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { fetchAccountSession, logoutAccount } from '../lib/accountApi'

export const WEB_AUTH_ENABLED = import.meta.env.VITE_WEB_AUTH_ENABLED === 'true'

// Statuses: disabled (feature off or prerendering), loading, signedIn, signedOut, error.
const DISABLED = Object.freeze({ status: 'disabled', user: null, csrf: '' })
const AccountSessionContext = createContext(null)

export function AccountSessionProvider({ children, enabled = WEB_AUTH_ENABLED, load = fetchAccountSession, logout = logoutAccount }) {
  const [state, setState] = useState(() => (enabled ? { status: 'loading', user: null, csrf: '' } : DISABLED))
  const generation = useRef(0)

  // read loads the session; only the newest read may update state.
  const read = useCallback(() => {
    const current = ++generation.current
    const apply = (next) => {
      if (current === generation.current) setState(next)
      return next
    }
    return load().then(
      (session) => apply(session.authenticated
        ? { status: 'signedIn', user: session.user, csrf: session.csrf }
        : { status: 'signedOut', user: null, csrf: '' }),
      () => apply({ status: 'error', user: null, csrf: '' }),
    )
  }, [load])

  const refresh = useCallback(async () => (enabled ? read() : DISABLED), [enabled, read])

  useEffect(() => {
    if (enabled) void read()
  }, [enabled, read])

  // signOut resolves true once this browser is signed out. If the request fails
  // the session is re-read, so the UI never claims a sign-out that did not happen.
  const signOut = useCallback(async () => {
    try {
      await logout(state.csrf)
    } catch {
      return (await refresh()).status !== 'signedIn'
    }
    generation.current += 1
    setState({ status: 'signedOut', user: null, csrf: '' })
    return true
  }, [logout, refresh, state.csrf])

  // A 401 from any account call means the cookie is gone or revoked.
  const expire = useCallback(() => {
    generation.current += 1
    setState({ status: 'signedOut', user: null, csrf: '' })
  }, [])

  const value = useMemo(() => ({ ...state, refresh, signOut, expire }), [state, refresh, signOut, expire])
  return <AccountSessionContext.Provider value={value}>{children}</AccountSessionContext.Provider>
}

const noop = async () => DISABLED
const FALLBACK = Object.freeze({ ...DISABLED, refresh: noop, signOut: noop, expire: () => {} })

// Without a provider (prerendering) the account UI renders nothing.
export function useAccountSession() {
  return useContext(AccountSessionContext) || FALLBACK
}
