import { useState } from 'react'
import FeatureSection from './FeatureSection'
import { Scaled } from './ui/ScaledDesktop'
import { ClipboardList, ClipboardShelf } from './ui/Surfaces'
import styles from './Showcase.module.css'

// Default clipboard shortcut in the app (the clipboard shelf design).
const CLIPBOARD_KEYS = { keys: ['⇧', '⌘', 'V'] }
const FORMS = ['list', 'shelf']

export default function ClipboardShowcase({ copy, ui }) {
  const [form, setForm] = useState('list')

  return (
    <FeatureSection id="clipboard" entrance={CLIPBOARD_KEYS} copy={copy} accent="launcher" tinted>
      <div className={styles.clipboardVisual}>
        <div className={styles.miniSegmented} role="group" aria-label={copy.badge}>
          {FORMS.map((id, i) => (
            <button
              key={id}
              type="button"
              aria-pressed={form === id}
              className={form === id ? styles.miniSegmentOn : ''}
              onClick={() => setForm(id)}
            >
              {ui.clipboard.forms[i]}
            </button>
          ))}
        </div>
        <div key={form} className={styles.demoSwap} data-form={form}>
          {form === 'list'
            ? <ClipboardList ui={ui} search={copy.search} />
            : (
              <Scaled width={700} height={290} initialScale={0.75}>
                <ClipboardShelf ui={ui} cards={copy.cards} search={copy.search} />
              </Scaled>
            )}
        </div>
        <div className={styles.retention}>
          <span className={styles.retentionTitle}>{copy.retentionTitle}</span>
          <ul className={styles.retentionOptions}>
            {copy.retention.map((option, i) => (
              <li key={option} className={i === copy.retention.length - 1 ? styles.retentionActive : ''}>{option}</li>
            ))}
          </ul>
        </div>
      </div>
    </FeatureSection>
  )
}
