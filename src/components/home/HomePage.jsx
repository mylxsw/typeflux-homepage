import { useI18n } from '../../i18n/index.jsx'
import Faq from '../Faq'
import AgentShowcase from './AgentShowcase'
import CaptureShowcase from './CaptureShowcase'
import ClipboardShowcase from './ClipboardShowcase'
import { CustomSection, MoreTools, Replaces } from './Extras'
import FeatureSection from './FeatureSection'
import FormsGallery from './FormsGallery'
import Hero from './Hero'
import LauncherShowcase from './LauncherShowcase'
import { VoiceVisual } from './Mockups'
import RingShowcase from './RingShowcase'
import { Closing, Entrances, PrivacySection, Scenarios } from './Sections'
import { ENTRANCES } from './homeModel'
import { getHomeCopy } from './homeCopy'

const entrance = Object.fromEntries(ENTRANCES.map((item) => [item.id, item]))

// The home page leads with what Typeflux replaces and its four entry points,
// then walks through the agent, launcher, display forms, voice, capture,
// clipboard, ring, smaller tools and extensibility before privacy and FAQ.
export default function HomePage() {
  const { lang } = useI18n()
  const copy = getHomeCopy(lang)

  return (
    <main>
      <Hero copy={copy.hero} ringCopy={copy.ring} ui={copy.ui} demo={copy.agent.demo} placeholder={copy.launcher.placeholder} lang={lang} />
      <Replaces copy={copy.replaces} />
      <Entrances copy={copy.entrances} />
      <AgentShowcase copy={copy.agent} ui={copy.ui} />
      <LauncherShowcase copy={copy.launcher} ui={copy.ui} lang={lang} />
      <FormsGallery copy={copy.forms} ui={copy.ui} agentDemo={copy.agent.demo} />
      <FeatureSection id="voice" entrance={entrance.voice} copy={copy.voice} tinted>
        <VoiceVisual copy={copy.voice} />
      </FeatureSection>
      <CaptureShowcase copy={copy.capture} ui={copy.ui} />
      <ClipboardShowcase copy={copy.clipboard} ui={copy.ui} />
      <RingShowcase copy={copy.ring} ui={copy.ui} />
      <MoreTools copy={copy.more} />
      <CustomSection copy={copy.custom} />
      <Scenarios copy={copy.scenarios} />
      <PrivacySection copy={copy.privacy} />
      <Faq />
      <Closing copy={copy.closing} iosCopy={copy.ios} lang={lang} />
    </main>
  )
}
