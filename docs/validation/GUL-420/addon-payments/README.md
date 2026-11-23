# Alipay and WeChat add-on credits

The payment selector now reads **Stripe** for card checkout. Add-on packs can
also be purchased through Alipay or WeChat, using the same pack catalog, order
summary, agreement and credit balance as Stripe purchases.

## Browser verification

Captured and inspected the actual React application in headless Chrome with
synthetic API responses. No payment provider was called and no money was charged.
The amounts shown in these screenshots are fixtures, not approved selling prices.

| Screenshot | Verified state |
| --- | --- |
| [Stripe](01-stripe.png) | Stripe selector and USD pack prices |
| [Alipay / WeChat](02-alipay-wechat-packs.png) | Independent CNY prices and the same credit-pack layout |
| [WeChat checkout](03-wechat-checkout.png) | Immutable credits, validity, price and QR payment |
| [Mobile checkout](04-wechat-mobile.png) | 390 px layout with payment actions visible |
| [Alipay checkout](05-alipay-checkout.png) | Separate payment window and retained result page |
| [Dark mode](06-packs-dark.png) | Pack selection in dark mode |
| [English checkout](07-wechat-english.png) | English mobile layout |
| [Credits added](08-credits-added.png) | Credit-specific success message and expiry |
| [Balance and history](09-balance-history.png) | Balance changes from 128,400 to 348,400 after a 220,000-credit grant |

The browser checks also verified no horizontal overflow at 320, 390 or 768 px,
blocked provider switching while an order is unresolved, no balance increase
while paid-but-pending, and refreshed purchase history after posting.

## Local checks

`npm run test:billing-coverage`, `npm run lint` and `npm run build` pass under
Node 24.21.0 / npm 11.19.0. All 333 tests pass; billing coverage is 95.85%
statements, 93.53% branches and 97.67% lines. Existing build chunk-size warnings
remain.

Related API integration tests use a disposable PostgreSQL database and mocked
provider receipts to verify both payment channels, concurrent replay, atomic
grant rollback, restart recovery, ownership checks, immutable prices, consumed
credit preservation and verified full-refund registration. Real provider
settlement remains a deployment verification step.

## Deployment

Deploy API migration 00074 and the corresponding API change before this web
update. Set `AIDEA_PAY_CREDIT_PACK_PRICE_MAP` to approved CNY prices in integer
fen for enabled catalog pack codes. For example, `{"pack_s":100}` illustrates
the format (CNY 1.00), not a recommended price. An empty map keeps Alipay/WeChat
add-on offers hidden. Existing AIDEA keys and notification configuration are
reused. Membership prices and Stripe prices stay in their existing maps.
