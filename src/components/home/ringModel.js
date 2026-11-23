// Geometry and gesture rules for the ring, following the product prototype
// (typeflux-ring-prototype.html): a 620 × 620 SVG box, slot 0 at the top,
// slots clockwise, and an outer rim that stretches toward the pointer.

export const RING = {
  BOX: 620,
  C: 310,
  R_OUT: 128,
  R_IN: 54,
  R_CENTER: 48,
  LABEL_R: 168,
  // Space the ring needs around its centre, so it moves inward near edges.
  MARGIN: 198,
  // Pointer travel (pt) after which releasing executes instead of keeping
  // the ring open (the app's rule).
  MOVE_THRESHOLD: 20,
  MAX_PULL: 46,
}

const TAU = Math.PI * 2

// Math angle (counter-clockwise from +x, y up) of slot `i` of `n`.
export function itemAngle(i, n) {
  return Math.PI / 2 - (i * TAU) / n
}

// SVG point at `radius` and math angle `angle`.
export function ringPoint(radius, angle) {
  return [RING.C + radius * Math.cos(angle), RING.C - radius * Math.sin(angle)]
}

export function wrapAngle(a) {
  let v = a
  while (v > Math.PI) v -= TAU
  while (v < -Math.PI) v += TAU
  return v
}

// Rim radius at `theta`: a Gaussian bulge of `jelly.ext` centred on `jelly.angle`.
export function outerRadius(theta, jelly) {
  if (!jelly || jelly.ext <= 0) return RING.R_OUT
  const d = wrapAngle(theta - jelly.angle)
  return RING.R_OUT + jelly.ext * Math.exp(-(d * d) / (2 * 0.3 * 0.3))
}

const f = (v) => v.toFixed(1)

export function outlinePath(jelly, steps = 144) {
  let d = ''
  for (let k = 0; k <= steps; k += 1) {
    const th = (k / steps) * TAU
    const [x, y] = ringPoint(outerRadius(th, jelly), th)
    d += `${k ? 'L' : 'M'}${f(x)} ${f(y)}`
  }
  return `${d}Z`
}

export function holePath(r) {
  const { C } = RING
  return `M${C + r} ${C}A${r} ${r} 0 1 0 ${C - r} ${C}A${r} ${r} 0 1 0 ${C + r} ${C}Z`
}

export function sectorPath(i, n, jelly, steps = 24) {
  const h = Math.PI / n
  const a0 = itemAngle(i, n) + h
  const a1 = itemAngle(i, n) - h
  let d = ''
  for (let k = 0; k <= steps; k += 1) {
    const th = a0 + ((a1 - a0) * k) / steps
    const [x, y] = ringPoint(outerRadius(th, jelly) + 1, th)
    d += `${k ? 'L' : 'M'}${f(x)} ${f(y)}`
  }
  for (let k = steps; k >= 0; k -= 1) {
    const th = a0 + ((a1 - a0) * k) / steps
    const [x, y] = ringPoint(RING.R_IN, th)
    d += `L${f(x)} ${f(y)}`
  }
  return `${d}Z`
}

// Slot under a pointer offset (dx right, dy down) from the centre, or -1
// inside the dead zone. Directions beyond the rim still select.
export function pickSlot(dx, dy, n, deadZone = RING.R_IN * 0.9) {
  if (n < 1 || !Number.isFinite(dx) || !Number.isFinite(dy)) return -1
  if (Math.hypot(dx, dy) < deadZone) return -1
  const a = Math.atan2(-dy, dx)
  const cw = (((Math.PI / 2 - a) % TAU) + TAU) % TAU
  return Math.round(cw / (TAU / n)) % n
}

// How far the rim bulges for a pointer `dist` from the centre.
export function pullFor(dist) {
  return dist > RING.R_OUT ? Math.min((dist - RING.R_OUT) * 0.45, RING.MAX_PULL) : 0
}

// One animation frame of the jelly easing toward `target`. Returns the next
// jelly and whether it is still moving.
export function stepJelly(jelly, target) {
  const da = wrapAngle(target.angle - jelly.angle)
  const rate = target.ext < jelly.ext ? 0.22 : 0.35
  const next = { angle: jelly.angle + da * 0.35, ext: jelly.ext + (target.ext - jelly.ext) * rate }
  const moving = Math.abs(target.ext - next.ext) > 0.3 || Math.abs(wrapAngle(target.angle - next.angle)) > 0.01
  return { jelly: next, moving }
}

// Keeps the ring's centre inside the stage, like the app moving it inward
// near screen edges.
export function clampCenter([x, y], width, height, margin = RING.MARGIN) {
  const cx = width < margin * 2 ? width / 2 : Math.min(Math.max(x, margin), width - margin)
  const cy = height < margin * 2 ? height / 2 : Math.min(Math.max(y, margin), height - margin)
  return [cx, cy]
}

// What releasing the trigger does: a tap keeps the ring open; after moving,
// release runs the selection, or cancels when back in the centre.
export function releaseAction({ moved, dist, selected }) {
  if (moved < RING.MOVE_THRESHOLD) return 'stay'
  if (selected >= 0 && dist >= RING.R_IN * 0.9) return 'run'
  return 'cancel'
}

// Label layout: CJK glyphs are wider. Long labels wrap to two lines.
const glyphWidth = (ch) => (/[⺀-￿]/.test(ch) ? 10.6 : 6.1)
export const textWidth = (s) => [...s].reduce((w, ch) => w + glyphWidth(ch), 0)

function fitLine(s, max) {
  if (textWidth(s) <= max) return s
  let out = ''
  for (const ch of s) {
    if (textWidth(`${out}${ch}…`) > max) break
    out += ch
  }
  return `${out}…`
}

export function labelLines(label, max = 72) {
  const s = label.trim()
  if (textWidth(s) <= max) return [s]
  // Break at the space that gives the most even pair of lines.
  let space = -1
  let best = Infinity
  for (let i = s.indexOf(' '); i > 0; i = s.indexOf(' ', i + 1)) {
    const widest = Math.max(textWidth(s.slice(0, i)), textWidth(s.slice(i + 1)))
    if (widest < best) { best = widest; space = i }
  }
  if (space > 0) return [fitLine(s.slice(0, space), max), fitLine(s.slice(space + 1), max)]
  if (/[⺀-￿]/.test(s)) {
    const cut = Math.ceil(s.length / 2)
    return [s.slice(0, cut), fitLine(s.slice(cut), max)]
  }
  return [fitLine(s, max * 1.5)]
}
