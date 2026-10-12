# GUL-359 design and browser QA

Result: **passed for the implemented v2 UI and mocked API contract**, 2026-10-12.
Real OAuth and macOS integration are not covered by this result.

## Reference and comparison

Reference: GUL-357's approved v2 full Header/Footer mockups and localized copy.
Implemented with existing React components, scoped CSS and self-hosted assets;
the reference HTML is used only for comparison, not shipped as product code.

The issue's screenshot attachment contains actual production-build captures:

- `comparison-desktop.png`: approved 1280px desktop beside implementation.
- `comparison-mobile.png`: both at 370px content width; mobile terms checked
  through an actual browser pointer click, not by editing the DOM.
- `comparison-card.png`: both 440px cards at original scale.
- Desktop entry, registration, password, account confirmation, handoff,
  link-required and refresh-recovery states; English dark entry.
- 390px mobile entry in English, Simplified/Traditional Chinese, Japanese and
  Korean; dark OAuth-cancellation recovery.

Inspected the final images side by side. Desktop columns, mobile stacking,
form spacing, typography hierarchy, input/button sizes, colors, borders,
radius, shadow, focus treatment and localized wrapping follow the reference.
No horizontal overflow occurred in any captured viewport. Initial comparison
led to corrections to the request chip, password-step controls and Apple
artwork/border treatment; final screenshots reflect those corrections.

Intentional differences:

- Existing site Header/Footer retain their real spacing, theme control, icons,
  legal-link wording and responsive copyright wrapping.
- Google and Apple buttons follow their official brand assets and typography;
  Apple's system-font title is larger and its border darker than the sketch.
- Terms use a native checkbox and a minimum 44px label target. The desktop
  card is slightly taller than the sketch; consent is unchecked initially.
- Flat API identity fields, explicit account confirmation, safe restart paths
  and manual App-launch recovery replace unsupported draft behavior. The full
  mapping and asset sources are in `web-app-auth.md`.

## Browser evidence

Chromium 155 via Puppeteer; production build on a local HTTPS server using
the documented strict CSP, no-store/no-referrer headers, and mocked responses
from API commit `bb0c9622423d5418829670fa219bbf9b03fc81ce`.

The flow exercised registration → activation → empty-password login → explicit
account confirmation → one completion request → manual App-launch recovery.
The server asserted browser Origin, HttpOnly Secure cookie delivery and CSRF
on writes. Checks also cover URL/query/hash removal, no auth values in browser
storage, no analytics requests despite pre-existing analytics consent, no
external scripts, OAuth cancellation, account-link UI and refresh recovery.

Axe found no WCAG A/AA violations in the authentication `main` at desktop and
all five mobile locales. No page errors or unexpected failed requests occurred.
The JSON report is included with the screenshots. These automated checks do
not replace assistive-technology testing.

The screenshot harness initially lost pointer events after attempting a native
App-protocol launch. Re-running the mobile pointer interaction in the initial
browser session passed. Native protocol prompts and successful macOS App launch
remain real-device acceptance work, not a claimed browser-mock result.

## Automated checks and limits

275 tests pass. Authentication coverage: statements 97.31%, branches 95.67%,
functions 98.76%, lines 99.29%; CI enforces 90% aggregate for each. Existing
billing coverage also passes its gate. Lint, enabled/default production builds
and dependency audits pass. The existing bundle-size advisory remains.

GUL-361 still needs real Google/GitHub/Apple authorization, Apple subject
continuity, deployed HTTPS proxy/CDN verification, Safari/Firefox and macOS
warm/cold launch plus App credential persistence. Feature remains off by
default until the API, proxy and App rollout are configured together.
