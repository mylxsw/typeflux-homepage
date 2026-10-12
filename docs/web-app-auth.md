# Browser sign-in integration (GUL-359)

This implements the approved GUL-357 **v2** design in the existing React app,
including the site's Header and Footer. API baseline:
[typeflux-api PR #139](https://github.com/mylxsw/typeflux-api/pull/139),
commit `bb0c9622423d5418829670fa219bbf9b03fc81ce`,
[frozen contract](https://github.com/mylxsw/typeflux-api/blob/bb0c9622423d5418829670fa219bbf9b03fc81ce/docs/web-app-auth.md).
PR #139 was verified merged during delivery with this unchanged head. This does
not establish production configuration or real-provider acceptance.

## Configuration and deployment

- `VITE_WEB_AUTH_ENABLED=false` by default. Set `true` at **build time** only
  after the matching API and same-origin HTTPS proxy are configured. The disabled
  page explains how to use the App's available sign-in methods and calls no API.
- `VITE_WEB_AUTH_APP_REDIRECTS` is a comma-separated list of exact App callback
  bases. Default: `ai.gulu.app.typeflux://auth/callback`. For a separate test
  origin, set the development callback agreed with the App and API configuration.
  Do not add arbitrary HTTPS destinations or provider callbacks here.
- Auth calls always use relative `/api/v1/auth/web/...` and Cookie/CSRF. They
  deliberately ignore `VITE_API_BASE_URL`. Additionally proxy the exact
  `POST /api/v1/auth/enter-email` route for email discovery. Its result is only
  a routing hint and is never proof of ownership.
- Production **and real integration development require HTTPS** on
  `WEB_AUTH_ORIGIN`. The ordinary Vite HTTP proxy is suitable only for mocked
  UI tests; it cannot establish the real `__Host-` Secure cookie.
- Route `/login`, `/login/complete` and all four non-English prefixed variants
  to the built `dist/auth.html` shell. These routes are not public prerender
  routes and must not enter the sitemap. Their initial HTML has noindex and
  no-referrer even before JS executes. Preserve deep-link queries on the initial
  request; React's entry captures the single transaction and immediately removes
  all query/hash values using `replaceState(null, '', pathname)`.
- Use `deploy/web-auth.nginx.conf` and `deploy/web-auth-headers.conf` as the
  server-location and header examples. Copy the latter into the include path,
  configure the API upstream and website root in the existing TLS server, then
  run `nginx -t`. Forward original Origin, cookies (including Set-Cookie),
  Content-Type and CSRF headers. API prefix routes and the exact discovery route
  take precedence over static HTML and SPA fallback. All unknown `/api/*`
  routes must stay with the API or return a non-HTML 404.
- On Cloudflare Workers/Pages or another static host, implement the same
  **edge routing and proxy rules**. `_routes.json` alone does not implement a
  same-origin proxy or security headers. Do not enable the feature with just a
  static upload. Serve the auth shell with the exact no-store/no-referrer/CSP
  headers, proxy callbacks first, and bypass CDN cache on every auth response,
  including redirects, errors and email discovery.
- Disable URL/query, request/response body, cookie and header logging for these
  routes in the ingress, CDN and APM. No analytics, session replay, injected CDN
  scripts or external provider SDKs are allowed on auth pages. Header/Footer
  GitHub links go directly to the repository/issues, bypassing tracked redirects.
- CSP uses only self-hosted scripts, styles, fonts and images; no unsafe-inline
  or unsafe-eval. Auth theme initialization is an external local script. Test
  the production build, since the Vite HMR development script needs different
  development-only permissions. Do not relax production CSP for HMR.

Deploy API → proxy/headers + Homepage enabled build → App feature gate.
Rollback: disable App browser sign-in and rebuild Homepage with its flag false;
disable `WEB_AUTH_ENABLED` on the API. Keep old native auth and existing App
sessions intact. This PR does not deploy, merge API work or change secrets.

## Behavior and deliberate design differences

| Design proposal | Implemented contract behavior |
| --- | --- |
| Reduced header in v1 | Approved v2 full Header/Footer, two-column desktop form, single-column mobile |
| Nested account/link fields and avatar | Flat session; account email and first-letter avatar only; no fabricated name/source/methods |
| Link-required masked account | API does not return email before old-account authentication; ask for the existing email/password or linked provider without inventing identity |
| Activation auto-authorizes / password login skips confirmation | Activation/reset return to empty password input. Every authenticated account requires explicit confirmation |
| Browser consent survives OAuth | Consent stays in memory; ask again after OAuth navigation before completion; no assertion that the API stores legal consent |
| Refresh/email storage / language reload | No auth storage. Refresh/back with stripped URL requires an App restart. Normal language clicks update locale/path in place, preserving `/login/complete`, inputs and in-memory transaction |
| Switch account / abandon link | Explain restarting in App; never pretend a UI reset cleared server identity |
| Same-transaction code reissue / lost complete retry | Completion POST is sent at most once. Lost response or expired code requires a new App transaction |
| Timed “login succeeded” screen | One automatic launch and an in-memory manual link; 4-second recovery instructions. Only browser-bound session `consumed` says the server exchanged the code; App storage success must be checked in the App |
| Fixed retry/lockout countdown and attempts remaining | Countdown only from Retry-After. Missing duration/attempt counts produce generic server-error copy. No client-invented lockout |
| Server-time countdown | API supplies Unix expires_at, no server_time. Local countdown is advisory; API remains authoritative |
| Provider buttons from mockup | Official Google G/Google Sans and Apple artwork, self-hosted; Apple's white/black treatment and built-in logo padding take precedence |
| Browser-prompt illustration | Real explanatory text and manual launch control; no fake browser dialog |
| Password “8 characters” | Validation matches Go Unicode categories and 8–72 UTF-8 byte limits, including multibyte passwords |

`/login/complete` is the same state machine as `/login`; cancellation, pending,
link-required, authenticated, issued, consumed and revoked states all work there.
No OAuth outcome or identity is trusted from query parameters. Form and network
errors use stable codes, never backend message text. CSRF/state errors trigger
a session read, without replaying a write. Retries remain explicit.

Code layout: `authApi.js` validates and selects the wire fields;
`authNavigation.js` handles route classification and transient bootstrap;
`useAuthFlow.js` owns request, recovery and handoff state; `LoginPage.jsx` owns
accessible forms; `authCopy.js` supplies five languages; CSS stays module-scoped.

## Validation

Run `npm test`, `npm run test:auth-coverage`, `npm run lint`, `npm run build`.
Auth coverage requires at least **90%** in aggregate for lines, statements,
branches and functions. Tests cover all six email actions, all three providers,
explicit confirmation/link consent, wrong-account recovery, network/CSRF/rate
limits, duplicate submits, expiry, lost completion, blocked launch, URL/storage
hygiene, five locales and in-place language switching. Browser capture checks
the actual production bundle with mocked frozen API responses; see `design-qa.md`.

Real OAuth providers, Apple subject continuity, production proxy/CDN behavior,
Safari/Firefox and macOS warm/cold launch remain GUL-361 integration acceptance.
Mock tests and Chromium screenshots do not establish that those passed.

## Brand asset provenance

Checked 2026-10-12 against [Google's current branding guide](https://developers.google.com/identity/branding-guidelines)
and [Apple's current Sign in with Apple guidance](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple/).
Assets are served locally; neither provider SDK runs on the page.

- Google G: `https://developers.google.com/static/identity/images/g-logo.png`.
  Google Sans Medium: Google Fonts CSS API and its returned fonts.gstatic.com
  Latin WOFF2 subset; OFL license included. Use approved color, full-width pill,
  14px/500 text, 18px logo, and the documented outline treatment.
- Apple logo: [Apple Design Resources](https://developer.apple.com/design/resources/),
  `Logo-Sign-in-with-Apple.dmg`, Left Aligned / SVG / Black / Medium, unmodified.
  Artwork retains its original padding and scales to button height; the title
  uses a 20px system font for the 48px button (Apple's suggested proportion). Apple
  Design Resources license included. White background, black logo/text.
- GitHub mark: [official Primer Octicons](https://github.com/primer/octicons),
  `icons/mark-github-16.svg` (MIT). UI outline icons: [Feather](https://github.com/feathericons/feather),
  unmodified SVG files and MIT license. Existing Typeflux assets are reused.
