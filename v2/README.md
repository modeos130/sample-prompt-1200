# BOOMAN LAB

Private AI music production studio for sample-minded producers. The app combines a sound-generation studio, prompt library, sample-analysis workflow, custom prompt/sound creation, invite-only authentication, and owner-only user administration.

## Current Status

- App framework: Next.js 16 App Router
- Runtime target: Vercel, with this `v2/` folder as the project root
- Access model: private invite-only app, with `/vibe-to-prompt.html` intentionally public as the branded coming-soon/private-beta page
- Database/auth: Supabase Auth plus `profiles` and `analytics` tables
- AI providers: Google Gemini/Lyria and Anthropic Claude
- Payments: not implemented yet

## Main Routes

| Path | Purpose | Access |
| --- | --- | --- |
| `/` | Redirects public visitors to `/vibe-to-prompt.html` | Public |
| `/vibe-to-prompt.html` | Branded coming-soon/private-beta page | Public |
| `/login` | Invite-only login | Public |
| `/terms` | Draft terms for private beta use | Public |
| `/privacy` | Draft privacy policy for account, upload, and AI request data | Public |
| `/acceptable-use` | Draft usage rules for uploads and AI music tools | Public |
| `/copyright` | Draft copyright and takedown guidance | Public |
| `/home` | Private tool hub | Active invited user |
| `/studio.html` | Sound Studio generation UI | Active invited user |
| `/prompts` | Prompt Library | Active invited user |
| `/analyze` | Sample Analysis | Active invited user |
| `/create.html` | Create Your Own sound generator | Active invited user |
| `/account` | Account and password update | Active invited user |
| `/admin/invite` | Owner invite/admin page | Owner only |
| `/admin/users` | Owner user management | Owner only |

## Required Environment Variables

Copy `.env.example` to `.env.local` for local development. Never commit `.env.local`.

| Variable | Required | Used for |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser and server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser and server Supabase auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side admin, invite, revoke, analytics writes |
| `ADMIN_OWNER_EMAIL` | Yes for production | Owner-only admin authorization |
| `GEMINI_KEY` | Yes | Gemini sample analysis and Lyria generation |
| `ANTHROPIC_API_KEY` | Yes | Claude prompt creation |
| `CLAUDE_MODEL` | Optional | Claude model override |
| `GEMINI_MODEL` | Optional | Gemini analysis model override |
| `LYRIA_CLIP_MODEL` | Optional | Lyria clip model override |
| `LYRIA_PRO_MODEL` | Optional | Lyria full/pro model override |
| `RATE_LIMIT_CALLS` | Optional | Vibe prompt daily in-memory rate limit |
| `RATE_LIMIT_WINDOW` | Optional | Vibe/analyze rate window in ms |
| `ANALYZE_RATE_LIMIT` | Optional | Sample-analysis daily in-memory rate limit |
| `MUSIC_RATE_WINDOW` | Optional | Music generation rate window in ms |
| `MONTHLY_HARD_CAP` | Optional | Instance-level analyze/vibe cap |
| `UPLOAD_AUDIO_MAX_MB` | Optional | Upload route max file size, default 25 MB |

## Local Development

```bash
cd /Users/booman/Documents/sample-prompt-1200/v2
npm install
npm run dev
```

If port 3000 is occupied:

```bash
npm run dev -- --port 3002
```

## Validation Commands

```bash
cd /Users/booman/Documents/sample-prompt-1200/v2
npm run lint
npm run build
npm run verify:security
npm run test:e2e
npm run test:a11y
npm audit --audit-level=moderate
npm outdated
```

`test:e2e` and `test:a11y` run anonymous/public checks by default. Authenticated smoke tests are present but skipped unless `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` are set in the shell.

## Database Setup

The original setup script is at `scripts/setup.sql`. Existing production Supabase policy hardening should use `scripts/rls_hardening.sql` after review.

Important: do not run database migrations blindly. Review SQL in Supabase SQL Editor first and confirm the current table/policy state.

## Deployment

The Vercel project is configured with `v2/` as the root directory. Run Vercel commands from the repository root:

```bash
cd /Users/booman/Documents/sample-prompt-1200
vercel deploy --prod --yes
```

Production deployment should only happen after:

1. `npm run lint` passes.
2. `npm run build` passes.
3. Supabase RLS policies are verified.
4. Protected routes redirect unauthenticated visitors to `/login`.
5. Owner-only admin routes reject non-owner users.
6. Draft legal/privacy pages are reviewed and accepted for the current private-beta stage.

## Common Troubleshooting

- Login says Supabase URL/API key are missing: restart the dev server after creating `.env.local`, then hard-refresh the browser.
- Protected page redirects to login after valid login: check `profiles.active` for that user.
- Admin page redirects to `/home`: set `ADMIN_OWNER_EMAIL` to the owner account email in Vercel and local `.env.local`.
- Gemini/Lyria generation fails: confirm `GEMINI_KEY`, model availability, and provider quota.
- Claude prompt generation fails: confirm `ANTHROPIC_API_KEY` and `CLAUDE_MODEL`.

## Launch Documents

- `STACK_INVENTORY.md`
- `SECURITY_AUDIT.md`
- `QA_TEST_PLAN.md`
- `LAUNCH_CHECKLIST.md`
- `COMPLETION_PUNCH_LIST.md`
- `PROFESSIONAL_READINESS_AUDIT_REPORT.md`
- `PAYMENT_MODEL.md`
