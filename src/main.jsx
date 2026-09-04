import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.jsx'
import { I18nProvider } from './i18n/index.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { parsePath } from './lib/localePath'
import { isPublicRoute } from './lib/routes'
import './styles/global.css'

const container = document.getElementById('root')

const app = (
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>
)

// Prerendered pages (public routes) ship with markup inside #root — hydrate
// those. Non-prerendered routes (billing/settings) may still receive the
// prerendered home page via the SPA fallback, so render fresh there instead
// of hydrating mismatched markup.
const { route } = parsePath(window.location.pathname)

if (container.hasChildNodes() && isPublicRoute(route)) {
  hydrateRoot(container, app)
} else {
  container.replaceChildren()
  createRoot(container).render(app)
}
