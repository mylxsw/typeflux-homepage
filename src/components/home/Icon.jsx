// Inline stroke icons for the home page. The bundled Material Symbols font is
// a subset, so new glyphs are drawn here instead of relying on ligatures.
const PATHS = {
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  sparkles: <><path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  ring: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v4M21 12h-4M12 21v-4M3 12h4" /></>,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  scanText: <><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M8 9h8M8 12h8M8 15h5" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="M16 10l5-3v10l-5-3" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM9 12h6M9 16h4" /></>,
  translate: <><path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5 7M11 5c-.5 3-3 6-6 8" /><path d="M13 21l4-9 4 9M14.5 18h5" /></>,
  notebook: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 3v18M12 8h4M12 12h4" /></>,
  activity: <path d="M3 12h4l3-7 4 14 3-7h4" />,
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M8 3v4M16 3v4" /></>,
  terminal: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 9l3 3-3 3M12 15h5" /></>,
  laptop: <><rect x="5" y="5" width="14" height="10" rx="1.5" /><path d="M3 19h18" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l2 2M18 5l2 2" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  check: <><path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></>,
  eyeOff: <><path d="M3 3l18 18" /><path d="M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a15.6 15.6 0 0 1-2.6 3.2M6.6 7.6C4.4 9.1 3 12 3 12s4 6 9 6a8.7 8.7 0 0 0 4.4-1.2" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  code: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />,
  phone: <><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M11 18h2" /></>,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  checkSmall: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></>,
  browser: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18M6.5 6.5h.01M9 6.5h.01" /></>,
  cursor: <path d="M5 3l14 7-6 2-2 6z" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  puzzle: <path d="M9 4h3a2 2 0 1 1 4 0h3v5a2 2 0 1 0 0 4v6h-5a2 2 0 1 0-4 0H5v-5a2 2 0 1 1 0-4V4z" />,
  plug: <><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0z" /><path d="M12 17v4" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M10 10h4v4h-4zM9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" /></>,
  grid: <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  calculator: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></>,
  book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5M8 7h7" /></>,
  smile: <><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01" /></>,
  download: <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" />,
  play: <path d="M8 5l11 7-11 7z" />,
  memory: <><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M7 7v-2M11 7v-2M15 7v-2M7 17v2M11 17v2M15 17v2" /></>,
  drive: <><rect x="3" y="8" width="18" height="9" rx="2.5" /><path d="M6 8l2-3h8l2 3M16 12.5h.01M13 12.5h.01" /></>,
  arrows: <path d="M8 20V5M4 9l4-4 4 4M16 4v15M12 15l4 4 4-4" />,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  windows: <><rect x="3" y="6" width="15" height="13" rx="2" /><path d="M7 3h12a2 2 0 0 1 2 2v10M3 10h15" /></>,
  shield: <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  speaker: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></>,
  speakerOff: <><path d="M4 9h4l5-4v14l-5-4H4z" /><path d="M17 9.5l5 5M22 9.5l-5 5" /></>,
  chevronLeft: <path d="M15 6l-6 6 6 6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  keyboard: <><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M18 10h.01M7 14h10" /></>,
  timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></>,
  pin: <path d="M9 4h6l-1 6 3 3H7l3-3zM12 13v8" />,
  wand: <path d="M4 20L15 9M14 4v3M18 6h-3M19 10l-2 .5M12 3.5L13 5.5M20 3l-1.5 1.5" />,
  sliders: <path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4" />,
  undo: <path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />,
  redo: <path d="M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3" />,
  rect: <rect x="4" y="6" width="16" height="12" rx="1.5" />,
  circle: <circle cx="12" cy="12" r="8" />,
  line: <path d="M5 19L19 5" />,
  arrowUpRight: <path d="M6 18L18 6M9 6h9v9" />,
  pen: <path d="M3 17c3-6 5 3 8-2s3-8 6-6-2 6 1 8 4-1 4-1" />,
  highlighter: <path d="M14 4l6 6-8 8H8v-4zM6 20h8M8 14l4 4" />,
  counter: <><circle cx="12" cy="12" r="8.5" /><path d="M11 8.5l1.5-1v9" /></>,
  callout: <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H10l-4 4v-4H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 9.5h8M8 12.5h5" />,
  mosaic: <path d="M4 4h5v5H4zM9 9h6v6H9zM15 4h5v5h-5zM4 15h5v5H4zM15 15h5v5h-5z" />,
  crop: <path d="M6 2v16h16M2 6h16v16" />,
  record: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" /></>,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  textT: <path d="M5 6V4h14v2M12 4v16M9 20h6" />,
  film: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" /></>,
  display: <><rect x="3" y="4" width="18" height="12" rx="1.5" /><path d="M9 20h6M12 16v4" /></>,
  windowFrame: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18" /></>,
  cloud: <path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z" />,
  sidebar: <><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M9 4v16" /></>,
  compose: <path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></>,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  battery: <><rect x="2.5" y="7" width="17" height="10" rx="2" /><path d="M22 10.5v3M5.5 10h8v4h-8z" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></>,
}

export default function Icon({ name, size = 24, className, style, strokeWidth = 1.75 }) {
  const glyph = PATHS[name]
  if (!glyph) return null
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {glyph}
    </svg>
  )
}

export function Keys({ keys, then, className }) {
  return (
    <span className={className}>
      {keys.map((key) => <kbd key={key}>{key}</kbd>)}
      {then ? <><span aria-hidden="true"> → </span><kbd>{then}</kbd></> : null}
    </span>
  )
}
