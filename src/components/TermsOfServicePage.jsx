import styles from './PrivacyPolicyPage.module.css'

const LAST_UPDATED = 'April 13, 2026'

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By downloading, installing, or using the Typeflux application ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App.',
      'These Terms apply to the Typeflux desktop application and any related features or services. They do not govern the public marketing website except where the website is used to access app functionality.',
    ],
  },
  {
    title: '2. License',
    body: [
      'Typeflux is released as open-source software under the GNU Affero General Public License v3.0 (AGPL-3.0). Subject to the terms of that license, you are free to use, copy, modify, and distribute the App.',
      'The full text of the AGPL-3.0 license is available in the project repository at https://github.com/mylxsw/typeflux/blob/main/LICENSE. In the event of any conflict between these Terms and the AGPL-3.0 license with respect to the software itself, the AGPL-3.0 license governs.',
    ],
  },
  {
    title: '3. Use of the App',
    body: [
      'You may use the App for lawful purposes only. You agree not to use the App to process content that violates applicable laws, infringes the rights of others, or is otherwise harmful or abusive.',
      'You are responsible for ensuring that any third-party APIs, models, or services you connect to the App are used in accordance with those providers\' terms and applicable law.',
      'The App may include features that send data to external services you configure (such as AI providers or speech recognition APIs). Your use of those services is subject to their own terms and policies.',
    ],
  },
  {
    title: '4. No Warranty',
    body: [
      'The App is provided "as is" and "as available," without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.',
      'We do not warrant that the App will be error-free, uninterrupted, or free of harmful components. You use the App at your own risk.',
    ],
  },
  {
    title: '5. Limitation of Liability',
    body: [
      'To the fullest extent permitted by applicable law, the authors and contributors of Typeflux shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of or inability to use the App.',
      'This limitation applies even if we have been advised of the possibility of such damages. In no event shall our total liability to you exceed the amount you paid (if any) to obtain the App.',
    ],
  },
  {
    title: '6. Third-Party Services',
    body: [
      'The App may allow you to connect to third-party AI, speech recognition, cloud storage, or automation services. We are not responsible for the availability, accuracy, or terms of those services.',
      'Any data you send to third-party services through the App is governed by those providers\' own terms of service and privacy policies. We encourage you to review their policies before enabling integrations.',
    ],
  },
  {
    title: '7. Intellectual Property',
    body: [
      'The Typeflux name, logo, and associated branding materials are the property of the project author. The underlying source code is licensed under AGPL-3.0 as described in Section 2.',
      'Any contributions you make to the Typeflux project (e.g., pull requests) are subject to the terms of the project\'s open-source license and contribution guidelines.',
    ],
  },
  {
    title: '8. Modifications to the Terms',
    body: [
      'We may update these Terms from time to time. When we make material changes, we will revise the "Last updated" date at the top of this page and publish the updated version here.',
      'Your continued use of the App after changes are published constitutes your acceptance of the revised Terms.',
    ],
  },
  {
    title: '9. Governing Law',
    body: [
      'These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the project author resides, without regard to its conflict of law provisions.',
    ],
  },
  {
    title: '10. Contact',
    body: [
      'If you have questions about these Terms, please open an issue in the GitHub repository at https://github.com/mylxsw/typeflux/issues.',
    ],
  },
]

export default function TermsOfServicePage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroCard}>
            <p className={styles.eyebrow}>Terms of Service</p>
            <h1 className={styles.title}>Terms of Service for Typeflux</h1>
            <p className={styles.summary}>
              Please read these Terms carefully before using the Typeflux app. By using the
              app, you agree to be bound by these Terms.
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
                  <li>Typeflux is open-source software under AGPL-3.0.</li>
                  <li>The App is provided without warranty of any kind.</li>
                  <li>You are responsible for any third-party services you connect.</li>
                  <li>We are not liable for damages arising from your use of the App.</li>
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
