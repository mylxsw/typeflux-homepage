import { useEffect } from 'react'
import { useI18n } from '../i18n/index.jsx'
import { buildSeoTags } from '../lib/seo'

const MANAGED_ATTR = 'data-seo-managed'

// Seo keeps <head> correct on routes that are not prerendered (billing) and
// after client-side language changes. Prerendered pages already ship the same
// tags statically; this component replaces them so the two never diverge.
export default function Seo({ route, page }) {
  const { lang } = useI18n()

  useEffect(() => {
    const { title, tags } = buildSeoTags(lang, route, page)

    document.title = title
    document.documentElement.lang = lang

    document.head.querySelectorAll(`[${MANAGED_ATTR}]`).forEach((el) => el.remove())

    const managed = tags.map(({ tag, attrs }) => {
      const el = document.createElement(tag)
      el.setAttribute(MANAGED_ATTR, '')
      for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, value)
      }
      return document.head.appendChild(el)
    })

    return () => managed.forEach((el) => el.remove())
  }, [lang, route, page])

  return null
}
