/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore } from 'react'

const ThemeContext = createContext()

const STORAGE_KEY = 'typeflux-theme'
const DEFAULT_THEME = 'dark'
const subscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export function ThemeProvider({ children }) {
  // The boot script applies the preferred colors before paint. Keep the
  // React markup on the server theme until hydration attaches to it.
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const [preferredTheme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_THEME
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const isReady = true

  useEffect(() => {
    if (isReady) {
      document.documentElement.setAttribute('data-theme', preferredTheme)
      localStorage.setItem(STORAGE_KEY, preferredTheme)
    }
  }, [preferredTheme, isReady])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const setLightTheme = useCallback(() => setTheme('light'), [])
  const setDarkTheme = useCallback(() => setTheme('dark'), [])

  const theme = hydrated ? preferredTheme : DEFAULT_THEME

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setLightTheme, setDarkTheme, isReady }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
