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

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
  const isPrivacyPage = pathname === '/privacy'

  if (isPrivacyPage) {
    return (
      <>
        <Header isPrivacyPage={true} />
        <PrivacyPolicyPage />
        <Footer isPrivacyPage={true} />
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
