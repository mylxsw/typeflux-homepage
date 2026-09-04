/* eslint-disable react-refresh/only-export-components */
// SSR entry for the prerenderer — never imported by the browser bundle.
import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import { I18nProvider } from './i18n/index.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { setSSRPath } from './lib/serverContext'
import { renderRouteSeoTagsHtml, SITE_ORIGIN } from './lib/seo'
import { parsePath } from './lib/localePath'
import { PUBLIC_ROUTES } from './lib/routes'
import { getPostSlugs, hasPosts } from './lib/posts'

export { SITE_ORIGIN }

// getPublicRoutes returns every language-neutral route that should be
// prerendered and listed in the sitemap. Blog routes only exist when there is
// published content.
export function getPublicRoutes() {
  if (!hasPosts()) {
    return [...PUBLIC_ROUTES]
  }

  return [...PUBLIC_ROUTES, '/blog', ...getPostSlugs().map((slug) => `/blog/${slug}`)]
}

// renderPage prerenders one localized route to static HTML fragments:
// the app markup plus the full SEO head block for that route/language.
export function renderPage(path) {
  setSSRPath(path)

  const { lang, route } = parsePath(path)
  const { title, headTags } = renderRouteSeoTagsHtml(lang, route)

  const html = renderToString(
    <ThemeProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ThemeProvider>,
  )

  return { lang, html, title, headTags }
}
