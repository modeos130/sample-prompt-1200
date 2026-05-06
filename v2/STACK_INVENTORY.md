# BOOMAN LAB Stack Inventory

Date: 2026-05-06

## Summary

The production app lives in `v2/`. The repository root also contains older/unrelated artifacts, but Vercel is configured to deploy the Next.js app from `v2/`.

| Technology / service | Purpose | Where it appears | Required env vars | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| Next.js 16 App Router | Frontend and API framework | `package.json`, `app/`, `next.config.ts` | None directly | Medium | `middleware.ts` convention is deprecated in Next 16; migrate to `proxy.ts` before public launch. |
| React 19 | UI runtime | `package.json`, `app/*` | None | Low | Mostly page-local components and inline styling. |
| TypeScript | Static typing | `tsconfig.json`, `.tsx`, `.ts` | None | Low | Build runs TypeScript successfully. |
| Tailwind CSS 4 | Utility CSS | `globals.css`, `postcss.config.mjs`, package deps | None | Low | Most pages use inline CSS instead of shared design tokens. |
| Supabase Auth | Login/session handling | `lib/supabase/*`, `middleware.ts`, `app/login` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | High | Invite-only access depends on `profiles.active`. |
| Supabase Postgres | Profiles and analytics data | `scripts/setup.sql`, API routes | Supabase vars | Critical | Live policy shape allowed anonymous reads and update attempts during audit. Apply `scripts/rls_hardening.sql`. |
| Supabase service role | Server-side admin and analytics writes | `app/api/admin/*`, `app/api/analytics` | `SUPABASE_SERVICE_ROLE_KEY` | High | Must remain server-only. Never expose in client code. |
| Google Gemini | Sample analysis and file upload | `app/api/analyze`, `app/api/upload-audio` | `GEMINI_KEY`, `GEMINI_MODEL` | Medium | Upload route now enforces size and extension checks. |
| Google Lyria via Gemini API | Music/audio generation | `app/api/generate-music` | `GEMINI_KEY`, `LYRIA_*` | Medium | Generation returns base64 audio; no persistent job queue or storage. |
| Anthropic Claude | Custom prompt synthesis | `app/api/vibe-prompt`, `app/api/generate-music` | `ANTHROPIC_API_KEY`, `CLAUDE_MODEL` | Medium | Prompt rules are server-side. |
| Vercel | Hosting/deployment | `vercel.json`, deployment history | Vercel project env vars | Medium | Manual production promotion/deploy has been used. |
| Static HTML pages | Studio/Create/Vibe surfaces | `public/studio.html`, `public/create.html`, `public/vibe-to-prompt.html` | API routes only | Medium | Large inline CSS/JS; protected by middleware except public vibe page. |
| Security headers | Baseline browser hardening | `next.config.ts` | None | Medium | CSP added; uses `unsafe-inline` because current pages rely on inline scripts/styles. |
| ESLint | Linting | `eslint.config.mjs`, `npm run lint` | None | Low | Passes. |
| npm audit | Dependency vulnerability scanning | `package-lock.json` | Network | Medium | Remaining moderate advisory is Next's bundled PostCSS. |
| Testing framework | Not present | None | None | High | No automated tests, no E2E suite, no RLS tests. |
| Payments | Not implemented | No Stripe/payment code found | None in code | Medium | Do not claim payment readiness. |
| Email provider | Not implemented | No provider code found | None | Medium | Invites display credentials in owner UI; no automated email. |
| Monitoring/logging | Minimal console logging | API routes | None | Medium | No Sentry, Logtail, uptime checks, or structured audit logs. |
| robots/noindex | Private-beta crawl control | `app/layout.tsx`, `public/robots.txt`, static HTML | None | Low | Blocks indexing while the app is invite-only. |

## Dependency Freshness

Updated during audit:

- `next` to `^16.2.4`
- `eslint-config-next` to `^16.2.4`
- `react` / `react-dom` to `^19.2.5`
- `@supabase/supabase-js` to `^2.105.3`
- Tailwind packages to `^4.2.4`
- `@types/node` to `^20.19.39`

Remaining outdated major-only packages:

- `@types/node` latest major 25, current supported line 20
- `eslint` latest major 10, current 9
- `typescript` latest major 6, current 5

Remaining audit advisory:

- Moderate PostCSS advisory through Next's bundled `postcss@8.4.31`. `npm audit fix --force` suggests an invalid downgrade to `next@9.3.3`, so do not run it. Track Next release notes for a fixed stable release.

## Suspicious / Unused / Cleanup Candidates

| Item | Reason | Risk |
| --- | --- | --- |
| `components/AudioUploader.tsx`, `GenreSelector.tsx`, `PromptOutput.tsx`, `AnalysisOutput.tsx`, `SunoSettings.tsx` | No imports found from `app/` | Low |
| `public/vibe-to-prompt-dev.html` | Dev/older copy of prompt tool remains in public assets | Medium |
| Root `README.md`, `netlify.toml`, `hotel-simulator/` | Appear unrelated to deployed `v2/` app | Low |
| Inline CSS/JS across static HTML pages | Harder to maintain, test, and enforce CSP cleanly | Medium |
| In-memory rate limits | Reset on serverless cold start and do not coordinate across instances | High |
