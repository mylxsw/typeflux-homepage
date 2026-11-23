# Payment selection in the order

The page now has one primary tab bar: **Membership plans / Add-on credits**.
Credit-pack payment methods sit in the order summary. Membership payment methods
appear after choosing a plan, in the confirmation window. Switching methods
updates the currency, full payable amount, available durations and renewal policy
before submitting a purchase.

## Screenshots

Captured from the running React app in Chrome. All balances, prices and payment
responses are synthetic fixtures; no payment provider was called or charged.

| Screenshot | State |
| --- | --- |
| [Credit packs with Stripe](01-credits-stripe-desktop.png) | One primary tab bar; USD prices and payment methods inside the order summary |
| [Credit packs with WeChat](02-credits-wechat-desktop.png) | CNY prices, selected method, agreement and payable amount together |
| [WeChat payment](03-credits-wechat-qr.png) | The confirmed credit order and QR payment |
| [Membership catalog](04-membership-desktop.png) | Plan selection without a separate payment tab bar |
| [Stripe membership](05-membership-stripe-order.png) | Full annual USD total and automatic renewal policy |
| [Alipay membership](06-membership-alipay-order.png) | CNY quarterly total and one-time payment policy |
| [Mobile credit catalog](07-credits-mobile.png) | Single-column layout at 390 px |
| [Mobile credit order](08-credits-mobile-order.png) | Payment method beside the purchase details |
| [Mobile credit confirmation](09-credits-mobile-confirm.png) | The chosen method carries into confirmation |
| [Mobile membership](10-membership-mobile-order.png) | Payment and duration controls inside the confirmation window |
| [Dark mode](11-credits-dark.png) | The same order layout in dark mode |
| [English mobile](12-english-mobile.png) | Localized payment controls and keyboard selection |

## Verification

- `npm run test:billing-coverage`: 341 tests pass. Billing coverage exceeds the
  existing 80% threshold: 96.15% statements, 93.64% branches, 98.57% functions
  and 97.83% lines. The new payment picker has 100% focused coverage.
- `npm run lint` and `npm run build`: pass with Node 24.21.0 / npm 11.19.0.
  The existing bundle-size warning remains.
- Browser checks: one primary tab bar; payment controls inside the credit order
  or membership confirmation; full USD annual total; CNY price and renewal copy
  updates; Alipay and WeChat submissions; payment-method locks for unresolved
  orders; keyboard selection and retained focus; Chinese/English; light/dark;
  320, 390 and 768 px layouts.
- English narrow-screen checks cover billing content and the payment dialog.
  The existing shared footer has an invisible tooltip extending 2 px beyond
  the 320 px viewport; it is outside this change.
- Self-review covered provider routing, price snapshots, recovery and duplicate
  submissions, subscription eligibility, cancellation, focus handling and copy.
  Fixed focus loss when switching providers and intrinsic grid widths that
  crowded the English narrow-screen order.

The existing add-on implementation and deployment dependency remain documented
in [the earlier verification](../addon-payments/README.md).
