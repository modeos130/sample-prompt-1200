# Payment Model

## Current Release: Private Invite-Only

Booman Lab does not currently sell subscriptions, credits, downloads, or paid access inside the app.

The current production model is:

- Access is manually granted by the owner through invite-only Supabase Auth users.
- Tiers control usage limits only; they do not represent paid entitlements yet.
- There is no checkout page, no Stripe webhook, no order table, and no payment unlock flow.
- No frontend page may claim payment success or unlock paid access.

## Future Paid Model Requirements

Before adding paid tiers, the owner must define:

- Products or subscriptions offered.
- Stripe price IDs and billing interval.
- What each tier unlocks.
- Refund and cancellation rules.
- Whether Lyria/API usage is credit-based, subscription-based, or manually granted.
- Support contact and customer-facing payment terms.

## Required Engineering Rules for Payments

Future payment code must follow these rules:

- Checkout sessions are created only by a server API route.
- Product and price IDs come from trusted server configuration or the database, never from client input alone.
- Access is granted only after a signed Stripe webhook confirms successful payment.
- Webhook handling must be idempotent.
- Paid entitlement state must be stored server-side.
- Frontend success pages may display status, but they must never unlock access by themselves.
- Failed, canceled, refunded, or disputed payments must not keep paid access active unless the owner explicitly allows it.

## Launch Gate

Payment readiness is intentionally marked `not implemented` until the app has real checkout routes, signed webhook verification, durable order or subscription records, and tested fulfillment.
