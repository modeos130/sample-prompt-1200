# BOOMAN LAB Deployment And Rollback Runbook

Date: 2026-05-08

This runbook keeps Booman Lab private while giving the owner a clear production recovery path. Do not deploy, promote, or roll back production unless the owner explicitly approves the action.

## Production Facts

- App root: `v2/`
- Repo root: `/Users/booman/Documents/sample-prompt-1200`
- Production domain: `https://boomanlab.com`
- Hosting: Vercel
- Private posture: public landing/legal/login pages only; studio tools remain invite-only.

## Required Pre-Deploy Checks

Run from `v2/`:

```bash
npm run verify:ci
npm run verify:seo
npm run verify:performance
npm run test:e2e
npm run test:a11y
```

With a local dev server running on port `3029`, also run:

```bash
npm run verify:security
```

Before production, manually confirm:

- Owner login works.
- Active invited user can reach `/home`, `/studio.html`, `/prompts`, `/analyze`, `/create.html`, and `/account`.
- Inactive user is blocked.
- Owner can reach `/admin/invite` and `/admin/users`.
- Gemini prompt/sample-analysis and Lyria provider flows return either a valid result or a clear provider/quota error.

## Production Deploy

Run Vercel commands from the repo root, not from `v2/`:

```bash
cd /Users/booman/Documents/sample-prompt-1200
vercel deploy --prod --yes
```

Record the production deployment URL and deployment ID in the release notes before announcing it.

## Identify Current And Previous Deployments

Use the Vercel dashboard first when possible:

1. Open the Booman Lab Vercel project.
2. Go to Deployments.
3. Find the deployment currently assigned to `boomanlab.com`.
4. Identify the last known-good production deployment before the incident.

CLI fallback from the repo root:

```bash
cd /Users/booman/Documents/sample-prompt-1200
vercel ls
```

Do not paste tokens, deployment secrets, or environment values into chat.

## Rollback Path

Preferred dashboard path:

1. In Vercel Deployments, open the last known-good deployment.
2. Confirm it belongs to the same project and uses the `v2/` root.
3. Promote or assign the production domain to that deployment.
4. Wait for `https://boomanlab.com` to resolve to the restored deployment.

CLI fallback:

```bash
cd /Users/booman/Documents/sample-prompt-1200
vercel promote <last-known-good-deployment-url> --yes
```

Only promote a deployment that has already been identified as known-good.

## Post-Rollback Verification

Run these checks immediately after rollback:

```bash
curl -I https://boomanlab.com/vibe-to-prompt.html
curl -I https://boomanlab.com/login
curl -I https://boomanlab.com/home
```

Expected logged-out behavior:

- `/vibe-to-prompt.html` returns `200`.
- `/login` returns `200`.
- `/home` redirects to `/login`.

Then manually verify owner login and one representative private route.

## Database Or RLS Incident

If a Supabase policy causes an incident:

1. Do not delete table data.
2. Revert only the policy change that caused the break.
3. Re-run `npm run verify:security` against a local or preview environment.
4. Confirm anonymous users cannot read `profiles`, `analytics`, `rate_limits`, or `admin_audit_events`.

## Secret Incident

If a key, token, webhook secret, or service-role credential is exposed:

1. Rotate the exposed credential in the provider dashboard.
2. Update Vercel environment variables.
3. Redeploy or promote a clean deployment.
4. Review logs for suspicious usage.
5. Do not share the secret value in chat, pull requests, screenshots, or issue comments.

## Incident Notes Template

Use this template in release notes or an internal incident note:

```text
Incident time:
Symptom:
Current production deployment:
Last known-good deployment:
Rollback action taken:
Verification commands/results:
Remaining follow-up:
```
