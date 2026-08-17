import { apiURL } from './analytics'

export async function fetchLatestRelease(signal) {
  const response = await fetch(apiURL('/api/v1/app/releases/latest'), { headers: { Accept: 'application/json' }, signal })
  if (!response.ok) throw new Error(`Latest release request failed (${response.status})`)
  const envelope = await response.json()
  if (envelope.code !== 'OK' || !envelope.data) throw new Error(envelope.message || 'Latest release is unavailable')
  return envelope.data
}

export function toReleaseRecord(release) {
  const asset = (architecture, channel) => release.assets?.find((item) => item.architecture === architecture && item.channel === channel && item.package_type === 'full_dmg')
  return {
    id: `api-${release.version}`, version: release.version, title: release.title,
    content: release.release_notes || '', releaseDate: new Date(release.published_at),
    downloadUrl: '/go/github/releases',
    downloadUrlCN: asset('arm64', 'cn')?.download_url || '',
    downloadUrlGlobal: asset('arm64', 'global')?.download_url || '',
    intelDownloadUrlCN: asset('x86_64', 'cn')?.download_url || '',
    intelDownloadUrlGlobal: asset('x86_64', 'global')?.download_url || '',
  }
}
