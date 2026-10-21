import { getFaqItems, getSeoCopy } from '../i18n/index.jsx'
import { getHomeCopy } from '../components/home/homeCopy'
import { ENTRANCES, MORE_TOOLS, REPLACES } from '../components/home/homeModel'
import { localizedPath } from './localePath'
import { SITE_LOGO, SITE_ORIGIN, SOCIAL_IMAGE } from './site'

// buildStructuredData returns the JSON-LD @graph for a page, or null when the
// page carries no structured data. The home page gets the full graph; blog
// posts get a BlogPosting node; other inner pages keep their meta tags but
// stay out of the rich-result game.
export function buildStructuredData(lang, page, article = null) {
  if (page === 'article' && article) {
    return {
      '@context': 'https://schema.org',
      '@graph': [buildBlogPosting(lang, article)],
    }
  }

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
      applicationSubCategory: 'Productivity',
      operatingSystem: 'macOS 13 or later',
      softwareRequirements: 'macOS 13 or later, Apple silicon or Intel',
      keywords: buildKeywords(lang),
      inLanguage: lang,
      featureList: buildFeatureList(lang),
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

// Search terms for the app: the entry points and the categories it replaces.
export function buildKeywords(lang) {
  const copy = getHomeCopy(lang)
  return [
    ...ENTRANCES.map(({ id }) => copy.entrances.items[id].name),
    ...REPLACES.map((id) => copy.replaces.items[id]),
    'macOS',
  ].join(', ')
}

// The entry points and smaller tools, in the page language, as "Name: description".
export function buildFeatureList(lang) {
  const copy = getHomeCopy(lang)
  return [
    ...ENTRANCES.map(({ id }) => `${copy.entrances.items[id].name}: ${copy.entrances.items[id].desc}`),
    ...MORE_TOOLS.map(({ id }) => `${copy.more.items[id].name}: ${copy.more.items[id].desc}`),
  ]
}

function buildBlogPosting(lang, post) {
  const postUrl = `${SITE_ORIGIN}${localizedPath(lang, `/blog/${post.slug}`)}`

  return {
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: post.contentLanguage || lang,
    url: postUrl,
    mainEntityOfPage: postUrl,
    image: post.image || SOCIAL_IMAGE,
    author: { '@id': `${SITE_ORIGIN}/#organization` },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: 'Typeflux',
      url: SITE_ORIGIN,
      logo: SITE_LOGO,
    },
  }
}
