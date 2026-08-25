import Header from './components/Header'
import Hero from './components/Hero'
import SpeedSection from './components/SpeedSection'
import Features from './components/Features'
import Agent from './components/Agent'
import Personas from './components/Personas'
import Privacy from './components/Privacy'
import Faq from './components/Faq'
import OpenSource from './components/OpenSource'
import CTA from './components/CTA'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import ReleasesPage from './components/ReleasesPage'
import TermsOfServicePage from './components/TermsOfServicePage'
import BillingResultPage from './components/BillingResultPage'
import BillingPlansPage from './components/BillingPlansPage'
import BlogIndexPage from './components/BlogIndexPage'
import BlogPostPage from './components/BlogPostPage'
import Seo from './components/Seo'
import { useEffect } from 'react'
import { trackPageView } from './lib/analytics'
import { parsePath } from './lib/localePath'
import { getPathname } from './lib/serverContext'

export default function App() {
  const { route } = parsePath(getPathname())
  const isPrivacyPage = route === '/privacy'
  const isReleasesPage = route === '/releases'
  const isTermsPage = route === '/terms'
  const isBlogIndexPage = route === '/blog'
  const blogSlug = route.startsWith('/blog/') ? route.slice('/blog/'.length) : null
  const isBillingPlansPage = route === '/billing/plans'
  const billingPageType = getBillingPageType(route)

  useEffect(() => {
    trackPageView()
    const handleConsent = () => trackPageView()
    window.addEventListener('typeflux:analytics-consent-changed', handleConsent)
    return () => window.removeEventListener('typeflux:analytics-consent-changed', handleConsent)
  }, [route])

  if (isPrivacyPage) {
    return (
      <>
        <Seo route="/privacy" />
        <Header isPrivacyPage={true} />
        <PrivacyPolicyPage />
        <Footer isPrivacyPage={true} />
        <CookieConsent />
      </>
    )
  }

  if (isReleasesPage) {
    return (
      <>
        <Seo route="/releases" />
        <Header isReleasePage={true} />
        <ReleasesPage />
        <Footer isReleasePage={true} />
        <CookieConsent />
      </>
    )
  }

  if (isTermsPage) {
    return (
      <>
        <Seo route="/terms" />
        <Header isTermsPage={true} />
        <TermsOfServicePage />
        <Footer isTermsPage={true} />
        <CookieConsent />
      </>
    )
  }

  if (isBlogIndexPage) {
    return (
      <>
        <Seo route="/blog" />
        <Header isBlogPage={true} />
        <BlogIndexPage />
        <Footer isBlogPage={true} />
        <CookieConsent />
      </>
    )
  }

  if (blogSlug) {
    return (
      <>
        <Seo route={route} />
        <Header isBlogPage={true} />
        <BlogPostPage slug={blogSlug} />
        <Footer isBlogPage={true} />
        <CookieConsent />
      </>
    )
  }

  if (isBillingPlansPage) {
    return (
      <>
        <Seo route="/billing/plans" />
        <Header isBillingPage={true} />
        <BillingPlansPage />
        <Footer isBillingPage={true} />
        <CookieConsent />
      </>
    )
  }

  if (billingPageType) {
    return (
      <>
        <Seo route={route} />
        <Header isBillingPage={true} />
        <BillingResultPage type={billingPageType} />
        <Footer isBillingPage={true} />
        <CookieConsent />
      </>
    )
  }

  return (
    <>
      <Seo route="/" />
      <Header />
      <main>
        <Hero />
        <SpeedSection />
        <Features />
        <Agent />
        <Personas />
        <Privacy />
        <Faq />
        <OpenSource />
        <CTA />
      </main>
      <Footer />
      <CookieConsent />
    </>
  )
}

function getBillingPageType(route) {
  if (route === '/billing/success') {
    return 'success'
  }

  if (route === '/billing/cancel') {
    return 'cancel'
  }

  if (route === '/settings/billing') {
    return 'portal'
  }

  return null
}
