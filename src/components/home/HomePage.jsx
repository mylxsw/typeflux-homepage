import { useI18n } from '../../i18n/index.jsx'
import Faq from '../Faq'
import FeatureSection from './FeatureSection'
import Hero from './Hero'
import { AgentVisual, LauncherVisual, VoiceVisual } from './Mockups'
import RingDemo from './RingDemo'
import { Closing, Entrances, Plans, PrivacySection, Scenarios, Toolbox } from './Sections'
import { ENTRANCES } from './homeModel'
import { getHomeCopy } from './homeCopy'

const entrance = Object.fromEntries(ENTRANCES.map((item) => [item.id, item]))

// The home page: four entry points (voice, agent, launcher, ring), the tools
// they open, and the trust and pricing story around them.
export default function HomePage() {
  const { lang } = useI18n()
  const copy = getHomeCopy(lang)

  return (
    <main>
      <Hero copy={copy.hero} ringCopy={copy.ring} lang={lang} />
      <Entrances copy={copy.entrances} />
      <FeatureSection id="voice" entrance={entrance.voice} copy={copy.voice} tinted>
        <VoiceVisual copy={copy.voice} />
      </FeatureSection>
      <FeatureSection id="agent" entrance={entrance.agent} copy={copy.agent} reverse>
        <AgentVisual copy={copy.agent} />
      </FeatureSection>
      <FeatureSection id="launcher" entrance={entrance.launcher} copy={copy.launcher} tinted>
        <LauncherVisual copy={copy.launcher} />
      </FeatureSection>
      <FeatureSection id="ring" entrance={entrance.ring} copy={copy.ring} reverse>
        <RingDemo copy={copy.ring} />
      </FeatureSection>
      <Toolbox copy={copy.toolbox} />
      <Scenarios copy={copy.scenarios} />
      <PrivacySection copy={copy.privacy} />
      <Plans copy={copy.plans} lang={lang} />
      <Faq />
      <Closing copy={copy.closing} iosCopy={copy.ios} lang={lang} />
    </main>
  )
}
