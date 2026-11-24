import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { promisify } from 'node:util'

const [mode, build] = process.argv.slice(2)
const origin = process.env.HOMEPAGE_ORIGIN
const apiOrigin = process.env.VITE_API_BASE_URL
const callback = process.env.VITE_WEB_AUTH_APP_REDIRECTS
const { JSDOM } = createRequire(join(build, 'package.json'))('jsdom')
const invoke = promisify(execFile)
const random = () => randomBytes(32).toString('base64url')
const route = '/zh-CN/login'
const auth = '/api/v1/auth/web'

async function request(url, { headers = {}, body, jar, expected = /^application\/json\b/ } = {}) {
  const args = ['--fail', '--silent', '--show-error', '--max-time', '12', '--write-out', '\n%{content_type}']
  if (jar) args.push('--cookie', jar, '--cookie-jar', jar)
  for (const [key, value] of Object.entries(headers)) args.push('--header', `${key}: ${value}`)
  if (body) args.push('--data-binary', body)
  const { stdout } = await invoke('curl', [...args, url], { maxBuffer: 4 * 1024 * 1024 })
  const end = stdout.lastIndexOf('\n')
  const type = stdout.slice(end + 1)
  assert.match(type, expected, 'Unexpected response content type')
  return new Response(stdout.slice(0, end), { headers: { 'Content-Type': type } })
}

function assetPath(html) {
  const asset = html.match(/src="(\/assets\/[\w.-]+\.js)"/)
  assert.ok(asset, 'Login HTML does not reference a built JavaScript asset')
  return asset[1]
}

async function macTransaction() {
  const response = await request(`${apiOrigin}/api/v1/auth/app/transactions`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: 'typeflux-macos', redirect_uri: callback, state: random(),
      code_challenge: createHash('sha256').update(random()).digest('base64url'), code_challenge_method: 'S256' }),
  })
  const { code, data } = await response.json()
  assert.equal(code, 'OK', 'API could not create a Mac sign-in transaction')
  assert.match(data.transaction_id, /^[A-Za-z0-9_-]{43}$/)
  const expected = new URL('/login', origin)
  expected.searchParams.set('transaction', data.transaction_id)
  assert.ok(data.login_url === expected.href, 'API did not return the production login URL')
  return data.transaction_id
}

async function renderSignIn(html, bundle, jar, transaction) {
  const url = new URL(route, origin)
  if (transaction) url.searchParams.set('transaction', transaction)
  const { window } = new JSDOM(html, { url, runScripts: 'outside-only' })
  const requests = new Set()
  let failure
  try {
    Object.assign(window, { TextEncoder, TextDecoder, AbortController })
    window.fetch = async (input, { headers, body }) => {
      const target = new URL(input, origin)
      assert.ok(target.origin === origin && target.pathname.startsWith(`${auth}/`), 'Unexpected sign-in API origin or path')
      try {
        const response = await request(target.href, { headers: { ...headers, Origin: origin, 'Sec-Fetch-Site': 'same-origin' }, body, jar })
        requests.add(target.pathname)
        return response
      } catch {
        failure = `Sign-in request to ${target.pathname} failed`
        throw new Error(failure)
      }
    }
    window.eval(bundle)
    for (let attempt = 0; attempt < 100 && !window.document.querySelector('input[type="email"]') && !failure; attempt++) {
      if (window.document.querySelector('h1')?.textContent === '请在 Typeflux 应用中登录') break
      await delay(100)
    }
    assert.ok(!failure, failure)
    assert.equal(window.document.querySelector('h1')?.textContent, '登录 Typeflux')
    assert.ok(window.document.querySelector('input[type="email"]'), 'Email sign-in is unavailable')
    assert.match(window.document.body.textContent, /Google/)
    assert.match(window.document.body.textContent, /GitHub/)
    assert.ok(requests.has(`${auth}/session`), 'Login page did not load a real session')
    assert.equal(requests.has(`${auth}/transactions`), !transaction, 'Incorrect sign-in flow')
  } finally { window.close() }
}

async function run() {
  let html = await readFile(join(build, 'dist/auth.html'), 'utf8')
  const asset = assetPath(html)
  let bundle = await readFile(join(build, 'dist', asset), 'utf8')
  assert.ok(bundle.includes(callback), 'Built JavaScript is missing the production Mac callback')
  if (mode === 'live') {
    for (let attempt = 0; attempt < 6; attempt++) {
      html = await (await request(origin + route, { expected: /^text\/html\b/ })).text()
      if (assetPath(html) === asset) break
      if (attempt < 5) await delay(2000)
    }
    assert.equal(assetPath(html), asset, 'Online login has not switched to the expected release')
    const live = await (await request(origin + asset, { expected: /^(?:application|text)\/javascript\b/ })).text()
    assert.ok(live === bundle, 'Online JavaScript does not match the verified build')
    bundle = live
  }
  const work = await mkdtemp(join(tmpdir(), 'typeflux-login-'))
  try {
    await renderSignIn(html, bundle, join(work, 'mac'), await macTransaction())
    await renderSignIn(html, bundle, join(work, 'web'))
    console.log(`${mode}: Mac and website login forms verified against the production API (${asset})`)
  } finally { await rm(work, { recursive: true, force: true }) }
}

try { await run() }
catch (error) {
  console.error(error.code === 'ERR_ASSERTION' ? error.message : 'Typeflux sign-in smoke test failed')
  process.exitCode = 1
}
