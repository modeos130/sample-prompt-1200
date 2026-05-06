# BOOMAN LAB Security Audit

Date: 2026-05-06

This is a practical launch-readiness security review, not legal advice and not a substitute for a full third-party penetration test.

## Executive Security Status

Security posture after app-side fixes: improved, but not beta-ready until Supabase RLS is corrected and re-tested.

Highest-risk finding: the original Supabase policies granted broad browser-facing access with `using (true)`. Live anonymous checks during the audit returned HTTP 200 for profile/analytics reads and accepted an anonymous profile PATCH request path. That must be treated as a critical launch blocker.

## Critical Findings

| Finding | Evidence | Risk | Required fix |
| --- | --- | --- | --- |
| Unsafe Supabase RLS policies | `scripts/setup.sql` previously created `"Service full access profiles"` and `"Service full access analytics"` with `using (true)` | Anonymous/public clients can read private profile/analytics data and may update data depending on grants | Apply reviewed SQL in `scripts/rls_hardening.sql`, then verify anon access returns 401/403 or empty denied responses |
| Live database allowed anonymous reads/update attempt | Audit curl checks returned 200 for anon `profiles`/`analytics` reads and 204 for anon PATCH against a non-existent profile UUID | Confirms this is not theoretical | Fix Supabase policies in production, then repeat anon read/write tests |

## High Findings

| Finding | File | Risk | Status |
| --- | --- | --- | --- |
| Admin user listing and tier/active updates were browser-to-Supabase | `app/admin/users/AdminUsersInner.tsx`, `app/admin/invite/InviteInner.tsx` | Client-side admin controls are unsafe when RLS is wrong | Fixed: reads/writes now go through `/api/admin/users` |
| Analytics route trusted browser-submitted user ID/tier | `app/api/analytics/route.ts` | Users could forge analytics identity and tier | Fixed: route now requires active auth and uses server-derived user ID/tier |
| In-memory rate limits only | `app/api/generate-music/route.ts`, `app/api/analyze/route.ts`, `app/api/vibe-prompt/route.ts` | Easy to bypass on cold starts/multiple instances | Not fixed: move limits to Supabase/Redis before public launch |
| No automated auth/RLS tests | No test files found | Regressions can reopen private app routes | Not fixed: add route and RLS test suite |

## Medium Findings

| Finding | File | Risk | Status |
| --- | --- | --- | --- |
| File upload accepted unknown extensions and had no route-level max size | `app/api/upload-audio/route.ts` | Abuse/cost/availability risk | Fixed: extension allowlist and `UPLOAD_AUDIO_MAX_MB` added |
| No clean CSP before audit | `next.config.ts` | Weaker browser-side XSS mitigation | Fixed baseline CSP; still uses `unsafe-inline` because pages rely on inline CSS/JS |
| Password change UI collected current password but did not verify it | `app/account/AccountInner.tsx` | Misleading security UX | Fixed: current password is required and re-authenticated before update |
| API auth exemption is broad in middleware | `lib/supabase/middleware.ts` | Future API routes may accidentally ship public | Not fixed: keep route-level auth checks mandatory |
| Owner email has a code fallback | `lib/auth/active-user.ts` | Wrong owner if env is missing | Not fixed: set `ADMIN_OWNER_EMAIL` in every environment |
| Remaining dependency advisory | `package-lock.json` | Moderate PostCSS advisory via Next bundled dependency | Not fixed: no safe non-breaking stable fix available from npm audit |

## Low Findings

| Finding | File | Risk | Status |
| --- | --- | --- | --- |
| Deprecated Next middleware convention | `middleware.ts` | Future framework migration friction | Not fixed |
| Unused public dev page | `public/vibe-to-prompt-dev.html` | Confusion / stale copy | Not fixed |
| Inline scripts/styles | Static HTML pages | Harder CSP and testing | Not fixed |

## Supabase Requirements Before Beta

1. Review `scripts/rls_hardening.sql`.
2. Apply it in Supabase SQL Editor.
3. Confirm anon key cannot select `profiles`.
4. Confirm anon key cannot select `analytics`.
5. Confirm anon key cannot update `profiles`.
6. Confirm authenticated non-owner cannot access `/admin/invite`, `/admin/users`, or `/api/admin/users`.
7. Confirm active invited user can access `/home`, `/studio.html`, `/prompts`, `/analyze`, `/create.html`, and `/account`.
8. Confirm inactive invited user is redirected to `/login?error=invite-required`.

## Stripe / Payment Security

No Stripe, checkout, webhook, subscription, cart, order, or fulfillment code was found. Payment readiness is currently "not applicable / not implemented." If revenue is added later, do not unlock paid features from frontend success pages; use verified signed webhooks and idempotent server-side fulfillment.

## Secret Handling

Observed pattern is mostly correct:

- Service-role key is referenced in server routes only.
- Public Supabase URL/anon key are correctly treated as browser-safe.
- No `.env.local` values were printed into documentation.

Required:

- Keep `.env.local` out of git.
- Keep Vercel env values scoped to the `v2/` project.
- Rotate Supabase service role if it was ever pasted into chat, logs, or a public file.

## Commands Used / Recommended

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
npm outdated
```

Recommended additions:

```bash
npx playwright test
npx lighthouse http://localhost:3002/home --view
```
