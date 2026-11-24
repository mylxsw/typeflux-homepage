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
  if (config.VITE_WEB_AUTH_ENABLED !== 'true' || !config.VITE_WEB_AUTH_APP_REDIRECTS || !config.VITE_API_BASE_URL || !config.HOMEPAGE_ORIGIN) {
    throw new Error('IaaS production sign-in configuration is incomplete')
  }
  for (const key of ['VITE_WEB_AUTH_ENABLED', 'VITE_WEB_AUTH_APP_REDIRECTS', 'VITE_API_BASE_URL', 'HOMEPAGE_ORIGIN']) env[key] = config[key]
  run('npm', ['test', '--', 'deploy/worker.test.js'], env)
}

run('npm', ['run', 'build:site'], env)
if (production) run(process.execPath, ['.iaas/typeflux-homepage/smoke.mjs', 'build', resolve('.')], env)
