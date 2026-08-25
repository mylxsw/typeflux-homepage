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
        <Seo route="/privacy" page="privacy" />
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
        <Seo route="/releases" page="releases" />
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
        <Seo route="/terms" page="terms" />
        <Header isTermsPage={true} />
        <TermsOfServicePage />
        <Footer isTermsPage={true} />
        <CookieConsent />
      </>
    )
  }

  if (isBillingPlansPage) {
    return (
      <>
        <Seo route="/billing/plans" page="billing" />
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
        <Seo route={route} page="billing" />
        <Header isBillingPage={true} />
        <BillingResultPage type={billingPageType} />
        <Footer isBillingPage={true} />
        <CookieConsent />
      </>
    )
  }

  return (
    <>
      <Seo route="/" page="home" />
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
