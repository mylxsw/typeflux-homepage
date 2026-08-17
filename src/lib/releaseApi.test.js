import { describe, expect, it } from 'vitest'
import { mergeReleaseDownloads, toReleaseDownloadInfo } from './releaseApi'

describe('release API mapping', () => {
  it('maps only the published asset matrix to controlled links', () => {
    const release = toReleaseDownloadInfo({ version: '0.4.0', title: 'API title', release_notes: 'API notes', published_at: '2026-08-17T00:00:00Z', assets: [
      { architecture: 'arm64', channel: 'cn', package_type: 'full_dmg', download_url: '/d/macos/arm64/cn?package_type=full_dmg' },
      { architecture: 'x86_64', channel: 'global', package_type: 'full_dmg', download_url: '/d/macos/x86_64/global?package_type=full_dmg' },
    ] })
    expect(release.downloadUrlCN).toContain('/d/macos/arm64/cn')
    expect(release.intelDownloadUrlGlobal).toContain('/d/macos/x86_64/global')
    expect(release.downloadUrl).toBe('/go/github/releases')
    expect(release).not.toHaveProperty('title')
    expect(release).not.toHaveProperty('content')
    expect(release).not.toHaveProperty('releaseDate')
    expect(release).not.toHaveProperty('release_notes')
    expect(release).not.toHaveProperty('published_at')
  })

  it('adds API download links without replacing page release content', () => {
    const localRelease = {
      id: '2026-08-17-v0.4.0',
      version: 'v0.4.0',
      title: 'Page title',
      content: 'Page release notes',
      releaseDate: new Date('2026-08-17T00:00:00Z'),
      downloadUrlCN: '/fallback',
    }
    const downloads = toReleaseDownloadInfo({
      version: '0.4.0',
      title: 'API title',
      release_notes: 'API notes',
      published_at: '2026-08-18T00:00:00Z',
      assets: [
        { architecture: 'arm64', channel: 'cn', package_type: 'full_dmg', download_url: '/api-download' },
      ],
    })

    const [release] = mergeReleaseDownloads([localRelease], downloads)

    expect(release).toMatchObject({
      id: localRelease.id,
      version: localRelease.version,
      title: localRelease.title,
      content: localRelease.content,
      releaseDate: localRelease.releaseDate,
      downloadUrlCN: '/api-download',
    })
  })

  it('does not create a release when the API version has no page content', () => {
    const localReleases = [{ version: 'v0.3.0', content: 'Page release notes' }]

    const releases = mergeReleaseDownloads(localReleases, {
      version: '0.4.0',
      downloadUrlCN: '/api-download',
    })

    expect(releases).toEqual(localReleases)
  })
})
