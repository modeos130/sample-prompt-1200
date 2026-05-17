import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const forbiddenTerms = [
  "Anth" + "ropic",
  "ANTH" + "ROPIC",
  "Clau" + "de",
  "CLAU" + "DE",
];

const ignoredDirs = new Set([
  ".git",
  ".next",
  "node_modules",
  "playwright-report",
  "test-results",
]);

const checkedExtensions = new Set([
  ".env.example",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
      continue;
    }

    if (entry.name === ".env.local") continue;
    const ext = path.extname(entry.name);
    if (checkedExtensions.has(ext) || checkedExtensions.has(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const failures = [];
for (const file of await walk(appRoot)) {
  const text = await readFile(file, "utf8");
  for (const term of forbiddenTerms) {
    if (text.includes(term)) {
      failures.push(`${path.relative(appRoot, file)} contains ${term}`);
    }
  }
}

if (failures.length) {
  console.error("\nGoogle-only provider verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Google-only provider verification passed.");
