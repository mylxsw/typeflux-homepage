import { describe, expect, it } from 'vitest'
import { getLatestRelease } from './releases'

describe('published release content', () => {
  it('shows 1.0.0 first in every supported language', () => {
    for (const lang of ['en', 'zh-CN', 'zh-TW', 'ja', 'ko']) {
      const release = getLatestRelease(lang)
      expect(release.version).toBe('v1.0.0')
      expect(release.contentLanguage).toBe(lang)
      expect(release.content).toContain('## ')
    }
  })

  it('offers the published Apple Silicon and Intel installers for 1.0.0', () => {
    const release = getLatestRelease('zh-CN')
    expect(release.downloadUrlGlobal).toContain('/v1.0.0/Typeflux-full-apple-silicon.dmg')
    expect(release.intelDownloadUrlGlobal).toContain('/v1.0.0/Typeflux-full-intel.dmg')
  })
})
