import { describe, expect, it } from 'vitest'
import { toReleaseRecord } from './releaseApi'

describe('release API mapping', () => {
  it('maps the published asset matrix to controlled links', () => {
    const release = toReleaseRecord({ version: '0.4.0', title: 'Release', release_notes: 'Notes', published_at: '2026-08-17T00:00:00Z', assets: [
      { architecture: 'arm64', channel: 'cn', package_type: 'full_dmg', download_url: '/d/macos/arm64/cn?package_type=full_dmg' },
      { architecture: 'x86_64', channel: 'global', package_type: 'full_dmg', download_url: '/d/macos/x86_64/global?package_type=full_dmg' },
    ] })
    expect(release.downloadUrlCN).toContain('/d/macos/arm64/cn')
    expect(release.intelDownloadUrlGlobal).toContain('/d/macos/x86_64/global')
    expect(release.downloadUrl).toBe('/go/github/releases')
  })
})
