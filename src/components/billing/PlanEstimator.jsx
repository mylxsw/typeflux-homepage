import { formatCredits } from './format'
import { useState } from 'react'
import { AI_USAGE_LEVELS, estimateMonthlyCredits, isUnlimited, recommendPlan, usagePercent } from '../billingInsights'
import { formatMessage, formatNumber } from './format'
import styles from './Checkout.module.css'

const MIN_MINUTES = 5
const MAX_MINUTES = 480

// Turns daily speaking time into a plan suggestion using the real credit rules.
export default function PlanEstimator({ text, lang, plans, onChoose }) {
  const [minutes, setMinutes] = useState(30)
  const [aiUsage, setAiUsage] = useState('some')
  const overhead = AI_USAGE_LEVELS.find((level) => level.key === aiUsage)?.overhead || 0
  const needed = estimateMonthlyCredits(minutes, overhead)
  const recommendation = recommendPlan(plans, needed)
  if (!recommendation) return null

  const planName = recommendation.plan.name || recommendation.plan.code
  const minutesLabel = minutes >= 60
    ? formatMessage(text.hours, { value: formatNumber(minutes / 60, lang, 1) })
    : formatMessage(text.minutes, { value: minutes })
  const why = !recommendation.fits
    ? formatMessage(text.over, { plan: planName, credits: formatCredits(recommendation.shortfall, lang) })
    : isUnlimited(recommendation.plan.monthlyCredits)
      ? text.fitUnlimited
      : formatMessage(text.fit, { used: recommendation.usedPercent, left: 100 - recommendation.usedPercent })

  return (
    <div className={styles.estimator}>
      <div className={styles.estimatorInput}>
        <label className={styles.sliderLabel} htmlFor="plan-estimator-minutes">
          <span>{text.minutesLabel}</span>
          <strong>{minutesLabel}</strong>
        </label>
        <input
          id="plan-estimator-minutes"
          className={styles.slider}
          type="range"
          min={MIN_MINUTES}
          max={MAX_MINUTES}
          step="5"
          value={minutes}
          style={{ '--fill': `${(minutes - MIN_MINUTES) / (MAX_MINUTES - MIN_MINUTES) * 100}%` }}
          onChange={(event) => setMinutes(Number(event.target.value))}
        />
        <p className={styles.sliderLabel}><span>{text.aiLabel}</span></p>
        <div className={styles.chips} role="group" aria-label={text.aiLabel}>
          {AI_USAGE_LEVELS.map((level) => (
            <button key={level.key} type="button" aria-pressed={aiUsage === level.key} onClick={() => setAiUsage(level.key)}>
              {text.ai[level.key]}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.estimatorResult} aria-live="polite">
        <p className={styles.estimate}>{formatMessage(text.need, { credits: formatCredits(needed, lang) })}</p>
        <p className={styles.recommendation}>{recommendation.fits ? planName : formatMessage(text.overTitle, { plan: planName })}</p>
        <p className={styles.recommendationWhy}>{why}</p>
        <div className={styles.meters}>
          {plans.filter((plan) => plan.monthlyCredits !== 0).map((plan) => {
            const percent = usagePercent(needed, plan.monthlyCredits)
            return (
              <div key={plan.code} className={`${styles.meter} ${percent > 100 ? styles.meterOver : plan.code === recommendation.plan.code ? styles.meterFit : ''}`}>
                <span>{plan.name || plan.code}</span>
                <span className={styles.meterTrack}><i style={{ width: `${Math.min(100, percent)}%` }} /></span>
                <span className={styles.meterValue}>{percent > 999 ? '>999%' : `${percent}%`}</span>
              </div>
            )
          })}
        </div>
        <button className={styles.secondaryButton} type="button" onClick={() => onChoose(recommendation.plan.code)}>
          {formatMessage(text.choose, { plan: planName })}
        </button>
        <p className={styles.estimatorNote}>{text.note}</p>
      </div>
    </div>
  )
}
