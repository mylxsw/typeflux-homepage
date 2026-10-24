# Typeflux Homepage

The website for [Typeflux](https://typeflux.app), the open-source AI layer for
the Mac (AI agent, launcher, voice typing, screenshots and recording, clipboard
history). The macOS app lives in [mylxsw/typeflux](https://github.com/mylxsw/typeflux).

The site is a React + Vite app, deployed to Cloudflare as static assets
(`wrangler.jsonc`), in five languages (English, 简体中文, 繁體中文, 日本語, 한국어).

| Route | Purpose | Source |
|---|---|---|
| `/` | Product page | `src/components/home/` (copy per locale in `home/copy/`, app facts such as default shortcuts in `home/homeModel.js`) |
| `/releases` | Download links and release history | `src/content/releases/` (one Markdown file per version) |
| `/blog` | Guides and articles | `src/content/blog/` |
| `/privacy`, `/terms` | Legal pages | `src/components/` |
| `/billing/plans` and result pages | Plans and Stripe checkout, opened from the app with a token | `src/components/billing/` |
| `/account` | Web account: membership, credits, usage, security | `src/components/account/` |
| `/login` | Browser-to-app sign-in (disabled by default) | `src/components/auth/` |

Public routes (`/`, `/releases`, `/privacy`, `/terms`, `/blog/*`) are
prerendered to static HTML; the rest render on the client. Locale prefixes
such as `/zh-CN/releases` select the language. API calls (`/api`) go to
[typeflux-api](https://github.com/mylxsw/typeflux-api).

When the app's features or default shortcuts change, update `homeModel.js` and
every locale under `home/copy/` together.

## Local development

Start the API and its PostgreSQL/Redis dependencies in a separate terminal:

```sh
cd ../typeflux-api
test -f .env || cp .env.example .env
make dev
```

Use Node.js 24.21.0 (LTS) and npm 11.19.0, as pinned in `.nvmrc` and
`package.json`. Run `nvm install && nvm use` before installing dependencies.
Other Node/npm versions are rejected by `.npmrc`.

Then start the homepage from this directory:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5174 or http://localhost:5174. The development server
listens on IPv4 loopback and exits if port 5174 is already occupied.

Requests to `/api`, `/d/`, and `/go/` are forwarded to `http://127.0.0.1:8080`,
preserving paths, query parameters, and authorization headers. Other paths,
including `/billing/plans`, are served by the homepage.

The defaults work without an environment file. To use a different local API,
copy `.env.example` to `.env.local` and change `VITE_API_PROXY_TARGET`, then
restart the homepage. Keep `VITE_API_BASE_URL` empty to use the proxy; setting
it to an absolute URL makes the browser call that server directly.

Check connectivity:

```sh
curl --noproxy '*' http://127.0.0.1:5174/api/v1/healthz
curl --noproxy '*' http://localhost:5174/api/v1/app/releases/latest
```

Both requests should return JSON. Billing endpoints require a valid token from
the local API. Open billing from the locally configured app; a missing or
expired token produces a 401 response. When testing the app-to-browser billing
flow, set `BILLING_PLANS_PAGE_URL=http://127.0.0.1:5174/billing/plans` in the API's
local `.env` and restart the API.

## Validation

```sh
npm test
npm run build
```

`npm test` runs once and exits; use `npm run test:watch` for interactive work.
Use `npm ci` to reproduce the lockfile, and `npm audit` plus
`npm audit --omit=dev` to check build/test and production dependencies separately.
Vitest 4 supplies jsdom storage globals without Node webstorage workarounds.
Tests use at most two workers to limit jsdom memory and CPU contention in CI.

## Browser-to-App sign-in

See [the web authentication deployment guide](docs/web-app-auth.md) for the
feature gate, HTTPS same-origin proxy, dedicated auth shell, security headers,
API dependency and validation. Browser sign-in is disabled by default.
