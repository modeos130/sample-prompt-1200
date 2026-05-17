# BOOMAN LAB Launch Checklist

Date: 2026-05-08

## Before Private Beta

- [ ] Apply and verify `scripts/rls_hardening.sql` in Supabase.
- [ ] Confirm anonymous Supabase clients cannot read/update `profiles`.
- [ ] Confirm anonymous Supabase clients cannot read/insert/update `analytics`.
- [ ] Set `ADMIN_OWNER_EMAIL` in Vercel production and preview environments.
- [ ] Confirm owner can access `/admin/invite` and `/admin/users`.
- [ ] Confirm active invited users can access private pages.
- [ ] Confirm inactive users are blocked everywhere except `/login`.
- [ ] Confirm `npm run lint` passes.
- [ ] Confirm `npm run build` passes.
- [ ] Confirm `npm audit --audit-level=moderate` has no high/critical findings.
- [ ] Manually smoke-test Gemini sample analysis.
- [ ] Manually smoke-test Lyria generation from Sound Studio.
- [ ] Manually smoke-test custom Create Your Own generation.
- [ ] Verify mobile layout on iPhone-sized viewport.
- [ ] Run `npm run verify:seo` and confirm private beta remains noindex.
- [ ] Run `npm run verify:performance`.
- [ ] Confirm GitHub Actions CI passes on the launch branch.
- [ ] Review `DEPLOYMENT_RUNBOOK.md` before first production promotion.

## Before Public Launch

- [x] Add draft Terms of Service.
- [x] Add draft Privacy Policy.
- [ ] Add Cookie Policy if analytics/cookies beyond auth are used.
- [x] Add AI music/audio usage disclaimer.
- [x] Add copyright/DMCA contact language.
- [x] Add acceptable use rules for uploaded audio.
- [x] Add contact/support email.
- [x] Add automated Playwright route/auth tests.
- [x] Add Supabase RLS regression tests.
- [x] Move rate limits from memory to Supabase or Redis.
- [ ] Owner/counsel review of draft legal pages.
- [ ] Add monitoring/error tracking.
- [ ] Add uptime monitoring.
- [ ] Add structured server logs without secrets.
- [x] Add CI for lint/build/audit/test.
- [ ] Configure GitHub branch protection to require CI before merge.
- [ ] Decide whether `/vibe-to-prompt-dev.html` should be removed or blocked.
- [ ] Migrate `middleware.ts` to the Next 16 `proxy.ts` convention.
- [ ] Replace inline-page CSP dependencies where practical, then remove `unsafe-inline`.
- [x] Add private-beta sitemap and robots policy.
- [ ] Approve public indexing mode and final public sitemap before opening access.
- [ ] Add branded Open Graph image and metadata per page.

## After Launch

- [ ] Review Supabase auth logs weekly during beta.
- [ ] Review API provider spend daily during beta.
- [ ] Review error logs after every deploy.
- [ ] Re-run `npm audit` weekly.
- [ ] Back up Supabase data regularly.
- [ ] Keep an owner-only break-glass account active.
- [ ] Maintain a changelog of releases.

## Emergency Rollback

Use `DEPLOYMENT_RUNBOOK.md` as the source of truth.

1. Identify the current production Vercel deployment.
2. Identify the last known-good deployment.
3. Use Vercel dashboard rollback or `vercel promote <last-known-good-deployment-url> --yes`.
4. If database policy caused the incident, revert only the policy change, not table data.
5. If a secret leaked, rotate it immediately in Supabase/Google AI/Vercel.
6. Re-run route-gate checks before announcing recovery.

## Production Deployment Command

Run from repo root, not from `v2/`:

```bash
cd /Users/booman/Documents/sample-prompt-1200
vercel deploy --prod --yes
```

Do not deploy production until the private route gate and RLS checks pass.
