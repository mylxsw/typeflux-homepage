import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseEnv } from 'node:util'

function run(command, args, env) {
  const result = spawnSync(command, args, { stdio: 'inherit', env })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const production = process.env.WORKERS_CI_BRANCH === 'release'
const env = { ...process.env }
if (production) {
  const config = parseEnv(readFileSync('.iaas/typeflux-homepage/production.env', 'utf8'))
  const required = ['VITE_WEB_AUTH_ENABLED', 'VITE_WEB_AUTH_APP_REDIRECTS', 'VITE_API_BASE_URL', 'VITE_ANALYTICS_COOKIE_DOMAIN', 'HOMEPAGE_ORIGIN']
  if (config.VITE_WEB_AUTH_ENABLED !== 'true' || required.some(key => !config[key])) {
    throw new Error('IaaS production configuration is incomplete or sign-in is disabled')
  }
  for (const key of required) env[key] = config[key]
  run('npm', ['test', '--', 'deploy/worker.test.js'], env)
}

run('npm', ['run', 'build:site'], env)
if (production) run(process.execPath, ['.iaas/typeflux-homepage/smoke.mjs', 'build', resolve('.')], env)
