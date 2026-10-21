import { useId } from 'react'
import Icon from './Icon'
import { RING_ACTIONS } from './homeModel'
import {
  RING,
  holePath,
  itemAngle,
  labelLines,
  outerRadius,
  outlinePath,
  ringPoint,
  sectorPath,
  textWidth,
} from './ringModel'

const { BOX, C, R_OUT, R_IN, R_CENTER, LABEL_R } = RING

// The ring as the app draws it (frosted style): a dark glass annulus whose
// rim stretches toward the pointer, hairline separators, a warm glow on the
// selected sector, icons inside and label pills outside.
export default function RingDial({ labels, centerTitle, centerSub, selected = -1, jelly, flash = false, className, style }) {
  const n = RING_ACTIONS.length
  // Gradient ids must be unique per ring; useId's punctuation is not valid in url().
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const outline = outlinePath(jelly)
  const ref = (name) => `url(#${uid}${name})`

  return (
    <svg className={className} style={style} viewBox={`0 0 ${BOX} ${BOX}`} width={BOX} height={BOX} aria-hidden="true">
      <defs>
        <radialGradient id={`${uid}hl`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgb(238,146,87)" stopOpacity=".62" />
          <stop offset=".55" stopColor="rgb(184,110,87)" stopOpacity=".28" />
          <stop offset="1" stopColor="rgb(184,110,87)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}vio`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgb(161,122,184)" stopOpacity=".5" />
          <stop offset="1" stopColor="rgb(186,117,150)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${uid}rim`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".05" />
          <stop offset="1" stopColor="#fff" stopOpacity=".12" />
        </linearGradient>
        <clipPath id={`${uid}clip`}>
          <path d={`${outline} ${holePath(R_IN)}`} clipRule="evenodd" />
        </clipPath>
        <filter id={`${uid}sh`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000" floodOpacity=".45" />
        </filter>
      </defs>

      <path d={`${outline} ${holePath(R_IN)}`} fillRule="evenodd" fill="rgba(26,26,30,.6)" filter={ref('sh')} />
      <g clipPath={ref('clip')}>
        {jelly && jelly.ext > 2 ? (() => {
          const [fx, fy] = ringPoint(R_OUT + jelly.ext * 0.58, jelly.angle)
          return <circle cx={fx} cy={fy} r="115" fill={ref('vio')} />
        })() : null}
        {selected >= 0 ? (() => {
          const [hx, hy] = ringPoint((R_IN + R_OUT) / 2 + 6, itemAngle(selected, n))
          return (
            <>
              <path data-highlight="" d={sectorPath(selected, n, jelly)} fill="rgba(255,190,120,.07)" />
              <circle cx={hx} cy={hy} r={flash ? 150 : 110} fill={ref('hl')} />
            </>
          )
        })() : null}
        {RING_ACTIONS.map((action, i) => {
          const a = itemAngle(i, n) + Math.PI / n
          const [x1, y1] = ringPoint(R_IN, a)
          const [x2, y2] = ringPoint(outerRadius(a, jelly), a)
          return <line key={action.id} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.1)" />
        })}
      </g>
      <path d={outline} fill="none" stroke={ref('rim')} />
      <circle cx={C} cy={C} r={R_IN} fill="none" stroke="rgba(255,255,255,.12)" />
      <circle cx={C} cy={C} r={R_CENTER} fill="rgba(30,30,34,.78)" stroke="rgba(255,255,255,.1)" />
      <text x={C} y={C + 1} textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">{centerTitle}</text>
      {centerSub ? <text x={C} y={C + 17} textAnchor="middle" fill="rgba(255,255,255,.53)" fontSize="8" letterSpacing="1">{centerSub}</text> : null}

      {RING_ACTIONS.map((action, i) => {
        const angle = itemAngle(i, n)
        const on = i === selected
        const [ix, iy] = ringPoint((R_IN + R_OUT) / 2 + 4 + (on ? 3 : 0), angle)
        const size = on ? 30 : 26
        const lines = labelLines(labels[action.id])
        const [lx, ly] = ringPoint(LABEL_R, angle)
        const w = Math.max(...lines.map(textWidth)) + 14
        const h = lines.length * 13 + 8
        return (
          <g key={action.id} data-slot={action.id} data-on={on || undefined}>
            <g transform={`translate(${ix - size / 2} ${iy - size / 2})`} color={on ? '#FFC457' : 'rgba(255,255,255,.88)'}>
              <Icon name={action.icon} size={size} strokeWidth={1.7} />
            </g>
            <g transform={`translate(${lx} ${ly})`}>
              <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="6" fill={on ? 'rgba(58,44,24,.95)' : 'rgba(24,24,26,.82)'} stroke="rgba(255,255,255,.06)" />
              {lines.map((line, k) => (
                <text key={line} x="0" y={-h / 2 + 15 + k * 13} textAnchor="middle" fontSize="10.5" fill={on ? '#FFC457' : 'rgba(255,255,255,.72)'} fontWeight={on ? 600 : 500}>{line}</text>
              ))}
            </g>
          </g>
        )
      })}
    </svg>
  )
}
