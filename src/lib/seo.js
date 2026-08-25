import { DEFAULT_LANG, LANG_CODES, localizedPath } from './localePath'
import { SITE_ORIGIN, SOCIAL_IMAGE } from './site'
import { buildStructuredData } from './structuredData'
import { getSeoCopy } from '../i18n/index.jsx'

export { SITE_ORIGIN, SOCIAL_IMAGE }

// Pages that should never appear in search results.
export const NOINDEX_PAGES = new Set(['billing'])

// buildSeoTags computes the full <head> tag set for one page in one language:
// title, description, canonical, hreflang alternates, Open Graph and Twitter
// cards, plus JSON-LD structured data. The same data feeds the client-side
// <Seo> component and the build-time prerenderer, so both stay in sync.
export function buildSeoTags(lang, route, page, { noindex = NOINDEX_PAGES.has(page) } = {}) {
  const copy = getSeoCopy(lang, page)
  const canonicalUrl = `${SITE_ORIGIN}${localizedPath(lang, route)}`
  const tags = [
    { tag: 'meta', attrs: { name: 'description', content: copy.description } },
    { tag: 'link', attrs: { rel: 'canonical', href: canonicalUrl } },
  ]

  if (noindex) {
    tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' } })
  }

  for (const code of LANG_CODES) {
    tags.push({
      tag: 'link',
      attrs: { rel: 'alternate', hreflang: code, href: `${SITE_ORIGIN}${localizedPath(code, route)}` },
    })
  }

  tags.push({
    tag: 'link',
    attrs: { rel: 'alternate', hreflang: 'x-default', href: `${SITE_ORIGIN}${localizedPath(DEFAULT_LANG, route)}` },
  })

  tags.push(
    { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
    { tag: 'meta', attrs: { property: 'og:url', content: canonicalUrl } },
    { tag: 'meta', attrs: { property: 'og:title', content: copy.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: copy.description } },
    { tag: 'meta', attrs: { property: 'og:image', content: SOCIAL_IMAGE } },
    { tag: 'meta', attrs: { property: 'og:locale', content: lang.replace('-', '_') } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: copy.title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: copy.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: SOCIAL_IMAGE } },
  )

  const jsonLd = buildStructuredData(lang, page)
  if (jsonLd) {
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, json: jsonLd })
  }

  return { title: copy.title, tags }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// serializeJsonLd keeps the JSON valid inside HTML: "<" is escaped so a
// literal "</script>" in any string can never terminate the tag early.
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

// renderSeoTagsHtml serializes the tag set for the prerenderer. The <title> is
// handled separately by replacing the template's existing <title> element.
// Each tag carries data-seo-managed so the client-side <Seo> component can
// replace the static copies on hydration instead of duplicating them.
export function renderSeoTagsHtml(lang, route, page, options) {
  const { tags } = buildSeoTags(lang, route, page, options)

  return tags
    .map(({ tag, attrs, json }) => {
      const attrString = Object.entries(attrs)
        .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
        .join(' ')

      if (tag === 'script') {
        return `  <script ${attrString} data-seo-managed="">${serializeJsonLd(json)}</script>`
      }

      return `  <${tag} ${attrString} data-seo-managed="" />`
    })
    .join('\n')
}

export function seoTitle(lang, page) {
  return getSeoCopy(lang, page).title
}
