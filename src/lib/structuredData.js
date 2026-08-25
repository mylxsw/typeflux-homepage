import { getFaqItems, getSeoCopy } from '../i18n/index.jsx'
import { localizedPath } from './localePath'
import { SITE_LOGO, SITE_ORIGIN, SOCIAL_IMAGE } from './site'

// buildStructuredData returns the JSON-LD @graph for a page, or null when the
// page carries no structured data. Only the home page gets the full graph —
// inner pages keep their meta tags but stay out of the rich-result game.
export function buildStructuredData(lang, page) {
  if (page !== 'home') {
    return null
  }

  const copy = getSeoCopy(lang, 'home')
  const homeUrl = `${SITE_ORIGIN}${localizedPath(lang, '/')}`

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: 'Typeflux',
      url: SITE_ORIGIN,
      logo: SITE_LOGO,
      sameAs: [
        'https://github.com/mylxsw/typeflux',
        'https://x.com/mylxsw',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_ORIGIN}/#website`,
      name: 'Typeflux',
      url: SITE_ORIGIN,
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Typeflux',
      url: homeUrl,
      description: copy.description,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'macOS',
      inLanguage: lang,
      isAccessibleForFree: true,
      license: 'https://www.gnu.org/licenses/agpl-3.0.html',
      image: SOCIAL_IMAGE,
      downloadUrl: `${SITE_ORIGIN}${localizedPath(lang, '/releases')}`,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    },
  ]

  const faqItems = getFaqItems(lang)
  if (faqItems.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}
