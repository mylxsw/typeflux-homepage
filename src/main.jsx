import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { I18nProvider } from './i18n/index.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { parsePath } from './lib/localePath'
import { isPublicRoute } from './lib/routes'
import { captureAuthTransaction } from './lib/authNavigation'
import { captureHandoff, HANDOFF_ROUTE } from './lib/accountNavigation'
import { AccountSessionProvider } from './contexts/AccountSessionContext.jsx'
import './styles/global.css'

const container = document.getElementById('root')
captureAuthTransaction()
// Strip an App handoff code from the URL before React or any script reads it.
if (parsePath(window.location.pathname).route === HANDOFF_ROUTE) captureHandoff()

const app = (
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <AccountSessionProvider>
          <App />
        </AccountSessionProvider>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>
)

// Prerendered pages (public routes) ship with markup inside #root — hydrate
// those. Non-prerendered routes (billing/settings) may still receive the
// prerendered home page via the SPA fallback, so render fresh there instead
// of hydrating mismatched markup.
const { route } = parsePath(window.location.pathname)

// The development template contains only an HTML comment, not prerendered UI.
if (container.childElementCount > 0 && isPublicRoute(route)) {
  hydrateRoot(container, app)
} else {
  container.replaceChildren()
  createRoot(container).render(app)
}
