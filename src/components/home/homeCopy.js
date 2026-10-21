// Home page copy for every locale. Shortcuts, keyword names and other
// language-neutral facts live in homeModel.js so translations cannot drift
// from what the app actually ships.
import { DEFAULT_LANG } from '../../lib/localePath'
import en from './copy/en'
import ja from './copy/ja'
import ko from './copy/ko'
import zhCN from './copy/zh-CN'
import zhTW from './copy/zh-TW'

export const HOME_COPY = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
}

export function getHomeCopy(lang) {
  return HOME_COPY[lang] || HOME_COPY[DEFAULT_LANG]
}

// Replaces {name} placeholders; unknown names are left untouched.
export function formatCopy(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))
}
