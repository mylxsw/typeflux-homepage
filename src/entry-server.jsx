/* eslint-disable react-refresh/only-export-components */
// SSR entry for the prerenderer — never imported by the browser bundle.
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { I18nProvider } from './i18n/index.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { setSSRPath } from './lib/serverContext'
import { renderSeoTagsHtml, seoTitle, SITE_ORIGIN } from './lib/seo'
import { parsePath } from './lib/localePath'

export { SITE_ORIGIN }

// renderPage prerenders one localized route to static HTML fragments:
// the app markup plus the full SEO head block for that route/language.
export function renderPage(path) {
  setSSRPath(path)

  const { lang, route } = parsePath(path)
  const page = pageForRoute(route)

  const html = renderToString(
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>,
  )

  return {
    lang,
    html,
    title: seoTitle(lang, page),
    headTags: renderSeoTagsHtml(lang, route, page),
  }
}

function pageForRoute(route) {
  switch (route) {
    case '/releases':
      return 'releases'
    case '/privacy':
      return 'privacy'
    case '/terms':
      return 'terms'
    default:
      return 'home'
  }
}
