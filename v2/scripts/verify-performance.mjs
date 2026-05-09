import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const staticBudgets = [
  { file: "public/studio.html", maxBytes: 160_000 },
  { file: "public/create.html", maxBytes: 120_000 },
  { file: "public/vibe-to-prompt.html", maxBytes: 80_000 },
];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function checkStaticBudgets() {
  for (const budget of staticBudgets) {
    const filePath = path.join(root, budget.file);
    const size = (await stat(filePath)).size;
    console.log(`${budget.file}: ${size} bytes`);
    assert(size <= budget.maxBytes, `${budget.file} exceeds ${budget.maxBytes} bytes.`);
  }
}

async function checkArtBudgets() {
  const artDir = path.join(root, "public", "art");
  const entries = await readdir(artDir);
  const jpgs = entries.filter((entry) => entry.toLowerCase().endsWith(".jpg"));
  let largest = { file: "", size: 0 };

  for (const entry of jpgs) {
    const size = (await stat(path.join(artDir, entry))).size;
    if (size > largest.size) largest = { file: entry, size };
    assert(size <= 120_000, `public/art/${entry} exceeds 120000 bytes.`);
  }

  console.log(`public/art: ${jpgs.length} jpgs, largest=${largest.file} ${largest.size} bytes`);
}

async function checkAudioHandling() {
  for (const file of ["public/studio.html", "public/create.html"]) {
    const text = await readFile(path.join(root, file), "utf8");
    assert(text.includes("URL.createObjectURL"), `${file} should use object URLs for generated audio playback.`);
    assert(text.includes("URL.revokeObjectURL"), `${file} should revoke generated audio object URLs.`);
    assert(!/audioPlayer\.src\s*=\s*`data:\$\{mimeType\};base64/i.test(text), `${file} still assigns base64 data URIs directly to the audio player.`);
  }

  const route = await readFile(path.join(root, "app/api/generate-music/route.ts"), "utf8");
  assert(route.includes('"Cache-Control": "no-store"'), "generate-music responses should be marked Cache-Control: no-store.");
  console.log("audio payload handling: object URLs and no-store response verified");
}

await checkStaticBudgets();
await checkArtBudgets();
await checkAudioHandling();

if (failures.length) {
  console.error("\nPerformance verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nPerformance verification passed.");
