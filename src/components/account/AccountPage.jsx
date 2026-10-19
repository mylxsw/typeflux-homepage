import { useCallback, useState } from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { useAccountSession } from '../../contexts/AccountSessionContext.jsx'
import { localizedPath } from '../../lib/localePath'
import { loginURL } from '../../lib/accountNavigation'
import { browserTimeZone, fetchSubscription, fetchUsageBreakdown, fetchUsageRecords, fetchUsageStats } from '../../lib/accountApi'
import { fetchCreditGrants, fetchPrepaidOrders, openBillingManagement, sessionCredential } from '../../lib/billingApi'
import { formatDate, formatNumber, formatPrice } from '../billing/format'
import { accountCopy, accountText } from './accountCopy'
import { FEATURES, creditSummary, dailySeries, displayName, featureTotals, formatDuration, paymentRows, planState, recordFeature } from './accountModel'
import { useAccountData } from './useAccountData'
import UsageChart from './UsageChart'
import SecurityView from './SecurityView'
import styles from './Account.module.css'

const loadStats = (signal) => fetchUsageStats({ signal })
const loadSubscription = (signal) => fetchSubscription({ signal })
const loadBreakdown = (signal) => fetchUsageBreakdown({ timeZone: browserTimeZone(), signal })
const loadRecords = (signal) => fetchUsageRecords({ limit: 8, signal })

function usePayments(csrf) {
  return useAccountData(useCallback(async (signal) => {
    const credential = sessionCredential(csrf)
    const [grants, orders] = await Promise.all([
      fetchCreditGrants(credential, { limit: 20, signal }),
      fetchPrepaidOrders(credential, { signal }),
    ])
    return paymentRows({ grants: grants.items, orders })
  }, [csrf]))
}

const assignLocation = (url) => window.location.assign(url)

export default function AccountPage({ route, navigate = assignLocation }) {
  const { lang } = useI18n()
  const session = useAccountSession()
  const c = accountCopy(lang)
  const [deleted, setDeleted] = useState(false)

  if (deleted) {
    return <main className={styles.page}>
      <div className="container"><div className={styles.state} role="status">
        <h1>{c.security.deletedTitle}</h1>
        <p>{c.security.deletedSub}</p>
        <a className={styles.button} href={localizedPath(lang, '/')}>{c.security.home}</a>
      </div></div>
    </main>
  }

  if (session.status === 'loading') {
    return <main className={styles.page}><div className="container" role="status" aria-label={c.common.loading}><div className={styles.spinner} /></div></main>
  }
  if (session.status !== 'signedIn') {
    return <SignedOut c={c} lang={lang} route={route} error={session.status === 'error'} retry={session.refresh} />
  }

  const view = { '/account/usage': 'usage', '/account/billing': 'billing', '/account/security': 'security' }[route] || 'overview'
  const props = { c, lang, session, navigate }
  return <main className={styles.page}>
    <div className="container">
      <div className={styles.layout}>
        <aside className={styles.side}>
          <div className={styles.me}>
            <span className={styles.avatar} aria-hidden="true">{session.user.email.slice(0, 1)}</span>
            <div className={styles.meText}><strong>{displayName(session.user)}</strong><span>{session.user.email}</span></div>
          </div>
          <nav className={styles.sideNav} aria-label={c.nav.label}>
            {[['overview', '/account'], ['usage', '/account/usage'], ['billing', '/account/billing'], ['security', '/account/security']].map(([key, path]) =>
              <a key={key} href={localizedPath(lang, path)} aria-current={view === key ? 'page' : undefined}>{c.nav[key]}</a>)}
          </nav>
          <p className={styles.help}>{c.common.help}</p>
        </aside>
        <section className={styles.stack}>
          {view === 'overview' && <Overview {...props} />}
          {view === 'usage' && <Usage {...props} />}
          {view === 'billing' && <Billing {...props} />}
          {view === 'security' && <SecurityView c={c} lang={lang} session={session} navigate={navigate} onDeleted={() => {
            // Show the confirmation, then drop the identity everywhere on the page.
            setDeleted(true)
            session.expire()
          }} />}
        </section>
      </div>
    </div>
  </main>
}

function SignedOut({ c, lang, route, error, retry }) {
  const next = localizedPath(lang, route)
  return <main className={styles.page}>
    <div className="container"><div className={styles.state}>
      <h1>{error ? c.common.loadFailed : c.signedOut.title}</h1>
      <p>{c.signedOut.sub}</p>
      {error
        ? <button type="button" className={styles.button} onClick={retry}>{c.common.retry}</button>
        : <a className={styles.button} href={loginURL(lang, next)}>{c.signedOut.action}</a>}
    </div></div>
  </main>
}

function Section({ data, c, children, skeleton = true }) {
  if (data.status === 'loading') return skeleton ? <div className={styles.skeleton} aria-busy="true" /> : null
  if (data.status === 'error') {
    return <div className={styles.card} role="alert">
      <p className={styles.empty}>{c.common.loadFailed}</p>
      <button type="button" className={styles.buttonGhost} onClick={data.reload}>{c.common.retry}</button>
    </div>
  }
  return children(data.data)
}

const plansURL = (lang, tab) => `${localizedPath(lang, '/billing/plans')}${tab ? `?tab=${tab}` : ''}`

function Overview({ c, lang, session, navigate }) {
  const stats = useAccountData(loadStats)
  const subscription = useAccountData(loadSubscription)
  const breakdown = useAccountData(loadBreakdown)
  const payments = usePayments(session.csrf)
  return <>
    <PastDueBanner subscription={subscription} c={c} session={session} navigate={navigate} />
    <header className={styles.head}>
      <div>
        <h1>{accountText(lang, 'overview.greeting', { name: displayName(session.user) })}</h1>
        <p>{c.overview.subtitle}</p>
      </div>
      <div className={styles.headActions}><a className={styles.buttonGhost} href={plansURL(lang, 'credits')}>{c.overview.buyCredits}</a></div>
    </header>
    <div className={`${styles.grid} ${styles.two}`}>
      <Section data={stats} c={c}>{(data) => <CreditsCard c={c} lang={lang} stats={data} />}</Section>
      <Section data={subscription} c={c}>{(data) => <PlanCard c={c} lang={lang} subscription={data} session={session} navigate={navigate} />}</Section>
    </div>
    <Section data={breakdown} c={c}>{(data) => {
      const totals = featureTotals(data)
      return <div className={`${styles.grid} ${styles.three}`}>
        {FEATURES.map((f) => <div key={f} className={styles.card}>
          <div className={styles.kpiLabel}><i className={`${styles.swatch} ${styles[f]}`} />{c.features[f]} · {c.overview.featureThisPeriod}</div>
          <div className={styles.kpiValue}>{formatNumber(totals[f], lang)}<small>{c.common.credits}</small></div>
        </div>)}
      </div>
    }}</Section>
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h2>{c.overview.recentPayments}</h2>
        <div className={styles.cardHeadEnd}><a className={styles.link} href={localizedPath(lang, '/account/billing')}>{c.overview.allPayments}</a></div>
      </div>
      <Section data={payments} c={c} skeleton={false}>{(rows) => <PaymentsTable c={c} lang={lang} rows={rows.slice(0, 3)} />}</Section>
    </div>
  </>
}

function CreditsCard({ c, lang, stats }) {
  const credits = creditSummary(stats.credits)
  const range = accountText(lang, 'overview.period', { start: formatDate(stats.period_start, lang), end: formatDate(stats.period_end, lang) })
  return <div className={styles.card}>
    <div className={styles.cardHead}>
      <div><h2>{c.overview.creditsTitle}</h2><p>{range}</p></div>
      {credits.low && <div className={styles.cardHeadEnd}><span className={`${styles.chip} ${styles.warn}`}>{c.overview.low}</span></div>}
    </div>
    {credits.unlimited
      ? <div className={styles.kpiValue}>{c.common.unlimited}</div>
      : <>
        <div className={styles.kpiValue}>{formatNumber(credits.total, lang)}<small>{c.overview.remaining}</small></div>
        <div className={styles.meter} role="img" aria-label={`${c.overview.planLeft} ${credits.planLeft}, ${c.overview.addon} ${credits.addon}, ${c.overview.used} ${credits.used}`}>
          <span className={styles.meterPlan} style={{ width: `${credits.planShare}%` }} />
          {credits.addon > 0 && <span className={styles.meterAddon} style={{ width: `${credits.addonShare}%` }} />}
        </div>
        <div className={styles.legend}>
          <span><i className={`${styles.swatch} ${styles.meterPlan}`} />{c.overview.planLeft} <b>{formatNumber(credits.planLeft, lang)}</b> / {formatNumber(credits.limit, lang)}</span>
          {credits.addon > 0 && <span><i className={`${styles.swatch} ${styles.meterAddon}`} />{c.overview.addon} <b>{formatNumber(credits.addon, lang)}</b></span>}
          <span>{c.overview.used} <b>{formatNumber(credits.used, lang)}</b></span>
        </div>
      </>}
  </div>
}

function statusChip(state, c) {
  const tone = { active: styles.good, pastDue: styles.crit, canceling: styles.warn, inactive: '' }[state.status]
  return <span className={`${styles.chip} ${tone}`}>{c.plan[state.status]}</span>
}

function usePortal(session, navigate) {
  const [state, setState] = useState({ busy: false, failed: false })
  const open = useCallback(async () => {
    setState({ busy: true, failed: false })
    try {
      navigate(await openBillingManagement(sessionCredential(session.csrf)))
      setState({ busy: false, failed: false })
    } catch (error) {
      if (error?.kind === 'expired_token') session.expire()
      setState({ busy: false, failed: true })
    }
  }, [session, navigate])
  return { ...state, open }
}

function PlanCard({ c, lang, subscription, session, navigate }) {
  const state = planState(subscription)
  const portal = usePortal(session, navigate)
  if (!state.paid) {
    return <div className={styles.card}>
      <div className={styles.cardHead}><h2>{c.plan.title}</h2></div>
      <div className={styles.planName}>{state.name || c.plan.free}</div>
      <p className={styles.note}>{c.plan.freeSub}</p>
      <div className={styles.actions}><a className={styles.button} href={plansURL(lang)}>{c.plan.upgrade}</a></div>
    </div>
  }
  return <div className={styles.card}>
    <div className={styles.cardHead}><h2>{c.plan.title}</h2><div className={styles.cardHeadEnd}>{statusChip(state, c)}</div></div>
    <div className={styles.planName}>{state.name}</div>
    <dl className={styles.dl}>
      {state.interval && <><dt>{c.plan.interval}</dt><dd>{c.plan.intervals[state.interval] || state.interval}</dd></>}
      {state.periodEnd && <><dt>{state.autoRenew ? c.plan.renews : c.plan.ends}</dt><dd>{formatDate(state.periodEnd, lang)}</dd></>}
      {state.channel && <><dt>{c.plan.payment}</dt><dd>{c.plan.channels[state.channel]}</dd></>}
    </dl>
    <div className={styles.actions}>
      {state.action === 'portal' && <>
        <a className={styles.button} href={plansURL(lang)}>{c.plan.change}</a>
        <button type="button" className={styles.buttonGhost} disabled={portal.busy} aria-busy={portal.busy} onClick={portal.open}>{c.plan.manage}</button>
      </>}
      {state.action === 'renew' && <a className={styles.button} href={plansURL(lang)}>{c.plan.renew}</a>}
    </div>
    {state.channel === 'apple' && <p className={styles.note}>{c.plan.appleNote}</p>}
    {state.prepaid && <p className={styles.note}>{c.plan.prepaidNote}</p>}
    {portal.failed && <p className={styles.alert} role="alert">{c.plan.portalFailed}</p>}
  </div>
}

function PastDueBanner({ subscription, c, session, navigate }) {
  const portal = usePortal(session, navigate)
  if (subscription.status !== 'ready' || planState(subscription.data).status !== 'pastDue') return null
  return <div className={`${styles.banner} ${styles.crit}`} role="alert">
    <span>{c.plan.pastDueNote}</span>
    <button type="button" className={styles.button} style={{ marginLeft: 'auto' }} disabled={portal.busy} onClick={portal.open}>{c.plan.manage}</button>
  </div>
}

function PaymentsTable({ c, lang, rows }) {
  if (!rows.length) return <p className={styles.empty}>{c.billing.empty}</p>
  return <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead><tr><th>{c.billing.date}</th><th>{c.billing.item}</th><th>{c.billing.method}</th><th>{c.billing.status}</th><th className={styles.num}>{c.billing.amount}</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id}>
        <td>{formatDate(r.date, lang)}</td>
        <td><b>{r.kind === 'pack'
          ? accountText(lang, 'billing.pack', { credits: formatNumber(r.credits, lang) })
          : accountText(lang, 'billing.membership', { plan: r.plan, months: r.months })}</b></td>
        <td>{c.plan.channels[r.method] || r.method}</td>
        <td><span className={`${styles.chip} ${['paid', 'granted'].includes(r.status) ? styles.good : ['pending', 'creating', 'review'].includes(r.status) ? styles.warn : ''}`}>{c.billing.statuses[r.status] || r.status}</span></td>
        <td className={styles.num}>{r.amountCents > 0 ? formatPrice(r.amountCents, r.currency, lang) : '—'}</td>
      </tr>)}</tbody>
    </table>
  </div>
}

function Usage({ c, lang }) {
  const stats = useAccountData(loadStats)
  const breakdown = useAccountData(loadBreakdown)
  const records = useAccountData(loadRecords)
  const [view, setView] = useState('chart')
  const zone = browserTimeZone() || 'UTC'
  return <>
    <header className={styles.head}><div><h1>{c.usage.title}</h1><p>{c.usage.subtitle}</p></div></header>
    <Section data={breakdown} c={c}>{(data) => {
      const rows = dailySeries(data)
      const totals = featureTotals(data)
      return <>
        <div className={`${styles.grid} ${styles.three}`}>
          <div className={styles.card}>
            <div className={styles.kpiLabel}>{c.usage.spent}</div>
            <div className={styles.kpiValue}>{formatNumber(totals.total, lang)}</div>
            <div className={styles.kpiFoot}>{accountText(lang, 'usage.dailyAverage', { value: formatNumber(rows.length ? totals.total / rows.length : 0, lang) })}</div>
          </div>
          <Section data={stats} c={c}>{(s) => {
            const credits = creditSummary(s.credits)
            return <>
              <div className={styles.card}>
                <div className={styles.kpiLabel}>{c.usage.remaining}</div>
                <div className={styles.kpiValue}>{credits.unlimited ? c.common.unlimited : formatNumber(credits.total, lang)}</div>
              </div>
              <div className={styles.card}>
                <div className={styles.kpiLabel}>{c.usage.voiceTime}</div>
                <div className={styles.kpiValue}>{formatNumber((s.stats?.asr_audio_duration_ms || 0) / 60000, lang)}<small>{c.usage.minutes}</small></div>
                <div className={styles.kpiFoot}>{accountText(lang, 'usage.requests', { count: formatNumber(s.stats?.asr_count || 0, lang) })}</div>
              </div>
            </>
          }}</Section>
        </div>
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div><h2>{c.usage.chartTitle}</h2><p>{accountText(lang, 'usage.chartSub', { zone })}</p></div>
            <div className={styles.cardHeadEnd}>
              <div className={styles.seg}>
                <button type="button" aria-pressed={view === 'chart'} onClick={() => setView('chart')}>{c.usage.chart}</button>
                <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>{c.usage.table}</button>
              </div>
            </div>
          </div>
          <div className={styles.legend} style={{ margin: '0 0 14px' }}>
            {FEATURES.map((f) => <span key={f}><i className={`${styles.swatch} ${styles[f]}`} />{c.features[f]}</span>)}
          </div>
          {totals.total === 0
            ? <p className={styles.empty}>{c.usage.empty}</p>
            : view === 'chart'
              ? <UsageChart rows={rows} lang={lang} labels={{ ...c.features, title: c.usage.chartTitle }} totalLabel={c.features.total} />
              : <div className={styles.tableWrap}><table className={styles.table}>
                <thead><tr><th>{c.usage.date}</th>{FEATURES.map((f) => <th key={f} className={styles.num}>{c.features[f]}</th>)}<th className={styles.num}>{c.features.total}</th></tr></thead>
                <tbody>{rows.slice().reverse().map((r) => <tr key={r.date}><td>{r.date}</td>{FEATURES.map((f) => <td key={f} className={styles.num}>{formatNumber(r[f], lang)}</td>)}<td className={styles.num}><b>{formatNumber(r.total, lang)}</b></td></tr>)}</tbody>
              </table></div>}
        </div>
        <div className={`${styles.grid} ${styles.halves}`}>
          <div className={styles.card}>
            <div className={styles.cardHead}><h2>{c.usage.byFeature}</h2></div>
            {FEATURES.map((f) => {
              const share = totals.total ? Math.round((totals[f] / totals.total) * 100) : 0
              return <div key={f} className={styles.feature}>
                <div className={styles.featureBody}>{c.features[f]}<div className={styles.bar}><span className={styles[f]} style={{ width: `${share}%` }} /></div></div>
                <div className={styles.featureValue}>{formatNumber(totals[f], lang)}<span>{share}%</span></div>
              </div>
            })}
          </div>
          <RecentRequests c={c} lang={lang} records={records} />
        </div>
      </>
    }}</Section>
  </>
}

function recordDetail(r, lang) {
  if (r.audio_duration_ms) return accountText(lang, 'usage.audio', { duration: formatDuration(r.audio_duration_ms) })
  if (r.total_tokens) return accountText(lang, 'usage.tokens', { count: formatNumber(r.total_tokens, lang) })
  return ''
}

function formatTime(value, lang) {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return ''
  try {
    return new Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(time)
  } catch {
    return new Date(time).toISOString().slice(0, 16).replace('T', ' ')
  }
}

function RecentRequests({ c, lang, records }) {
  return <div className={styles.card}>
    <div className={styles.cardHead}><div><h2>{c.usage.recent}</h2><p>{c.usage.recentSub}</p></div></div>
    <Section data={records} c={c} skeleton={false}>{(data) => {
      const rows = Array.isArray(data?.records) ? data.records : []
      if (!rows.length) return <p className={styles.empty}>{c.usage.empty}</p>
      return <div className={styles.tableWrap}><table className={styles.table}>
        <thead><tr><th>{c.usage.time}</th><th>{c.usage.feature}</th><th>{c.usage.detail}</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}>
          <td>{formatTime(r.created_at, lang)}</td>
          <td><b>{c.features[recordFeature(r)]}</b></td>
          <td>{recordDetail(r, lang)}</td>
        </tr>)}</tbody>
      </table></div>
    }}</Section>
  </div>
}

function Billing({ c, lang, session, navigate }) {
  const stats = useAccountData(loadStats)
  const subscription = useAccountData(loadSubscription)
  const payments = usePayments(session.csrf)
  const portal = usePortal(session, navigate)
  const stripe = subscription.status === 'ready' && planState(subscription.data).channel === 'stripe'
  return <>
    <PastDueBanner subscription={subscription} c={c} session={session} navigate={navigate} />
    <header className={styles.head}>
      <div><h1>{c.billing.title}</h1><p>{c.billing.subtitle}</p></div>
      <div className={styles.headActions}><a className={styles.buttonGhost} href={plansURL(lang, 'credits')}>{c.overview.buyCredits}</a></div>
    </header>
    <div className={`${styles.grid} ${styles.two}`}>
      <Section data={subscription} c={c}>{(data) => <PlanCard c={c} lang={lang} subscription={data} session={session} navigate={navigate} />}</Section>
      <Section data={stats} c={c}>{(data) => {
        const credits = creditSummary(data.credits)
        return <div className={styles.card}>
          <div className={styles.cardHead}><div><h2>{c.billing.balance}</h2><p>{c.billing.balanceSub}</p></div></div>
          <div className={styles.kpiValue}>{credits.unlimited ? c.common.unlimited : formatNumber(credits.total, lang)}</div>
          <dl className={styles.dl}>
            <dt>{c.billing.planCredits}</dt><dd>{credits.unlimited ? c.common.unlimited : `${formatNumber(credits.planLeft, lang)} / ${formatNumber(credits.limit, lang)}`}</dd>
            <dt>{c.billing.addonCredits}</dt><dd>{formatNumber(credits.addon, lang)}{credits.addonExpiry && <span className={styles.sub}>{accountText(lang, 'billing.expires', { date: formatDate(credits.addonExpiry, lang) })}</span>}</dd>
          </dl>
          <div className={styles.actions}><a className={styles.button} href={plansURL(lang, 'credits')}>{c.overview.buyCredits}</a></div>
        </div>
      }}</Section>
    </div>
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div><h2>{c.billing.payments}</h2><p>{c.billing.paymentsSub}</p></div>
        {stripe && <div className={styles.cardHeadEnd}><button type="button" className={styles.buttonGhost} disabled={portal.busy} onClick={portal.open}>{c.billing.openPortal}</button></div>}
      </div>
      {portal.failed && <p className={styles.alert} role="alert">{c.plan.portalFailed}</p>}
      <Section data={payments} c={c} skeleton={false}>{(rows) => <PaymentsTable c={c} lang={lang} rows={rows} />}</Section>
    </div>
  </>
}
