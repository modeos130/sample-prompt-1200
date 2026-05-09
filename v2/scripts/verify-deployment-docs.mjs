import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function readRepoFile(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

const workflow = await readRepoFile(".github/workflows/ci.yml");
assert(workflow.includes("npm audit --audit-level=high"), "CI workflow must block high/critical npm advisories.");
assert(workflow.includes("npm run verify:ci"), "CI workflow must run verify:ci.");
assert(workflow.includes("npm run verify:seo"), "CI workflow must run verify:seo.");
assert(workflow.includes("npm run verify:security"), "CI workflow must run verify:security.");
assert(workflow.includes("npm run test:e2e"), "CI workflow must run test:e2e.");
assert(workflow.includes("npm run test:a11y"), "CI workflow must run test:a11y.");
assert(workflow.includes("SUPABASE_SERVICE_ROLE_KEY"), "CI workflow must require Supabase service-role secret for security verification.");

const runbook = await readRepoFile("v2/DEPLOYMENT_RUNBOOK.md");
assert(runbook.includes("vercel deploy --prod --yes"), "Runbook must document production deployment command.");
assert(runbook.includes("vercel promote <last-known-good-deployment-url> --yes"), "Runbook must document rollback promote command.");
assert(runbook.includes("npm run verify:security"), "Runbook must document security verification.");
assert(runbook.includes("Do not deploy, promote, or roll back production unless the owner explicitly approves"), "Runbook must preserve explicit owner approval.");
assert(runbook.includes("Secret Incident"), "Runbook must document secret-rotation response.");

const checklist = await readRepoFile("v2/LAUNCH_CHECKLIST.md");
assert(checklist.includes("Confirm GitHub Actions CI passes on the launch branch."), "Launch checklist must include CI verification.");
assert(checklist.includes("Review `DEPLOYMENT_RUNBOOK.md`"), "Launch checklist must include rollback runbook review.");

if (failures.length) {
  console.error("\nDeployment documentation verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Deployment documentation verification passed.");
