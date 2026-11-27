import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { trackedRedirect } from '../lib/analytics'
import { apiURL } from '../lib/api'
import { localizedPath } from '../lib/localePath'
import { fetchLatestRelease } from '../lib/releaseApi'
import { getCompareCopy } from './compareCopy'
import styles from './ReleasesPage.module.css'

const architectures = [
  { id: 'arm64', label: 'Apple Silicon' },
  { id: 'x86_64', label: 'Intel' },
]

const channels = [
  { id: 'global', label: 'releases.downloadGlobal', region: 'releases.regionGlobal' },
  { id: 'cn', label: 'releases.downloadCN', region: 'releases.regionCN' },
]

export default function ClassicDownload() {
  const { lang, t } = useI18n()
  const [release, setRelease] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchLatestRelease(controller.signal, 'classic')
      .then((result) => {
        if (!controller.signal.aborted) setRelease(result)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  if (typeof release?.version !== 'string' || !release.version.trim() || !Array.isArray(release.assets)) return null

  const groups = architectures.map(({ id, label }) => ({
    id,
    label,
    channels: channels.filter((channel) => release.assets.some((asset) =>
      asset?.platform === 'macos' && asset.architecture === id &&
      asset.package_type === 'full_dmg' && asset.channel === channel.id
    )),
  })).filter((group) => group.channels.length)

  if (!groups.length) return null

  return (
    <section className={styles.classicRelease} aria-labelledby="classic-release-title">
      <h2 id="classic-release-title" className={styles.sectionTitle}>
        Typeflux Classic {release.version.startsWith('v') ? release.version : `v${release.version}`}
      </h2>
      <div className={styles.classicDownloads}>
        {groups.map(({ id, label, channels: availableChannels }) => (
          <div key={id} className={styles.classicArchitecture}>
            <h3>{label}</h3>
            <div className={styles.classicDownloadLinks}>
              {availableChannels.map((channel) => {
                const path = `/d/macos/${id}/${channel.id}?package_type=full_dmg&product=classic`
                return (
                  <a key={channel.id} href={apiURL(path)} className="btn btn-secondary"
                    target="_blank" rel="noopener noreferrer"
                    aria-label={`${label} · ${t(channel.label)}`}
                    onClick={(event) => trackedRedirect(event, 'app_download_click', path, 'releases_classic', {
                      architecture: id, channel: channel.id, asset_version: release.version, product: 'classic',
                    })}
                  >
                    {t(channel.region)}
                  </a>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <a href={localizedPath(lang, '/compare')} className={styles.moreHistoryLink}>{getCompareCopy(lang).link}</a>
    </section>
  )
}
