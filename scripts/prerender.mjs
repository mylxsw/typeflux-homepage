// Prerenders every public route in every language to static HTML.
// Runs after `vite build` (client) and `vite build --ssr` (server bundle):
//
//   vite build && vite build --ssr src/entry-server.jsx --outDir dist-ssr && node scripts/prerender.mjs
//
// Output: dist/<lang-prefix?>/<route>/index.html per page, plus dist/sitemap.xml.
// Cloudflare Workers static assets serve these files directly; the SPA
// fallback in _routes.json only kicks in for non-prerendered (billing) routes.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { LANG_CODES, localizedPath } from '../src/lib/localePath.js'
import { buildSitemapXml } from './lib/sitemap.mjs'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(rootDir, 'dist')

const { renderPage, getPublicRoutes, SITE_ORIGIN } = await import(
  pathToFileURL(path.join(rootDir, 'dist-ssr', 'entry-server.js')).href
)

// Routes come from the SSR bundle because blog routes depend on the Markdown
// content globbed by Vite — plain Node cannot resolve import.meta.glob.
const routes = getPublicRoutes()

const template = await readFile(path.join(distDir, 'index.html'), 'utf8')

if (!template.includes('<!--app-html-->') || !template.includes('<!--seo-tags-->')) {
  throw new Error('dist/index.html is missing prerender placeholders — did index.html change?')
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

let pageCount = 0

for (const route of routes) {
  for (const lang of LANG_CODES) {
    const publicPath = localizedPath(lang, route)
    const { lang: renderedLang, html, title, headTags } = renderPage(publicPath)

    const page = template
      .replace('<html lang="en">', `<html lang="${renderedLang}">`)
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
      .replace('<!--seo-tags-->', headTags)
      .replace('<!--app-html-->', html)

    const outFile = publicPath === '/'
      ? path.join(distDir, 'index.html')
      : path.join(distDir, ...publicPath.split('/').filter(Boolean), 'index.html')

    await mkdir(path.dirname(outFile), { recursive: true })
    await writeFile(outFile, page)
    pageCount++
  }
}

await writeFile(path.join(distDir, 'sitemap.xml'), buildSitemapXml(SITE_ORIGIN, routes))

console.log(`Prerendered ${pageCount} pages (${routes.length} routes × ${LANG_CODES.length} languages) + sitemap.xml`)
