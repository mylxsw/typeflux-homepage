const releaseFiles = import.meta.glob('../content/releases/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const DEFAULT_RELEASE_LANG = 'en'
const SUPPORTED_RELEASE_LANGS = new Set(['en', 'zh-CN', 'zh-TW', 'ja', 'ko'])

export function getAllReleases(lang = DEFAULT_RELEASE_LANG) {
  return buildReleaseRecords()
    .map((release) => localizeRelease(release, lang))
    .filter(Boolean)
    .sort(sortReleasesDesc)
}

export function getLatestRelease(lang = DEFAULT_RELEASE_LANG) {
  return getAllReleases(lang)[0] || null
}

function buildReleaseRecords() {
  const releasesById = new Map()
  const localizedContents = []

  Object.entries(releaseFiles).forEach(([path, raw]) => {
    const parsedPath = parseReleasePath(path)

    if (!parsedPath) {
      return
    }

    if (parsedPath.isDefaultRelease) {
      const release = parseDefaultReleaseFile(parsedPath, raw)

      if (release) {
        releasesById.set(release.id, release)
      }
      return
    }

    const { data, content } = parseFrontmatter(raw)

    localizedContents.push({
      id: parsedPath.id,
      lang: parsedPath.lang,
      title: data.title || '',
      content: content.trim(),
    })
  })

  localizedContents.forEach(({ id, lang, title, content }) => {
    const release = releasesById.get(id)

    if (release) {
      release.contentByLang[lang] = content

      if (title) {
        release.titleByLang[lang] = title
      }
    }
  })

  return Array.from(releasesById.values())
}

function parseReleasePath(path) {
  const relativePath = path.replace(/^.*?content\/releases\//, '')
  const parts = relativePath.split('/')
  const fileName = parts.at(-1) || ''
  const folderLang = parts.length > 1 ? normalizeReleaseLang(parts[0]) : ''
  const match = fileName.match(
    /^(?<id>(?<date>\d{4}-\d{2}-\d{2})-(?<version>v[^.]+\..+?))(?:\.(?<fileLang>[A-Za-z]{2}(?:-[A-Za-z]{2})?))?\.md$/i,
  )

  if (!match?.groups) {
    return null
  }

  const fileLang = normalizeReleaseLang(match.groups.fileLang || '')
  const lang = fileLang || folderLang || DEFAULT_RELEASE_LANG

  if (!SUPPORTED_RELEASE_LANGS.has(lang)) {
    return null
  }

  return {
    id: match.groups.id,
    date: match.groups.date,
    version: match.groups.version,
    fileName,
    lang,
    isDefaultRelease: lang === DEFAULT_RELEASE_LANG && !fileLang && !folderLang,
  }
}

function parseDefaultReleaseFile(parsedPath, raw) {
  const { data, content } = parseFrontmatter(raw)
  const releaseDate = new Date(`${parsedPath.date}T00:00:00`)

  if (Number.isNaN(releaseDate.getTime())) {
    return null
  }

  return {
    id: parsedPath.id,
    fileName: parsedPath.fileName,
    date: parsedPath.date,
    version: parsedPath.version,
    title: data.title || parsedPath.version,
    content: content.trim(),
    contentByLang: {
      [DEFAULT_RELEASE_LANG]: content.trim(),
    },
    titleByLang: {
      [DEFAULT_RELEASE_LANG]: data.title || parsedPath.version,
    },
    releaseDate,
  }
}

function localizeRelease(release, lang) {
  const normalizedLang = normalizeReleaseLang(lang) || DEFAULT_RELEASE_LANG
  const content =
    release.contentByLang[normalizedLang] ||
    release.contentByLang[DEFAULT_RELEASE_LANG]

  return {
    ...release,
    title:
      release.titleByLang[normalizedLang] ||
      release.titleByLang[DEFAULT_RELEASE_LANG] ||
      release.title,
    content,
    contentLanguage: release.contentByLang[normalizedLang]
      ? normalizedLang
      : DEFAULT_RELEASE_LANG,
  }
}

function normalizeReleaseLang(lang) {
  if (!lang) {
    return ''
  }

  const normalized = lang.toLowerCase()

  if (normalized === 'zh-cn') {
    return 'zh-CN'
  }

  if (normalized === 'zh-tw') {
    return 'zh-TW'
  }

  if (normalized === 'ja' || normalized === 'jp') {
    return 'ja'
  }

  if (normalized === 'ko' || normalized === 'kr') {
    return 'ko'
  }

  if (normalized === 'en') {
    return 'en'
  }

  return ''
}

function sortReleasesDesc(a, b) {
  const dateDiff = b.releaseDate.getTime() - a.releaseDate.getTime()

  if (dateDiff !== 0) {
    return dateDiff
  }

  return b.fileName.localeCompare(a.fileName)
}

function parseFrontmatter(raw) {
  const frontmatterMatch = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)

  if (!frontmatterMatch) {
    return {
      data: {},
      content: raw,
    }
  }

  const [, frontmatter, content = ''] = frontmatterMatch
  const data = {}

  frontmatter.split('\n').forEach((line) => {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      return
    }

    const separatorIndex = trimmed.indexOf(':')

    if (separatorIndex === -1) {
      return
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')

    if (key) {
      data[key] = value
    }
  })

  return { data, content }
}
