const baseUrl = (process.env.ROUTE_BASE_URL || "http://localhost:3029").replace(/\/$/, "");

const failures = [];

async function fetchText(path) {
  const res = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const text = await res.text();
  return { status: res.status, text };
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

console.log(`Verifying private-beta SEO controls at ${baseUrl}`);

const robots = await fetchText("/robots.txt");
assert(robots.status === 200, `/robots.txt expected 200, got ${robots.status}`);
assert(/User-Agent:\s*\*/i.test(robots.text), "/robots.txt is missing User-Agent: *");
assert(/Disallow:\s*\//i.test(robots.text), "/robots.txt must disallow all crawling while private.");
console.log(`/robots.txt: status=${robots.status}`);

const sitemap = await fetchText("/sitemap.xml");
assert(sitemap.status === 200, `/sitemap.xml expected 200, got ${sitemap.status}`);
assert(!/<url>/i.test(sitemap.text), "/sitemap.xml should not list public URLs while private.");
console.log(`/sitemap.xml: status=${sitemap.status} urlEntries=${(sitemap.text.match(/<url>/gi) || []).length}`);

const login = await fetchText("/login");
assert(login.status === 200, `/login expected 200, got ${login.status}`);
assert(/noindex/i.test(login.text) && /nofollow/i.test(login.text), "/login is missing noindex,nofollow metadata.");
console.log(`/login metadata: status=${login.status}`);

const publicEntry = await fetchText("/vibe-to-prompt.html");
assert(publicEntry.status === 200, `/vibe-to-prompt.html expected 200, got ${publicEntry.status}`);
assert(/<meta name="robots" content="noindex,nofollow">/i.test(publicEntry.text), "/vibe-to-prompt.html is missing noindex,nofollow meta.");
console.log(`/vibe-to-prompt.html metadata: status=${publicEntry.status}`);

if (failures.length) {
  console.error("\nSEO verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nSEO verification passed.");
