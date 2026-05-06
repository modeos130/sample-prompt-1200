# BOOMAN LAB Launch Checklist

Date: 2026-05-06

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
- [ ] Create a simple incident/rollback note for the owner.

## Before Public Launch

- [ ] Add Terms of Service.
- [ ] Add Privacy Policy.
- [ ] Add Cookie Policy if analytics/cookies beyond auth are used.
- [ ] Add AI music/audio usage disclaimer.
- [ ] Add copyright/DMCA contact language.
- [ ] Add acceptable use rules for uploaded audio.
- [ ] Add contact/support page or support email.
- [ ] Add automated Playwright route/auth tests.
- [ ] Add Supabase RLS regression tests.
- [ ] Move rate limits from memory to Supabase or Redis.
- [ ] Add monitoring/error tracking.
- [ ] Add uptime monitoring.
- [ ] Add structured server logs without secrets.
- [ ] Add CI for lint/build/audit/test.
- [ ] Decide whether `/vibe-to-prompt-dev.html` should be removed or blocked.
- [ ] Migrate `middleware.ts` to the Next 16 `proxy.ts` convention.
- [ ] Replace inline-page CSP dependencies where practical, then remove `unsafe-inline`.
- [ ] Add sitemap and robots policy matching the private/public launch state.
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

1. Identify last known good Vercel deployment.
2. Use Vercel dashboard rollback or CLI promote for the last good deployment.
3. If database policy caused the incident, revert only the policy change, not table data.
4. If a secret leaked, rotate it immediately in Supabase/Gemini/Anthropic/Vercel.
5. Re-run route-gate checks before announcing recovery.

## Production Deployment Command

Run from repo root, not from `v2/`:

```bash
cd /Users/booman/Documents/sample-prompt-1200
vercel deploy --prod --yes
```

Do not deploy production until the private route gate and RLS checks pass.
