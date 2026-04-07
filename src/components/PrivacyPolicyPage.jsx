import styles from './PrivacyPolicyPage.module.css'

const LAST_UPDATED = 'April 7, 2026'

const sections = [
  {
    title: '1. Scope',
    body: [
      'This Privacy Policy explains how the Typeflex application handles information when you install, launch, and use the app and its related features.',
      'This policy is intended to describe the app experience itself rather than the public marketing website. If separate website-specific practices are introduced later, they should be described in a standalone website policy.',
    ],
  },
  {
    title: '2. Information we collect',
    body: [
      'We do not require you to create an account to use the core app experience unless a future optional cloud feature explicitly says otherwise.',
      'The app may process voice recordings, dictated text, prompts, selected text, and user preferences in order to provide transcription, rewriting, translation, assistant, and automation-style features.',
      'Depending on which features you enable, this processing may happen locally on your device, through self-hosted services you configure, or through third-party model providers or APIs you choose to connect.',
    ],
  },
  {
    title: '3. Local storage and app settings',
    body: [
      'The app may store settings locally on your device, such as language preferences, shortcut configuration, selected personas, model settings, and consent or interface preferences.',
      'If the app supports local caches, temporary transcripts, logs, or downloaded models, those items may also be stored on your device so the app can function correctly and efficiently.',
    ],
  },
  {
    title: '4. How we use information',
    body: [
      'We use information processed by the app to provide core product functionality, including speech recognition, text generation, command execution, personalization, syncing of settings if such a feature is introduced, security, troubleshooting, and product improvement.',
      'We do not sell your personal information.',
    ],
  },
  {
    title: '5. Sharing',
    body: [
      'If you enable integrations that send data to external AI, speech, storage, or automation providers, the data you choose to process through those integrations may be shared with those providers according to your configuration and their terms.',
      'We may also disclose information if required by law, to protect the rights and safety of users, or to investigate abuse, fraud, or security incidents involving the app or project.',
    ],
  },
  {
    title: '6. Data retention',
    body: [
      'Locally stored settings, caches, and content remain on your device until you delete them, change your settings, or uninstall the app, subject to how your operating system handles app data.',
      'If you route data through third-party providers or optional cloud services, retention may depend on those providers or services. You should review their policies before enabling them.',
    ],
  },
  {
    title: '7. Your choices',
    body: [
      'You can choose whether to use local models, self-hosted services, or third-party APIs where supported.',
      'You can remove local app data by clearing settings, deleting caches, removing configured providers, or uninstalling the app, depending on the feature involved.',
    ],
  },
  {
    title: '8. International visitors',
    body: [
      'If you use third-party or self-hosted services with the app, information may be processed in countries other than your own, depending on where those services are operated.',
    ],
  },
  {
    title: '9. Children',
    body: [
      'The app is not directed to children under 13, and we do not knowingly design it for use by children.',
    ],
  },
  {
    title: '10. Changes to this policy',
    body: [
      'We may update this Privacy Policy from time to time. When we make material changes, we will revise the date at the top of this page and publish the updated version here.',
    ],
  },
  {
    title: '11. Contact',
    body: [
      'If you have privacy questions about the app, please contact the project through the GitHub repository issues page at https://github.com/mylxsw/typeflux/issues.',
    ],
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroCard}>
            <p className={styles.eyebrow}>Privacy Policy</p>
            <h1 className={styles.title}>Privacy Policy for Typeflex</h1>
            <p className={styles.summary}>
              This page explains how the Typeflex app may process voice, text, settings,
              and connected-service data when you use app features.
            </p>
            <p className={styles.updated}>Last updated: {LAST_UPDATED}</p>
          </div>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className="container">
          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <p className={styles.sidebarLabel}>Quick Summary</p>
                <ul className={styles.sidebarList}>
                  <li>The policy applies to the Typeflex app, not just the marketing website.</li>
                  <li>Voice and text may be processed to deliver app features.</li>
                  <li>Data handling depends on whether you use local models, self-hosted services, or third-party APIs.</li>
                  <li>App settings and caches may be stored locally on your device.</li>
                </ul>
              </div>
            </aside>

            <div className={styles.sections}>
              {sections.map((section) => (
                <section key={section.title} className={styles.policySection}>
                  <h2>{section.title}</h2>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
