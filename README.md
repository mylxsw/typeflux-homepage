# Typeflux Homepage

## Local development

Start the API and its PostgreSQL/Redis dependencies in a separate terminal:

```sh
cd ../typeflux-api
test -f .env || cp .env.example .env
make dev
```

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
