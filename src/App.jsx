import Header from './components/Header'
import Hero from './components/Hero'
import SpeedSection from './components/SpeedSection'
import Features from './components/Features'
import Agent from './components/Agent'
import Personas from './components/Personas'
import Privacy from './components/Privacy'
import OpenSource from './components/OpenSource'
import CTA from './components/CTA'
import Footer from './components/Footer'
import CookieConsent from './components/CookieConsent'
import PrivacyPolicyPage from './components/PrivacyPolicyPage'
import ReleasesPage from './components/ReleasesPage'
import TermsOfServicePage from './components/TermsOfServicePage'
import BillingResultPage from './components/BillingResultPage'
import { useEffect } from 'react'
import { trackPageView } from './lib/analytics'

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  const isPrivacyPage = pathname === '/privacy'
  const isReleasesPage = pathname === '/releases'
  const isTermsPage = pathname === '/terms'
  const billingPageType = getBillingPageType(pathname)

  useEffect(() => {
    trackPageView()
    const handleConsent = () => trackPageView()
    window.addEventListener('typeflux:analytics-consent-changed', handleConsent)
    return () => window.removeEventListener('typeflux:analytics-consent-changed', handleConsent)
  }, [pathname])

  if (isPrivacyPage) {
    return (
      <>
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
        <Header isTermsPage={true} />
        <TermsOfServicePage />
        <Footer isTermsPage={true} />
        <CookieConsent />
      </>
    )
  }

  if (billingPageType) {
    return (
      <>
        <Header isBillingPage={true} />
        <BillingResultPage type={billingPageType} />
        <Footer isBillingPage={true} />
        <CookieConsent />
      </>
    )
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <SpeedSection />
        <Features />
        <Agent />
        <Personas />
        <Privacy />
        <OpenSource />
        <CTA />
      </main>
      <Footer />
      <CookieConsent />
    </>
  )
}

function getBillingPageType(pathname) {
  if (pathname === '/billing/success') {
    return 'success'
  }

  if (pathname === '/billing/cancel') {
    return 'cancel'
  }

  if (pathname === '/settings/billing') {
    return 'portal'
  }

  return null
}
