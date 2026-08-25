import { parseFrontmatter } from './releases'

// Blog posts live in src/content/blog as Markdown files:
//
//   src/content/blog/<slug>.md            default (English) post
//   src/content/blog/<lang>/<slug>.md     localized override (zh-CN, ...)
//
// Frontmatter: title, description, date (YYYY-MM-DD).
const postFiles = import.meta.glob('../content/blog/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const DEFAULT_POST_LANG = 'en'
const SUPPORTED_POST_LANGS = new Set(['en', 'zh-CN', 'zh-TW', 'ja', 'ko'])

// posts are parsed once at module load; the menu entry and the /blog routes
// only exist when at least one post is present.
const posts = buildPosts()

function buildPosts() {
  const bySlug = new Map()

  Object.entries(postFiles).forEach(([path, raw]) => {
    const parsed = parsePostPath(path)
    if (!parsed) return

    const { data, content } = parseFrontmatter(raw)
    const record = {
      slug: parsed.slug,
      lang: parsed.lang,
      title: data.title || parsed.slug,
      description: data.description || '',
      date: data.date || '',
      content: content.trim(),
    }

    if (parsed.lang === DEFAULT_POST_LANG) {
      bySlug.set(parsed.slug, { ...record, localized: new Map() })
      return
    }

    const base = bySlug.get(parsed.slug)
    if (base) {
      base.localized.set(parsed.lang, record)
    }
  })

  return Array.from(bySlug.values())
    .filter((post) => post.date)
    .sort((a, b) => b.date.localeCompare(a.date))
}

function parsePostPath(path) {
  const relativePath = path.replace(/^.*?content\/blog\//, '')
  const parts = relativePath.split('/')
  const fileName = parts.at(-1) || ''
  const slug = fileName.replace(/\.md$/i, '')
  const folderLang = parts.length > 1 ? parts[0] : DEFAULT_POST_LANG

  if (!slug || !SUPPORTED_POST_LANGS.has(folderLang)) {
    return null
  }

  return { slug, lang: folderLang }
}

function localize(post, lang) {
  const override = post.localized.get(lang)
  if (!override) return post

  return {
    ...post,
    title: override.title,
    description: override.description,
    content: override.content,
    contentLanguage: lang,
  }
}

export function hasPosts() {
  return posts.length > 0
}

export function getAllPosts(lang = DEFAULT_POST_LANG) {
  return posts.map((post) => localize(post, lang))
}

export function getPost(slug, lang = DEFAULT_POST_LANG) {
  const post = posts.find((entry) => entry.slug === slug)
  return post ? localize(post, lang) : null
}

export function getPostSlugs() {
  return posts.map((post) => post.slug)
}
