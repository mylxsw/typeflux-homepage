import { describe, expect, it } from 'vitest'
import { getLatestRelease } from './releases'

describe('published release content', () => {
  it('shows 0.4.0 first in every supported language', () => {
    for (const lang of ['en', 'zh-CN', 'zh-TW', 'ja', 'ko']) {
      const release = getLatestRelease(lang)
      expect(release.version).toBe('v0.4.0')
      expect(release.contentLanguage).toBe(lang)
      expect(release.content).toContain('## ')
    }
  })

  it('offers the published Apple Silicon and Intel installers while the API is still on 0.3.0', () => {
    const release = getLatestRelease('zh-CN')
    expect(release.downloadUrlGlobal).toContain('/v0.4.0/Typeflux-pre-release-full-apple-silicon.dmg')
    expect(release.intelDownloadUrlGlobal).toContain('/v0.4.0/Typeflux-pre-release-full-intel.dmg')
    expect(release.content).not.toContain('词库与人设云同步')
  })
})
