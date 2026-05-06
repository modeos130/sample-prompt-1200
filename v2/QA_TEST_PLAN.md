# BOOMAN LAB QA Test Plan

Date: 2026-05-06

## Current Test Status

Automated test framework: not present.

Validated during audit:

- `npm run lint` passes.
- `npm run build` passes.
- `npm audit fix` patched non-breaking transitive advisories.
- Build output includes all expected Next app routes.
- Local unauthenticated route smoke on port 3029 passed: `/login` 200, `/vibe-to-prompt.html` 200, `/home` 307 to `/login`, `/admin/invite` 307 to `/login`, `/api/analytics` 401, `/api/admin/users` 401.

Not validated end-to-end in this audit:

- Real authenticated browser session.
- Real Gemini/Lyria generation.
- Real Claude prompt synthesis.
- Real Supabase RLS after policy hardening.
- Mobile visual QA.
- Keyboard-only navigation.

## Minimum Tests Required Before Beta

| Area | Test | Type | Acceptance criteria |
| --- | --- | --- | --- |
| Route gate | Unauthenticated `/home`, `/studio.html`, `/prompts`, `/analyze`, `/create.html`, `/account` | E2E/API smoke | 307/redirect to `/login` |
| Public page | `/vibe-to-prompt.html` | E2E/API smoke | Loads without login |
| Login | Valid invited active user | E2E | Redirects to `/home` |
| Revoked user | Inactive profile | E2E | Cannot access private routes |
| Owner admin | Owner account | E2E | Can load invite/users pages |
| Non-owner admin | Active non-owner | E2E | Cannot load admin pages or admin API |
| Prompt library | Copy prompt | Browser test | Copies full prompt text, not a provider-specific link |
| Studio | Proven sound generation | Manual/API | Known prompt ID generates audio or returns clear provider/quota error |
| Create | Vibe-based generation | Manual/API | Valid genre/vibe returns audio or clear provider/quota error |
| Analyze | Upload supported file | Manual/API | Returns prompt or clear provider/quota error |
| Upload rejection | Unsupported extension and oversized file | API test | 400/413 with safe message |
| RLS | Anonymous DB access | Scripted API test | Anon cannot read/update private tables |

## Minimum Tests Required Before Public Launch

| Area | Test | Type | Acceptance criteria |
| --- | --- | --- | --- |
| Full auth matrix | Anonymous, invited active, invited inactive, owner | Playwright | All route outcomes match access policy |
| API auth matrix | All API routes | Integration | Protected APIs reject anonymous users |
| RLS policy tests | Supabase REST or pgTAP | Integration | Users can only read own profile; no browser analytics access |
| Rate limit persistence | Multi-request and cold-start simulation | Integration | Limits persist across instances |
| Accessibility | Axe/Playwright | Automated | No serious or critical violations |
| Mobile layout | 375px, 768px, desktop | Visual/manual | No overlapping text, no broken CTAs |
| Provider failure | Gemini/Claude failures | Integration/manual | Friendly errors, no secret leakage |
| Dependency audit | npm audit | Security | No high/critical advisories |
| Legal pages | Terms/privacy/license/contact | Manual | Public pages exist and are linked where required |
| Rollback | Vercel rollback | DevOps drill | Known prior deploy can be restored quickly |

## Suggested Tooling

Install later after owner approval:

```bash
npm install --save-dev @playwright/test axe-core
npx playwright install
```

Suggested scripts:

```json
{
  "test:e2e": "playwright test",
  "test:a11y": "playwright test tests/accessibility.spec.ts",
  "check": "npm run lint && npm run build && npm audit --audit-level=moderate"
}
```

## Manual QA Checklist

1. Open `/vibe-to-prompt.html` logged out. Confirm it is the polished coming-soon page.
2. Open `/home` logged out. Confirm redirect to `/login`.
3. Log in as owner. Confirm `/home` loads.
4. Open Sound Studio. Confirm cards render and generation CTA works.
5. Open Prompt Library. Confirm search/filter and copy prompt work.
6. Open Sample Analysis. Upload `mp3`, `wav`, and unsupported file types.
7. Open Create Your Own. Generate a custom idea.
8. Open Account. Confirm password change requires current password.
9. Open Admin Invite. Create test user, copy credentials, revoke user.
10. Log in as revoked test user. Confirm access is blocked.
11. Test 375px mobile width for all main pages.
12. Test keyboard tab order on login, home, prompts, analyze, and admin.

## Future Automated Test Skeleton

Recommended files:

- `tests/auth-routes.spec.ts`
- `tests/admin.spec.ts`
- `tests/prompt-library.spec.ts`
- `tests/upload-api.spec.ts`
- `tests/security-headers.spec.ts`
- `tests/accessibility.spec.ts`
