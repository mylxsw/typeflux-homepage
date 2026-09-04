import { DEFAULT_LANG, LANG_CODES, localizedPath } from './localePath'
import { SITE_ORIGIN, SOCIAL_IMAGE } from './site'
import { buildStructuredData } from './structuredData'
import { getPost } from './posts'
import { getSeoCopy } from '../i18n/index.jsx'

export { SITE_ORIGIN, SOCIAL_IMAGE }

// Pages that should never appear in search results.
export const NOINDEX_PAGES = new Set(['billing'])

const STATIC_ROUTE_PAGES = {
  '/': 'home',
  '/releases': 'releases',
  '/privacy': 'privacy',
  '/terms': 'terms',
}

// resolvePageSeo maps a language-neutral route to its SEO copy. Blog posts
// take title/description from the Markdown frontmatter; everything else uses
// the i18n `seo` table. Unknown routes fall back to the home copy.
export function resolvePageSeo(lang, route) {
  const staticPage = STATIC_ROUTE_PAGES[route]
  if (staticPage) {
    return { page: staticPage, ...getSeoCopy(lang, staticPage) }
  }

  if (route === '/blog') {
    return { page: 'blog', ...getSeoCopy(lang, 'blog') }
  }

  if (route.startsWith('/blog/')) {
    const post = getPost(route.slice('/blog/'.length), lang)
    if (post) {
      return {
        page: 'article',
        title: `${post.title} — Typeflux Blog`,
        description: post.description,
        ogType: 'article',
        article: post,
      }
    }
    return { page: 'blog', ...getSeoCopy(lang, 'blog') }
  }

  if (route.startsWith('/billing') || route.startsWith('/settings')) {
    return { page: 'billing', ...getSeoCopy(lang, 'billing') }
  }

  return { page: 'home', ...getSeoCopy(lang, 'home') }
}

// buildSeoTags computes the full <head> tag set for one page in one language:
// title, description, canonical, hreflang alternates, Open Graph and Twitter
// cards, plus JSON-LD structured data. The same data feeds the client-side
// <Seo> component and the build-time prerenderer, so both stay in sync.
export function buildSeoTags(lang, route, page, { noindex = NOINDEX_PAGES.has(page), title, description, ogType = 'website', article = null } = {}) {
  const copy = getSeoCopy(lang, page)
  const resolvedTitle = title || copy.title
  const resolvedDescription = description || copy.description
  const canonicalUrl = `${SITE_ORIGIN}${localizedPath(lang, route)}`
  const tags = [
    { tag: 'meta', attrs: { name: 'description', content: resolvedDescription } },
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
    { tag: 'meta', attrs: { property: 'og:type', content: ogType } },
    { tag: 'meta', attrs: { property: 'og:url', content: canonicalUrl } },
    { tag: 'meta', attrs: { property: 'og:title', content: resolvedTitle } },
    { tag: 'meta', attrs: { property: 'og:description', content: resolvedDescription } },
    { tag: 'meta', attrs: { property: 'og:image', content: SOCIAL_IMAGE } },
    { tag: 'meta', attrs: { property: 'og:locale', content: lang.replace('-', '_') } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: resolvedTitle } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: resolvedDescription } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: SOCIAL_IMAGE } },
  )

  const jsonLd = buildStructuredData(lang, page, article)
  if (jsonLd) {
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, json: jsonLd })
  }

  return { title: resolvedTitle, tags }
}

// buildRouteSeoTags is the one-call variant used by both the client <Seo>
// component and the prerenderer: give it a route, it resolves everything.
export function buildRouteSeoTags(lang, route) {
  const resolved = resolvePageSeo(lang, route)
  return buildSeoTags(lang, route, resolved.page, {
    title: resolved.title,
    description: resolved.description,
    ogType: resolved.ogType,
    article: resolved.article,
  })
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

// renderRouteSeoTagsHtml resolves and serializes in one step.
export function renderRouteSeoTagsHtml(lang, route) {
  const resolved = resolvePageSeo(lang, route)
  return {
    title: resolved.title,
    headTags: renderSeoTagsHtml(lang, route, resolved.page, {
      title: resolved.title,
      description: resolved.description,
      ogType: resolved.ogType,
      article: resolved.article,
    }),
  }
}

export function seoTitle(lang, page) {
  return getSeoCopy(lang, page).title
}
