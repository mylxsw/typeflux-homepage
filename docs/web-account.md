# Website account (GUL-422)

Signed-in visitors get an account area and stay signed in across visits and
App jumps. API contract: typeflux-api `docs/web-account-sessions.md`.

## What it adds

- **Header**: a fixed-width account slot (sign-in link, or avatar menu with
  Dashboard / Usage / Billing / Sign out). The slot exists from the first
  render, so the centered nav never moves when the session loads. It is not
  shown on `/login` pages, and not at all unless `VITE_WEB_AUTH_ENABLED=true`.
- **`/account`, `/account/usage`, `/account/billing`** (and the four locale
  prefixes): credits for the period, plan and status (Stripe, Alipay/WeChat
  prepaid, App Store, past due), per-feature usage with a daily stacked chart and
  table view, recent requests (metadata only), credit balance, payment history
  and the Stripe billing portal. Sections load and fail independently; any 401
  returns the area to its signed-out view.
- **`/login` without an App transaction** now runs a website sign-in through the
  same state machine (email, Google, GitHub, Apple, linking). Confirmation offers
  "Keep me signed in" (default on; off = browser-session cookie) and returns to
  `?next=` (only `/account*` and `/billing/plans`, localized). App logins offer
  "Also keep me signed in on the Typeflux website" (default on).
- **`/account/handoff#code=…&to=…`** exchanges a one-time App code, asking which
  account to keep when the browser is signed in to a different one.
- **`/billing/plans`** uses, in order: an App handoff code (`#…&h=`, appended by
  the API to existing App billing links), the App page token (`#t=`), then the
  website session. Every billing call is reused unchanged; a session credential
  just routes it to the same-origin `/api/v1/auth/web/account/...` mirror.

- **`/account/security`** (Sign-in & security): link or unlink Google, GitHub
  and Apple, and delete the account. These actions first ask the user to
  **confirm it's you** (password in a dialog, or a round trip with an already
  linked provider), which opens a ten-minute window on this browser. Unlinking
  the last way to sign in is impossible. Deleting asks for the account email
  and, when Apple is linked, an Apple confirmation (so its authorization can be
  revoked); afterwards the page shows a deleted state and signs out. Provider
  outcomes come back as `?linked=`, `?reauth=ok` or `?…_error=` and are shown
  once, then stripped from the address.

No token ever reaches JavaScript or storage: the session is an HttpOnly cookie,
the CSRF token lives in memory, and handoff codes are stripped from the URL
before React renders. Account pages are `noindex`, outside the sitemap and
excluded from analytics.

## Deployment

No new proxy rule: all calls stay under the existing `/api/v1/auth/web/` prefix
(see `web-app-auth.md`). `/account*` routes are client-rendered like `/billing`,
so the existing SPA fallback serves them. Build with `VITE_WEB_AUTH_ENABLED=true`
only after the API has `WEB_AUTH_ENABLED=true` (migration 00075 applied).

## Validation

`npm test`, `npm run test:account-coverage` (≥90% on the new code),
`npm run test:auth-coverage`, `npm run test:billing-coverage`, `npm run lint`,
`npm run build`.
