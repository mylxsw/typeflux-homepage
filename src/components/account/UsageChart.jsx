import { useEffect, useRef, useState } from 'react'
import { formatCredits } from '../billing/format'
import { FEATURES, niceMax } from './accountModel'
import styles from './Account.module.css'

const HEIGHT = 260
const PAD_LEFT = 40
const PAD_BOTTOM = 24
const PAD_TOP = 8
const GAP = 2 // surface gap between stacked segments

function shortDate(date, lang) {
  const time = Date.parse(`${date}T00:00:00`)
  if (!Number.isFinite(time)) return date
  try {
    return new Intl.DateTimeFormat(lang, { month: 'numeric', day: 'numeric' }).format(time)
  } catch {
    return date.slice(5)
  }
}

// UsageChart draws daily credits as stacked bars (voice, rewrite, ask) with a
// per-day tooltip. A table view of the same rows is offered by the caller.
export default function UsageChart({ rows, lang, labels, totalLabel }) {
  const [active, setActive] = useState(-1)
  const [width, setWidth] = useState(720)
  const container = useRef(null)
  // Draw in real pixels so axis text never stretches with the container.
  useEffect(() => {
    const node = container.current
    if (!node || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width)
      if (next > 0) setWidth(next)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const max = niceMax(Math.max(0, ...rows.map((r) => r.total)))
  const plotHeight = HEIGHT - PAD_BOTTOM - PAD_TOP
  const y = (v) => HEIGHT - PAD_BOTTOM - (v / max) * plotHeight
  const band = (width - PAD_LEFT) / Math.max(1, rows.length)
  const barWidth = Math.max(3, Math.min(28, band * 0.62))
  // Keep roughly 56px between date labels at any width.
  const labelStep = Math.max(1, Math.ceil(56 / band))
  const row = rows[active]

  return <div className={styles.chart} ref={container}>
    <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label={labels.title}>
      {[0, 1, 2, 3, 4].map((i) => {
        const value = (max / 4) * i
        return <g key={i}>
          <line className={styles.gridLine} x1={PAD_LEFT} x2={width} y1={y(value)} y2={y(value)} />
          <text className={styles.axis} x={PAD_LEFT - 8} y={y(value) + 4} textAnchor="end">{formatCredits(value, lang)}</text>
        </g>
      })}
      {rows.map((r, i) => {
        const cx = PAD_LEFT + band * i + band / 2
        let base = 0
        const segments = FEATURES.filter((f) => r[f] > 0)
        return <g key={r.date}>
          {segments.map((f, j) => {
            const y0 = y(base)
            const y1 = y(base + r[f])
            const gap = base > 0 ? GAP : 0
            const h = Math.max(0, y0 - y1 - gap)
            base += r[f]
            const top = j === segments.length - 1
            const radius = Math.min(4, h, barWidth / 2)
            // Only the top segment gets rounded data-ends; segments stay anchored to the baseline.
            const d = top
              ? `M${cx - barWidth / 2},${y1 + h} V${y1 + radius} Q${cx - barWidth / 2},${y1} ${cx - barWidth / 2 + radius},${y1} H${cx + barWidth / 2 - radius} Q${cx + barWidth / 2},${y1} ${cx + barWidth / 2},${y1 + radius} V${y1 + h} Z`
              : `M${cx - barWidth / 2},${y1} h${barWidth} v${h} h${-barWidth} Z`
            return <path key={f} d={d} className={styles[f]} style={{ fill: `var(--series-${f})` }} />
          })}
          {(i % labelStep === 0 || i === rows.length - 1) &&
            <text className={styles.axis} x={cx} y={HEIGHT - 6} textAnchor="middle">{shortDate(r.date, lang)}</text>}
          <rect className={styles.hit} x={PAD_LEFT + band * i} y={PAD_TOP} width={band} height={plotHeight} rx="6"
            tabIndex={0} aria-label={`${shortDate(r.date, lang)}: ${formatCredits(r.total, lang)}`}
            onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(-1)} onFocus={() => setActive(i)} onBlur={() => setActive(-1)} />
        </g>
      })}
    </svg>
    {row && <div className={styles.tooltip} role="status"
      style={active > rows.length / 2
        ? { right: width - (PAD_LEFT + band * active) + 8 }
        : { left: PAD_LEFT + band * (active + 1) + 8 }}>
      <strong>{shortDate(row.date, lang)}</strong>
      {FEATURES.map((f) => <div key={f} className={styles.tooltipRow}>
        <span><i className={`${styles.swatch} ${styles[f]}`} />{labels[f]}</span><b>{formatCredits(row[f], lang)}</b>
      </div>)}
      <div className={`${styles.tooltipRow} ${styles.tooltipTotal}`}><span>{totalLabel}</span><span>{formatCredits(row.total, lang)}</span></div>
    </div>}
  </div>
}
