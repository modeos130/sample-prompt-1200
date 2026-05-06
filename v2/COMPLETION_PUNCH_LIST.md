# BOOMAN LAB Completion Punch List

Date: 2026-05-06

## Must Fix Before Beta

| Priority | File / area | Task | Difficulty | Business impact | Technical risk | Estimate | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Supabase | Apply and verify RLS hardening | Medium | Protects private users and invite list | Critical | 30-60 min | Anon cannot read/update `profiles` or `analytics` |
| P0 | Auth/Admin | Verify owner-only admin in production | Low | Prevents unauthorized invites/revokes | High | 20 min | Non-owner gets 403/redirect; owner succeeds |
| P1 | API limits | Move generation/analyze/vibe limits from memory to database/Redis | Medium | Controls provider spend | High | 0.5-1 day | Limits persist across serverless cold starts |
| P1 | QA | Add minimum Playwright auth route tests | Medium | Reduces launch regressions | Medium | 0.5-1 day | CI can prove private routes are gated |
| P1 | Providers | Manual smoke-test Gemini, Lyria, and Claude with production env | Low | Confirms core product works | Medium | 30-60 min | Each core workflow returns expected result or clear quota error |

## Must Fix Before Public Launch

| Priority | File / area | Task | Difficulty | Business impact | Technical risk | Estimate | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P0 | Legal pages | Terms, Privacy, Copyright/DMCA, Acceptable Use, AI/audio disclaimer | Medium | Reduces legal exposure | High | 0.5-2 days plus legal review | Pages exist and are linked |
| P0 | Security | No high/critical dependency advisories | Medium | Reduces known exploit exposure | Medium | Depends on Next release | `npm audit` has no high/critical findings |
| P1 | Monitoring | Add error tracking and uptime checks | Medium | Faster incident response | Medium | 0.5 day | Owner gets alerts on API/page failures |
| P1 | CI/CD | Add GitHub Actions or Vercel checks for lint/build/audit/tests | Medium | Prevents broken deploys | Medium | 0.5 day | PR checks block failed builds |
| P1 | Next migration | Move `middleware.ts` to `proxy.ts` | Low | Future Next compatibility | Low | 1-2 hr | Build has no middleware deprecation warning |
| P1 | Public SEO | Add robots/sitemap/canonicals/OG image | Low | Brand trust and share quality | Low | 2-4 hr | Social previews render correctly |

## Should Fix Soon After Launch

| Priority | File / area | Task | Difficulty | Business impact | Technical risk | Estimate | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P2 | Static HTML pages | Convert `studio.html` and `create.html` to React pages | High | Easier maintenance and testing | Medium | 2-4 days | Same UI/functionality with typed components |
| P2 | Public assets | Remove or block `vibe-to-prompt-dev.html` | Low | Reduces confusion | Low | 30 min | URL 404s, redirects, or is protected |
| P2 | Accessibility | Add automated axe checks and fix serious issues | Medium | Better usability/compliance | Medium | 1 day | No serious/critical axe failures |
| P2 | Analytics | Add owner dashboard for usage and provider spend | Medium | Better operational control | Medium | 1-2 days | Owner can view daily generations/uploads |

## Nice to Have

| Priority | File / area | Task | Difficulty | Business impact | Technical risk | Estimate | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P3 | Generated audio | Save generation history and downloads | Medium | Better user value | Medium | 1-2 days | Users can retrieve recent generations |
| P3 | Provider abstraction | Prepare for future Suno API | Medium | Easier backend expansion | Medium | 1-2 days | Lyria and future providers share a typed interface |
| P3 | UX polish | Add more motion/depth after performance review | Low | Brand polish | Low | 0.5 day | Motion respects reduced-motion preference |

## Future Version

- Team/workspace accounts.
- Paid tiers and Stripe checkout.
- Customer portal and subscription management.
- Prompt versioning.
- Prompt/art CMS.
- Usage-based billing controls.
- Download/license history.
