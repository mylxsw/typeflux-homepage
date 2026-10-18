# Payment page redesign

One purchase layout for both memberships and add-on credits: choose what to buy
on the left, then pay from a single order panel on the right. Every price on
the page comes from the selected payment method, so cards and the order never
show one currency while charging another. Alipay and WeChat Pay open a focused
payment dialog (QR code or Alipay link, live status, result); Stripe goes
straight to Stripe Checkout.

Captured from the running React app in Chrome against a local mock API. All
prices, balances, plan features and orders are synthetic; no payment provider
was called.

| Screenshot | State |
| --- | --- |
| [Membership](01-membership-desktop.png) | Full page, WeChat Pay default for Chinese |
| [Quarterly with Alipay](02-membership-quarter-alipay.png) | CNY quarterly price, per-month equivalent and savings; Stripe marked unavailable for quarters |
| [Yearly with Stripe](03-membership-stripe-year.png) | USD yearly price and auto-renew note |
| [WeChat Pay](04-wechat-dialog.png) | QR payment dialog with live status |
| [Alipay](05-alipay-dialog.png) | Alipay opens in a new tab; the page keeps polling |
| [Activated](06-activated.png) | Result and return to Typeflux |
| [Credits](07-credits-desktop.png) | Balance, packs and the same order panel |
| [Credits with WeChat Pay](08-credits-wechat-dialog.png) | Add-on credits paid by QR |
| [Mobile](09-mobile-membership.png) / [scrolled](09b-mobile-scrolled.png) | Single column with a sticky checkout bar |
| [Mobile WeChat Pay](10-mobile-wechat.png) | Asks to scan from another device |
| [Prepaid member](11-prepaid-member.png) | Valid-until date, renew current plan |
| [Stripe member (English)](12-stripe-member-en.png) | Manage subscription in the account strip |
| [Dark mode](13-credits-dark.png) | Credits in dark mode |
| [Unfinished order](14-pending-banner.png) | Closing the dialog keeps the order and offers to continue it |
