// URL-based language routing helpers.
// English lives at the root (`/releases`), other languages use a path prefix
// (`/zh-CN/releases`). Keeping every language on its own URL is what makes the
// site indexable per language and enables hreflang alternates.

export const DEFAULT_LANG = 'en'

export const LANG_CODES = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko']

const NON_DEFAULT_LANGS = LANG_CODES.filter((code) => code !== DEFAULT_LANG)

// Matches a leading language prefix, e.g. `/zh-CN/releases` or `/ja`.
const LANG_PREFIX_RE = new RegExp(`^/(${NON_DEFAULT_LANGS.join('|')})(?=/|$)`, 'i')

export function isSupportedLang(code) {
  return LANG_CODES.includes(code)
}

// parsePath splits a pathname into its language and the language-neutral route.
// `/zh-CN/releases` -> { lang: 'zh-CN', route: '/releases' }
// `/releases`       -> { lang: 'en', route: '/releases' }
export function parsePath(pathname) {
  const normalized = normalizePathname(pathname)
  const match = normalized.match(LANG_PREFIX_RE)

  if (!match) {
    return { lang: DEFAULT_LANG, route: normalized }
  }

  const lang = LANG_CODES.find((code) => code.toLowerCase() === match[1].toLowerCase())
  const rest = normalized.slice(match[0].length)

  return { lang, route: normalizePathname(rest) }
}

// localizedPath builds the public URL path for a route in a given language.
// ('zh-CN', '/releases') -> '/zh-CN/releases'
// ('en', '/releases')    -> '/releases'
export function localizedPath(lang, route = '/') {
  const normalizedRoute = normalizePathname(route)
  const code = isSupportedLang(lang) ? lang : DEFAULT_LANG

  if (code === DEFAULT_LANG) {
    return normalizedRoute
  }

  return normalizedRoute === '/' ? `/${code}` : `/${code}${normalizedRoute}`
}

function normalizePathname(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return '/'
  }

  const withoutQuery = pathname.split(/[?#]/)[0]
  const collapsed = withoutQuery.replace(/\/{2,}/g, '/')
  const trimmed = collapsed.replace(/\/+$/, '')

  if (!trimmed) {
    return '/'
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}
