import { useCallback, useEffect, useState } from 'react'
import { useAccountSession } from '../../contexts/AccountSessionContext.jsx'

// A 401 from any account call means the cookie is gone or revoked.
export function isSessionExpired(error) {
  return error?.status === 401 || error?.code === 'AUTH_REQUIRED' || error?.kind === 'expired_token'
}

// useAccountData loads one section. Sections fail independently, and an
// expired session flips the whole area back to the signed-out view.
export function useAccountData(load) {
  const { expire } = useAccountSession()
  const [state, setState] = useState({ status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
      .then((data) => setState({ status: 'ready', data }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (isSessionExpired(error)) expire()
        else setState({ status: 'error', data: null })
      })
    return () => controller.abort()
  }, [load, expire, attempt])

  const reload = useCallback(() => {
    setState({ status: 'loading', data: null })
    setAttempt((n) => n + 1)
  }, [])

  return { ...state, reload }
}
