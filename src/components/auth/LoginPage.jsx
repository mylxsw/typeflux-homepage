import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../../i18n/index.jsx'
import { localizedPath } from '../../lib/localePath'
import { authApi, PROVIDERS } from '../../lib/authApi'
import { getAuthTransaction } from '../../lib/authNavigation'
import { passwordRules, validPassword } from '../../lib/password'
import { authText } from './authCopy'
import { useAuthFlow } from './useAuthFlow'
import styles from './LoginPage.module.css'

const navigateTo = url => window.location.assign(url)
const titles = { entry: 'entryTitle', login: 'passwordTitle', register: 'registerTitle', activate: 'activateTitle',
  resend: 'activateTitle', 'forgot-password': 'resetTitle', 'reset-password': 'newPassword', link: 'linkTitle',
  confirm: 'confirmTitle', handoff: 'handoffTitle', consumed: 'consumedTitle', direct: 'directTitle', restart: 'restartTitle', disabled: 'directTitle', loading: 'loading', 'load-error': 'entryTitle' }
const subtitles = { entry: 'entrySub', login: 'passwordSub', register: 'registerSub', activate: 'activateSub', resend: 'resendSub',
  'forgot-password': 'forgotSub', 'reset-password': 'resetSub', link: 'linkSub', confirm: 'confirmSub', handoff: 'handoffSub',
  consumed: 'consumedSub', direct: 'directSub', restart: 'restartSub', disabled: 'disabled' }
const statusViews = ['direct', 'restart', 'disabled', 'handoff', 'consumed', 'load-error']
const names = { google: 'Google', github: 'GitHub', apple: 'Apple' }

function Icon({ name, className = '' }) {
  return <img className={`${styles.icon} ${className}`} src={`/auth/icons/${name}.svg`} alt="" aria-hidden="true" />
}

export default function LoginPage({ api = authApi, transaction = getAuthTransaction(), enabled = import.meta.env.VITE_WEB_AUTH_ENABLED === 'true', navigate = navigateTo }) {
  const { lang, t } = useI18n()
  const copy = (key, values) => authText(lang, key, values)
  const flow = useAuthFlow({ transaction, api, enabled, navigate })
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const [linkConsent, setLinkConsent] = useState(false)
  const [linkError, setLinkError] = useState(false)
  const consentRef = useRef(null)
  const linkRef = useRef(null)
  const headingRef = useRef(null)
  const statusView = statusViews.includes(flow.view)
  const busy = Boolean(flow.busy || flow.redirecting)
  const linked = flow.session?.link_provider

  useEffect(() => { headingRef.current?.focus() }, [flow.view])

  const requireConsent = () => {
    if (consent) return true
    setConsentError(true)
    consentRef.current?.focus()
    return false
  }
  const cooldown = scope => Math.max(0, Math.ceil(((flow.cooldowns[scope] || 0) - flow.now) / 1000))
  const providerButtons = (['entry', 'link'].includes(flow.view) || (flow.view === 'login' && flow.message === 'noPassword')) && (
    <div className={styles.providers}>
      <div className={styles.divider}>{copy('or')}</div>
      {PROVIDERS.filter(p => flow.session?.providers.includes(p)).map(provider => (
        <button key={provider} type="button" className={`${styles.provider} ${styles[provider]}`}
          disabled={busy || cooldown(provider) > 0} aria-busy={flow.busy === provider || flow.redirecting === provider}
          onClick={() => { if (requireConsent()) void flow.provider(provider) }}>
          <img src={`/auth/${provider}.${provider === 'google' ? 'png' : 'svg'}`} alt="" />
          {flow.redirecting === provider ? copy('redirecting', { provider: names[provider] }) : copy('provider', { provider: names[provider] })}
          {cooldown(provider) > 0 && <span> ({cooldown(provider)}s)</span>}
        </button>
      ))}
    </div>
  )
  const terms = (['entry', 'link', 'confirm'].includes(flow.view) || (flow.view === 'login' && !consent)) && (
    <div className={styles.consent}>
      <label>
        <input ref={consentRef} type="checkbox" checked={consent} aria-invalid={consentError} aria-describedby={consentError ? 'consent-error' : undefined}
          onChange={event => { setConsent(event.target.checked); setConsentError(false) }} />
        <span>{copy('consent')} <a href={localizedPath(lang, '/terms')} target="_blank" rel="noopener noreferrer">{t('footer.terms')}</a> {copy('and')} <a href={localizedPath(lang, '/privacy')} target="_blank" rel="noopener noreferrer">{t('footer.privacyPolicy')}</a></span>
      </label>
      {consentError && <p id="consent-error" className={styles.fieldError} role="alert">{copy('consentError')}</p>}
    </div>
  )

  return <main className={styles.page}>
    <div className={`${styles.layout} ${statusView ? styles.centered : ''}`}>
      {!statusView && <aside className={styles.intro} aria-label={copy('account')}>
        <p className={styles.eyebrow}>{copy('account')}</p>
        <h2>{copy('introTitle')}</h2>
      </aside>}
      <section className={`${styles.card} ${statusView ? styles.statusCard : ''}`} aria-labelledby="auth-title" aria-busy={busy || flow.view === 'loading'}>
        {statusView ? <div className={styles.statusIcon}><Icon name={flow.view === 'handoff' ? 'external-link' : flow.view === 'consumed' ? 'check' : 'clock'} /></div>
          : <div className={styles.chip}><img src="/app.png" alt="" />{copy('chip')}</div>}
        <h1 id="auth-title" ref={headingRef} tabIndex={-1}>{copy(titles[flow.view])}</h1>
        {subtitles[flow.view] && <p className={styles.subtitle}>{copy(subtitles[flow.view], { provider: names[linked] })}</p>}
        {flow.message && <div id="auth-message" className={styles.alert} role={['sent', 'updated', 'activated', 'cancelled', 'csrf'].includes(flow.message) ? 'status' : 'alert'}>{copy(flow.message)}</div>}
        {flow.view === 'loading' && <div className={styles.skeleton} role="status"><Icon name="loader" className={styles.spinner} /><span>{copy('loading')}</span></div>}
        {flow.view === 'load-error' && <button className={styles.primary} disabled={busy || cooldown('session') > 0} onClick={flow.reload}>{copy('retry')}</button>}
        {['entry', 'login', 'register', 'activate', 'resend', 'forgot-password', 'reset-password', 'link'].includes(flow.view) &&
          <EmailForm key={flow.view} flow={flow} email={email} setEmail={setEmail} copy={copy} requireConsent={requireConsent} cooldown={cooldown} />}
        {providerButtons}{flow.view !== 'confirm' && terms}
        {flow.view === 'link' && <button className={styles.ghost} disabled={busy} onClick={flow.restart}>{copy('switch')}</button>}
        {flow.view === 'confirm' && <>
          <div className={styles.account}><span className={styles.avatar}>{flow.session.email.slice(0, 1).toUpperCase()}</span><strong>{flow.session.email}</strong></div>
          {linked && <label className={styles.linkConsent}><input ref={linkRef} type="checkbox" checked={linkConsent} aria-invalid={linkError} onChange={event => { setLinkConsent(event.target.checked); setLinkError(false) }} />{copy('linkConsent', { provider: names[linked] })}</label>}
          {linkError && <p role="alert" className={styles.fieldError}>{copy('linkConsentError')}</p>}
          {terms}
          <button className={styles.primary} disabled={busy} onClick={() => {
            if (!requireConsent()) return
            if (linked && !linkConsent) { setLinkError(true); linkRef.current?.focus(); return }
            void flow.complete(Boolean(linked && linkConsent))
          }}>{copy(busy ? 'loading' : 'continue')}</button>
          <button className={styles.ghost} disabled={busy} onClick={flow.restart}>{copy('switch')}</button>
        </>}
        {flow.view === 'handoff' && <>
          <a className={styles.primary} href={flow.handoff.redirect_url} rel="noreferrer">{copy('open')}</a>
          <p className={styles.countdown}>{copy('remaining', { seconds: flow.remaining })}</p>
          {flow.now - flow.handoff.openedAt >= 4000 && <div className={styles.recovery}>
            <h2>{copy('recoveryTitle')}</h2><ol><li>{copy('recovery1')}</li><li>{copy('recovery2')} <a href={localizedPath(lang, '/releases')}>{copy('download')}</a></li><li>{copy('recovery3')}</li></ol>
          </div>}
        </>}
        {['direct', 'restart', 'disabled'].includes(flow.view) && <div className={styles.statusActions}>
          <a className={styles.primary} href={localizedPath(lang, '/releases')}>{copy('download')}</a>
          <a className={styles.ghost} href={localizedPath(lang, '/')}>{copy('home')}</a>
        </div>}
      </section>
    </div>
  </main>
}

function EmailForm({ flow, email, setEmail, copy, requireConsent, cooldown }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const passwordRef = useRef(null)
  const view = flow.view
  const newPassword = ['register', 'reset-password'].includes(view)
  const hasPassword = newPassword || ['login', 'link', 'resend'].includes(view)
  const hasCode = ['activate', 'reset-password'].includes(view)
  const editableEmail = ['entry', 'link', 'forgot-password'].includes(view)
  const scope = view === 'entry' ? 'enter' : 'email'
  const busy = Boolean(flow.busy || flow.redirecting)
  const wait = cooldown(scope)
  const buttons = { entry: 'continue', login: 'login', register: 'create', activate: 'verify', resend: 'resend', 'forgot-password': 'sendReset', 'reset-password': 'update', link: 'login' }

  useEffect(() => {
    if (!busy && flow.message === 'credentials') passwordRef.current?.focus()
  }, [busy, flow.message])

  const submit = async (event, submittedCode = code) => {
    event.preventDefault()
    if (busy || wait) return
    setError('')
    const normalized = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) { setError('invalidEmail'); return }
    if (['entry', 'login', 'link'].includes(view) && !requireConsent()) return
    if (hasPassword && (!password || new TextEncoder().encode(password).length > 72 || (newPassword && !validPassword(password)))) { setError('weak'); return }
    if (newPassword && password !== confirm) { setError('mismatch'); return }
    if (hasCode && !/^\d{6}$/.test(submittedCode)) { setError('invalidCode'); return }
    setEmail(normalized)
    if (view === 'entry') { await flow.enter(normalized); return }
    const fields = { email: normalized }
    if (hasPassword) fields[newPassword && view !== 'register' ? 'new_password' : 'password'] = password
    if (hasCode) fields.code = submittedCode
    if (view === 'register' && name.trim()) fields.name = name.trim()
    const result = await flow.email(view === 'link' ? 'login' : view === 'resend' ? 'resend-activation' : view, fields)
    if (result?.ok || result?.code === 'AUTH_INVALID_CREDENTIALS') {
      setPassword(''); setConfirm('')
      if (!result.ok) passwordRef.current?.focus()
    }
  }

  return <form method="post" onSubmit={submit} noValidate className={styles.form}>
    {editableEmail ? <label>{copy('email')}<input name="email" type="email" autoComplete="username" value={email} maxLength={254} required disabled={busy}
      aria-invalid={error === 'invalidEmail'} aria-describedby={error ? 'field-error' : undefined} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></label>
      : <div className={styles.emailPill}><Icon name="mail" /><span>{email}</span><input type="hidden" name="email" autoComplete="username" value={email} />
        <button type="button" disabled={busy} onClick={() => flow.step(flow.session.status === 'link_required' ? 'link' : 'entry')}>{copy('change')}</button></div>}
    {view === 'register' && <label>{copy('name')}<input name="name" autoComplete="name" value={name} maxLength={200} disabled={busy} onChange={event => setName(event.target.value)} /></label>}
    {hasCode && <label>{copy('code')}<input className={styles.code} name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} value={code} disabled={busy}
      aria-invalid={error === 'invalidCode' || flow.message === 'codeError'} aria-describedby={error ? 'field-error' : flow.message ? 'auth-message' : undefined}
      onChange={event => {
        const value = event.target.value.replace(/\D/g, '').slice(0, 6)
        setCode(value)
        // Auto-submit only activation. Reset still needs the new password.
        if (value.length === 6 && view === 'activate') void submit(event, value)
      }} /></label>}
    {hasPassword && <PasswordField copy={copy} value={password} setValue={setPassword} inputRef={passwordRef} fresh={newPassword} disabled={busy} error={Boolean(error || flow.message === 'credentials')} describedBy={error ? 'field-error' : flow.message ? 'auth-message' : undefined} />}
    {newPassword && <>
      <ul className={styles.rules}>{passwordRules(password).map((ok, index) => <li key={index} className={ok ? styles.satisfied : ''}><Icon name={ok ? 'check' : 'clock'} />{copy(['ruleLength', 'ruleUpper', 'ruleLower', 'ruleDigit', 'ruleMax'][index])}</li>)}</ul>
      <PasswordField copy={copy} value={confirm} setValue={setConfirm} fresh confirm disabled={busy} error={error === 'mismatch'} describedBy={error ? 'field-error' : undefined} />
    </>}
    {error && <p className={styles.fieldError} id="field-error" role="alert">{copy(error)}</p>}
    {['login', 'link'].includes(view) && <button className={styles.forgot} type="button" disabled={busy} onClick={() => flow.step('forgot-password')}>{copy('forgot')}</button>}
    <button className={styles.primary} type="submit" disabled={busy || wait > 0} aria-busy={Boolean(flow.busy)}>{copy(busy ? 'loading' : buttons[view])}</button>
    {wait > 0 && <p className={styles.countdown}>{copy('retryIn', { seconds: wait })}</p>}
    {view === 'activate' && <button type="button" className={styles.ghost} disabled={busy || wait > 0} onClick={() => flow.step('resend')}>{copy('resend')}</button>}
    {!['entry', 'link', 'login'].includes(view) && <button type="button" className={styles.ghost} disabled={busy} onClick={() => flow.step(flow.session.status === 'link_required' ? 'link' : 'entry')}>{copy('back')}</button>}
  </form>
}

function PasswordField({ copy, value, setValue, fresh, confirm, disabled, error, describedBy, inputRef }) {
  const [visible, setVisible] = useState(false)
  const id = confirm ? 'confirm-password' : 'password'
  return <div><label htmlFor={id}>{copy(confirm ? 'confirmPassword' : fresh ? 'newPassword' : 'password')}</label>
    <div className={styles.passwordField}>
      <input ref={inputRef} id={id} name={id} type={visible ? 'text' : 'password'} autoComplete={fresh ? 'new-password' : 'current-password'}
        value={value} required disabled={disabled} aria-invalid={error} aria-describedby={describedBy} onChange={event => setValue(event.target.value)} />
      <button type="button" aria-label={copy(visible ? 'hidePassword' : 'showPassword')} aria-pressed={visible} onClick={() => setVisible(!visible)}><Icon name={visible ? 'eye-off' : 'eye'} /></button>
    </div>
  </div>
}
