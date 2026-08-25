import { LANG_CODES, localizedPath } from '../../src/lib/localePath.js'
import { PUBLIC_ROUTES } from '../../src/lib/routes.js'

// Routes that should appear in the sitemap. Billing/settings routes are
// deliberately excluded (noindex, token-gated).
export const SITEMAP_ROUTES = PUBLIC_ROUTES

// buildSitemapXml renders a sitemap where every URL lists all of its language
// alternates, as recommended for multilingual sites.
export function buildSitemapXml(origin, routes = SITEMAP_ROUTES, langs = LANG_CODES) {
  const entries = []

  for (const route of routes) {
    for (const lang of langs) {
      const loc = `${origin}${localizedPath(lang, route)}`
      const alternates = langs
        .map((code) => `      <xhtml:link rel="alternate" hreflang="${code}" href="${origin}${localizedPath(code, route)}" />`)
        .concat(`      <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${localizedPath('en', route)}" />`)
        .join('\n')

      entries.push(`  <url>\n    <loc>${loc}</loc>\n${alternates}\n  </url>`)
    }
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n')
}
