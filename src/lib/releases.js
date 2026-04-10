const releaseFiles = import.meta.glob('../content/releases/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

export function getAllReleases() {
  return Object.entries(releaseFiles)
    .map(([path, raw]) => parseReleaseFile(path, raw))
    .filter(Boolean)
    .sort(sortReleasesDesc)
}

export function getLatestRelease() {
  return getAllReleases()[0] || null
}

function parseReleaseFile(path, raw) {
  const fileName = path.split('/').pop() || ''
  const match = fileName.match(/^(?<date>\d{4}-\d{2}-\d{2})-(?<version>v[^.]+\..+)\.md$/i)

  if (!match?.groups) {
    return null
  }

  const { data, content } = parseFrontmatter(raw)
  const releaseDate = new Date(`${match.groups.date}T00:00:00`)

  if (Number.isNaN(releaseDate.getTime())) {
    return null
  }

  return {
    id: fileName.replace(/\.md$/i, ''),
    fileName,
    date: match.groups.date,
    version: match.groups.version,
    title: data.title || match.groups.version,
    downloadUrl: data.download_url || '',
    content: content.trim(),
    releaseDate,
  }
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
