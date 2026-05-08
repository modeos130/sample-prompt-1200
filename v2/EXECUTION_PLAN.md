# BOOMAN LAB 100% Readiness Execution Plan

Date: 2026-05-06
Current strict production-readiness score: 51/100
Target: 100/100

Operating rule: phases are sequential. Do not begin Phase 2 until Phase 1 is complete and tested.

## Phase 1: Emergency Blockers

### Task 1.1: Lock Down Supabase RLS

- Why it matters: The audit found live anonymous access to private `profiles` and `analytics` data. This is the launch blocker.
- File paths involved:
  - `scripts/rls_hardening.sql`
  - `supabase/migrations/20260506000000_rls_hardening.sql`
  - `scripts/setup.sql`
  - `scripts/verify-rls.mjs`
  - `lib/auth/active-user.ts`
  - `lib/supabase/middleware.ts`
- Exact implementation steps:
  1. Review `scripts/rls_hardening.sql`.
  2. Apply it in Supabase SQL Editor or with an approved database migration tool.
  3. Do not expose database credentials or service-role keys in chat.
  4. Run `npm run verify:rls`.
  5. Confirm anonymous reads return no private rows.
  6. Confirm anonymous profile update attempts return no updated rows.
- Risk level: Critical.
- Whether Codex can do it now: Partially. Codex can prepare and run verification. Applying SQL requires owner approval and a database execution path.
- How I test it:
  - `npm run verify:rls`
  - Local unauthenticated route checks.
- Acceptance criteria:
  - Anonymous `profiles` select returns zero rows or is denied.
  - Anonymous `analytics` select returns zero rows or is denied.
  - Anonymous profile PATCH against an existing user returns zero changed rows or is denied.
  - Active invited users still work after the policy change.
  - Owner admin APIs still work after the policy change.

### Task 1.2: Verify Private Route Gate

- Why it matters: Discovering URLs must not bypass the private invite-only app.
- File paths involved:
  - `middleware.ts`
  - `lib/supabase/middleware.ts`
  - `app/api/*/route.ts`
  - `public/studio.html`
  - `public/create.html`
- Exact implementation steps:
  1. Start local dev server on an unused port.
  2. Check logged-out public routes.
  3. Check logged-out protected routes.
  4. Check anonymous protected APIs.
  5. Repeat in production after deploy.
- Risk level: Critical.
- Whether Codex can do it now: Yes for logged-out/local checks. Authenticated owner/user checks require credentials/session.
- How I test it:
  - `curl -I http://localhost:PORT/login`
  - `curl -I http://localhost:PORT/vibe-to-prompt.html`
  - `curl -I http://localhost:PORT/home`
  - `curl -I http://localhost:PORT/admin/invite`
  - `curl -i -X POST http://localhost:PORT/api/analytics`
  - `curl -i http://localhost:PORT/api/admin/users`
- Acceptance criteria:
  - `/login` returns 200.
  - `/vibe-to-prompt.html` returns 200.
  - `/home`, `/studio.html`, `/prompts`, `/analyze`, `/create.html`, `/account`, and `/admin/*` redirect to `/login` when logged out.
  - Anonymous protected APIs return 401.

### Task 1.3: Confirm Admin User Management Is Server-Side

- Why it matters: Admin tier/active changes must not rely on browser-side Supabase policies.
- File paths involved:
  - `app/api/admin/users/route.ts`
  - `app/admin/users/AdminUsersInner.tsx`
  - `app/admin/invite/InviteInner.tsx`
- Exact implementation steps:
  1. Confirm admin UI fetches `/api/admin/users`.
  2. Confirm non-owner requests return 403.
  3. Confirm anonymous requests return 401.
  4. Confirm owner can list and update users.
- Risk level: High.
- Whether Codex can do it now: Partially. Anonymous/local API check is done; owner/non-owner requires sessions.
- How I test it:
  - `curl -i http://localhost:PORT/api/admin/users`
  - Browser owner login manual test.
- Acceptance criteria:
  - No admin page directly selects or updates all `profiles` from the browser.
  - Anonymous admin API returns 401.
  - Non-owner admin API returns 403.
  - Owner admin API succeeds.

## Phase 2: Security Hardening

### Task 2.1: Add Automated Auth/RLS Regression Tests

- Why it matters: The same class of bug must not reappear silently.
- File paths involved: `package.json`, `scripts/verify-rls.mjs`, `scripts/verify-routes.mjs`.
- Exact implementation steps: add route matrix verification, keep RLS verification, and run both through `npm run verify:security`.
- Risk level: High.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: `npm run verify:rls`, `npm run verify:routes`, `npm run verify:security`.
- Acceptance criteria: CI fails if private routes or RLS regress.

### Task 2.2: Replace In-Memory Rate Limits

- Why it matters: Current rate limits reset on serverless cold starts and can allow provider spend spikes.
- File paths involved: `app/api/generate-music/route.ts`, `app/api/analyze/route.ts`, `app/api/vibe-prompt/route.ts`, Supabase migrations.
- Exact implementation steps: create `rate_limits` table, use atomic upsert/RPC, enforce tier limits server-side.
- Risk level: High.
- Whether Codex can do it now: Yes after Phase 1, with DB migration approval.
- How I test it: repeated API calls across restarts.
- Acceptance criteria: limits persist across server restarts and multiple instances.

### Task 2.3: Reduce CSP Inline Requirements

- Why it matters: `unsafe-inline` weakens XSS protection.
- File paths involved: `next.config.ts`, `public/*.html`, `app/*`.
- Exact implementation steps: move inline JS/CSS into files/components, remove `unsafe-inline` where possible.
- Risk level: Medium.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: browser console, route smoke, CSP header inspection.
- Acceptance criteria: no broken UI and stricter CSP.

## Phase 3: Payment/Data/Auth Correctness

### Task 3.1: Define Payment Model Before Coding

- Why it matters: Payment flow is currently missing; building it without business rules creates security and refund risk.
- File paths involved: `PAYMENT_MODEL.md`, future `app/api/checkout/*`, `app/api/webhooks/stripe/*`, DB migrations.
- Exact implementation steps: current private-only/no-payment model documented; future work must decide paid tiers, products/prices, refund policy, and access unlock rules before coding checkout.
- Risk level: Medium now, Critical before monetization.
- Whether Codex can do it now: Current no-payment model documented; paid implementation requires owner decisions.
- How I test it: Stripe test mode checkout and signed webhook tests.
- Acceptance criteria: no frontend-fake payment success; server-side fulfillment only.

### Task 3.2: Add Admin Audit Logs

- Why it matters: Invites, revokes, and tier changes should be traceable.
- File paths involved: `app/api/admin/*`, `lib/admin/audit.ts`, Supabase migration.
- Exact implementation steps: `admin_audit_events` table added; invite, revoke, restore, tier, and active updates now insert audit rows after successful admin mutations.
- Risk level: Medium.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: perform admin action and query audit log.
- Acceptance criteria: every admin action records actor, target, action, timestamp.

## Phase 4: UX/UI Polish

### Task 4.1: Clarify Private Entry Flow

- Why it matters: Invited users may land on `/` and see coming soon instead of an obvious login path.
- File paths involved: `app/page.tsx`, `public/vibe-to-prompt.html`, `app/home/page.tsx`.
- Exact implementation steps: public page copy and CTAs now clearly direct invited members to sign in while preserving request-access/private-beta posture.
- Risk level: Low.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: logged-out navigation.
- Acceptance criteria: invited users can find login without guessing.

### Task 4.2: Standardize Static and React Navigation

- Why it matters: Pages should feel like one product.
- File paths involved: `public/studio.html`, `public/create.html`, `app/prompts/page.tsx`, `app/analyze/page.tsx`.
- Exact implementation steps: active tool tabs now expose `aria-current="page"` and static/React hover behavior is aligned.
- Risk level: Low.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: mobile/desktop visual pass.
- Acceptance criteria: all core pages expose the four primary tools consistently.

## Phase 5: Error Handling

### Task 5.1: Standardize API Error Responses

- Why it matters: Users should see safe messages; logs should contain enough detail for debugging without leaking secrets.
- File paths involved: all `app/api/*/route.ts`, `lib/api/errors.ts`, `lib/auth/active-user.ts`, `scripts/verify-routes.mjs`.
- Exact implementation steps: shared `apiError` and provider mapping added; API failures keep the `error` string and now include `ok:false` plus a stable `code`; route verifier now fails if protected API errors do not use the standard shape.
- Risk level: Medium.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: force missing env/provider errors.
- Acceptance criteria: consistent status codes and safe JSON shape.

### Task 5.2: Add Provider Failure UI States

- Why it matters: AI providers fail or hit quota; the UI needs clear recovery paths.
- File paths involved: `public/studio.html`, `public/create.html`, `app/analyze/page.tsx`.
- Exact implementation steps: generation pages now map provider/rate/auth/content error codes to clearer retry/contact guidance; sample analysis now shows failures in a dedicated retryable error panel instead of the copyable prompt result.
- Risk level: Medium.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: simulate 429/500 responses.
- Acceptance criteria: no blank or misleading failure states.

## Phase 6: Testing

### Task 6.1: Add Playwright E2E Suite

- Why it matters: Route gates, prompt copy, and admin checks need repeatable proof.
- File paths involved: `tests/*.spec.ts`, `package.json`, `playwright.config.ts`.
- Exact implementation steps: Playwright installed; route-gate, standardized API auth-error, public/login UI, and optional authenticated prompt-library smoke tests added.
- Risk level: High.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: `npm run test:e2e`.
- Acceptance criteria: tests pass locally and in CI.

### Task 6.2: Add Accessibility Tests

- Why it matters: Keyboard and screen-reader blockers should be caught early.
- File paths involved: `tests/accessibility.spec.ts`.
- Exact implementation steps: axe-core checks added for the public entry page, login page, protected-route login redirect, and optional authenticated private hub.
- Risk level: Medium.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: `npm run test:a11y`.
- Acceptance criteria: no serious/critical axe failures.

## Phase 7: Legal/Compliance Pages

### Task 7.1: Add Public Legal Pages

- Why it matters: Public launch requires clear terms around privacy, uploads, AI output, and copyrights.
- File paths involved: `app/legal/LegalPage.tsx`, `app/terms/page.tsx`, `app/privacy/page.tsx`, `app/acceptable-use/page.tsx`, `app/copyright/page.tsx`, `lib/supabase/middleware.ts`, `app/login/LoginInner.tsx`, `public/vibe-to-prompt.html`.
- Exact implementation steps: draft founder-friendly pages, add footer links, expose the legal routes through middleware, and keep owner/counsel review as the remaining legal approval gate.
- Risk level: High for public launch.
- Whether Codex can do it now: Draft pages and route/test coverage completed; legal approval still requires owner/counsel.
- How I test it: route/page review, `npm run test:e2e`, `npm run test:a11y`, `npm run verify:security`.
- Acceptance criteria: pages exist, are public without exposing private app routes, are linked from public/login surfaces, and pass automated route/accessibility checks.

## Phase 8: Performance/SEO

### Task 8.1: Add Launch-Mode SEO Controls

- Why it matters: Private beta should be noindex; public launch should have clean metadata.
- File paths involved: `app/layout.tsx`, `public/robots.txt`, future `app/sitemap.ts`.
- Exact implementation steps: keep private noindex now; add public metadata and sitemap when launch mode changes.
- Risk level: Low.
- Whether Codex can do it now: Private noindex is done; public SEO waits.
- How I test it: inspect `/robots.txt` and page metadata.
- Acceptance criteria: private site is not indexed; public launch has correct indexable pages.

### Task 8.2: Profile Bundle and Audio Payloads

- Why it matters: Long audio/base64 payloads can hurt speed and reliability.
- File paths involved: `app/api/generate-music/route.ts`, `public/*.html`.
- Exact implementation steps: add bundle analyzer, evaluate audio storage/signed URL approach.
- Risk level: Medium.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: Lighthouse/bundle report.
- Acceptance criteria: no major mobile performance bottlenecks.

## Phase 9: Deployment Readiness

### Task 9.1: Add CI Gate

- Why it matters: Broken builds or security regressions should not deploy.
- File paths involved: `.github/workflows/ci.yml`, `package.json`.
- Exact implementation steps: run lint, build, audit, E2E smoke in CI.
- Risk level: Medium.
- Whether Codex can do it now: Yes after Phase 1.
- How I test it: GitHub Actions pass/fail.
- Acceptance criteria: PR cannot merge with failed checks.

### Task 9.2: Add Rollback Runbook

- Why it matters: The owner needs a fast recovery path.
- File paths involved: `LAUNCH_CHECKLIST.md`, Vercel dashboard.
- Exact implementation steps: document last-good deploy, rollback command, incident steps.
- Risk level: Medium.
- Whether Codex can do it now: Mostly done; refine after deployment flow.
- How I test it: dry-run rollback plan.
- Acceptance criteria: owner can identify and restore last good deploy.

## Phase 10: Final Launch Checklist

### Task 10.1: Run Full Launch Rehearsal

- Why it matters: Final readiness requires proving the full product, not just code.
- File paths involved: all docs, app routes, Vercel, Supabase.
- Exact implementation steps: run all tests, manual provider smoke, route matrix, legal review, backup check, deploy preview, production deploy.
- Risk level: Critical.
- Whether Codex can do it now: Only after Phases 1-9.
- How I test it: complete checklist in `LAUNCH_CHECKLIST.md`.
- Acceptance criteria: 100/100 score, no critical/high blockers, owner-approved production launch.
