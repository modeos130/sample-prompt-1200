const baseUrl = (process.env.ROUTE_BASE_URL || "http://localhost:3029").replace(/\/$/, "");

const pageChecks = [
  { path: "/login", expect: "public" },
  { path: "/vibe-to-prompt.html", expect: "public" },
  { path: "/robots.txt", expect: "public" },
  { path: "/vibe-to-prompt-dev.html", expect: "login-redirect" },
  { path: "/home", expect: "login-redirect" },
  { path: "/studio.html", expect: "login-redirect" },
  { path: "/prompts", expect: "login-redirect" },
  { path: "/analyze", expect: "login-redirect" },
  { path: "/create.html", expect: "login-redirect" },
  { path: "/account", expect: "login-redirect" },
  { path: "/admin/invite", expect: "login-redirect" },
  { path: "/admin/users", expect: "login-redirect" },
];

const apiChecks = [
  { path: "/api/admin/users", method: "GET" },
  { path: "/api/admin/invite", method: "POST", body: {} },
  { path: "/api/admin/revoke", method: "POST", body: {} },
  { path: "/api/analytics", method: "POST", body: {} },
  { path: "/api/analyze", method: "POST", body: {} },
  { path: "/api/generate-music", method: "POST", body: {} },
  { path: "/api/upload-audio", method: "POST" },
  { path: "/api/vibe-prompt", method: "POST", body: {} },
];

const failures = [];

function isLoginRedirect(status, location) {
  return [301, 302, 303, 307, 308].includes(status) && (location || "").startsWith("/login");
}

async function checkPage({ path, expect }) {
  const res = await fetch(`${baseUrl}${path}`, { method: "HEAD", redirect: "manual" });
  const location = res.headers.get("location");

  if (expect === "public") {
    if (res.status !== 200) {
      failures.push(`${path} expected 200 public response, got ${res.status}`);
    }
    console.log(`${path}: status=${res.status}`);
    return;
  }

  if (!isLoginRedirect(res.status, location)) {
    failures.push(`${path} expected redirect to /login, got status=${res.status} location=${location || "none"}`);
  }
  console.log(`${path}: status=${res.status} location=${location || "none"}`);
}

async function checkApi({ path, method, body }) {
  const options = {
    method,
    redirect: "manual",
    headers: {},
  };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${path}`, options);
  if (res.status !== 401) {
    failures.push(`${method} ${path} expected 401 for anonymous request, got ${res.status}`);
  }
  console.log(`${method} ${path}: status=${res.status}`);
}

console.log(`Verifying anonymous route gate at ${baseUrl}`);

for (const check of pageChecks) {
  await checkPage(check);
}

for (const check of apiChecks) {
  await checkApi(check);
}

if (failures.length) {
  console.error("\nRoute verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nRoute verification passed.");
