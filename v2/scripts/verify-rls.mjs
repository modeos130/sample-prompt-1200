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
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const restBase = `${supabaseUrl.replace(/\/$/, "")}/rest/v1`;

async function request(path, key, options = {}) {
  const res = await fetch(`${restBase}${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  return { status: res.status, json, text };
}

function rowCount(payload) {
  return Array.isArray(payload) ? payload.length : null;
}

function isDeniedOrEmpty(result) {
  if ([401, 403, 404].includes(result.status)) return true;
  return result.status === 200 && rowCount(result.json) === 0;
}

const failures = [];

const anonProfiles = await request("/profiles?select=id,email,tier,active&limit=1", anonKey);
console.log(
  `anon profiles select: status=${anonProfiles.status} rows=${rowCount(anonProfiles.json) ?? "n/a"}`
);
if (!isDeniedOrEmpty(anonProfiles)) {
  failures.push("Anonymous clients can read profile rows.");
}

const anonAnalytics = await request("/analytics?select=id,user_id,action,tier&limit=1", anonKey);
console.log(
  `anon analytics select: status=${anonAnalytics.status} rows=${rowCount(anonAnalytics.json) ?? "n/a"}`
);
if (!isDeniedOrEmpty(anonAnalytics)) {
  failures.push("Anonymous clients can read analytics rows.");
}

if (serviceKey) {
  const serviceProfiles = await request("/profiles?select=id,tier&limit=1", serviceKey);
  const firstProfile = Array.isArray(serviceProfiles.json) ? serviceProfiles.json[0] : null;

  if (firstProfile?.id) {
    const safeSameValuePatch = await request(`/profiles?id=eq.${firstProfile.id}&select=id,tier`, anonKey, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ tier: firstProfile.tier }),
    });

    console.log(
      `anon profile patch existing row: status=${safeSameValuePatch.status} rows=${rowCount(safeSameValuePatch.json) ?? "n/a"}`
    );

    if (!isDeniedOrEmpty(safeSameValuePatch)) {
      failures.push("Anonymous clients can update an existing profile row.");
    }
  } else {
    console.log("service profile lookup: no profile rows found; skipped existing-row patch test");
  }
} else {
  console.log("SUPABASE_SERVICE_ROLE_KEY not present; skipped existing-row patch test");
}

if (failures.length) {
  console.error("\nRLS verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nRLS verification passed.");

