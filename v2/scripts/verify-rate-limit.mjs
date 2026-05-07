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
  console.error("Missing Supabase env vars required for rate-limit verification.");
  process.exit(1);
}

const restBase = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;
const scope = "codex_verify_rate_limit";
const subjectId = `verify-${Date.now()}`;

async function callRpc(key) {
  const res = await fetch(`${restBase}/rpc/consume_rate_limit`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      p_scope: scope,
      p_subject_id: subjectId,
      p_limit: 2,
      p_window_ms: 60_000,
    }),
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  return { status: res.status, json };
}

async function cleanup() {
  await fetch(
    `${restBase}/rate_limits?scope=eq.${encodeURIComponent(scope)}&subject_id=eq.${encodeURIComponent(subjectId)}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }
  );
}

const failures = [];

try {
  const anon = await callRpc(anonKey);
  console.log(`anon rpc execute: status=${anon.status}`);
  if (![401, 403, 404].includes(anon.status)) {
    failures.push(`Anonymous role can execute consume_rate_limit; expected deny, got ${anon.status}.`);
  }

  const first = await callRpc(serviceKey);
  const second = await callRpc(serviceKey);
  const third = await callRpc(serviceKey);

  console.log(`service rpc first: status=${first.status} allowed=${first.json?.[0]?.allowed} remaining=${first.json?.[0]?.remaining}`);
  console.log(`service rpc second: status=${second.status} allowed=${second.json?.[0]?.allowed} remaining=${second.json?.[0]?.remaining}`);
  console.log(`service rpc third: status=${third.status} allowed=${third.json?.[0]?.allowed} remaining=${third.json?.[0]?.remaining}`);

  if (first.status !== 200 || first.json?.[0]?.allowed !== true || first.json?.[0]?.remaining !== 1) {
    failures.push("First service-role rate-limit call did not allow with one remaining.");
  }
  if (second.status !== 200 || second.json?.[0]?.allowed !== true || second.json?.[0]?.remaining !== 0) {
    failures.push("Second service-role rate-limit call did not allow with zero remaining.");
  }
  if (third.status !== 200 || third.json?.[0]?.allowed !== false || third.json?.[0]?.remaining !== 0) {
    failures.push("Third service-role rate-limit call did not deny after limit was reached.");
  }
} finally {
  await cleanup();
}

if (failures.length) {
  console.error("\nRate-limit verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nRate-limit verification passed.");
