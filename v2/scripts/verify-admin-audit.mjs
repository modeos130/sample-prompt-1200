import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey || !anonKey) {
  console.error("Missing Supabase env vars required for admin audit verification.");
  process.exit(1);
}

const restBase = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
const marker = `codex-verify-${Date.now()}`;

async function request(path, key, options = {}) {
  const res = await fetch(`${restBase}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers ?? {}),
    },
  });
  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }
  return { status: res.status, json };
}

async function cleanup() {
  await request(
    `/admin_audit_events?metadata->>marker=eq.${encodeURIComponent(marker)}`,
    serviceKey,
    { method: "DELETE", headers: { Prefer: "return=minimal" } }
  );
}

const failures = [];

try {
  const anonSelect = await request("/admin_audit_events?select=id&limit=1", anonKey);
  const anonRows = Array.isArray(anonSelect.json) ? anonSelect.json.length : null;
  console.log(`anon admin audit select: status=${anonSelect.status} rows=${anonRows ?? "n/a"}`);
  if (anonSelect.status === 200 && anonRows !== 0) {
    failures.push("Anonymous clients can read admin audit events.");
  }
  if (![200, 401, 403, 404].includes(anonSelect.status)) {
    failures.push(`Unexpected anon admin audit status ${anonSelect.status}.`);
  }

  const insert = await request("/admin_audit_events?select=id,action,metadata", serviceKey, {
    method: "POST",
    body: JSON.stringify({
      actor_email: "codex-verifier@local.invalid",
      action: "verification_probe",
      metadata: { marker },
    }),
  });
  console.log(`service admin audit insert: status=${insert.status}`);
  if (insert.status !== 201 || !Array.isArray(insert.json) || insert.json.length !== 1) {
    failures.push("Service role could not insert an admin audit event.");
  }
} finally {
  await cleanup();
}

if (failures.length) {
  console.error("\nAdmin audit verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nAdmin audit verification passed.");
