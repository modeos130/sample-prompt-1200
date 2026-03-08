import { NextRequest, NextResponse } from "next/server";
import { BOOM_BAP_ANALYSIS_PROMPT, buildBoomBapPrompt } from "@/lib/genres/boom-bap";
import { HOUSE_ANALYSIS_PROMPT, buildHousePrompt } from "@/lib/genres/house";
import { TRAP_ANALYSIS_PROMPT, buildTrapPrompt } from "@/lib/genres/trap";
import { BALTIMORE_CLUB_ANALYSIS_PROMPT, buildBaltimoreClubPrompt } from "@/lib/genres/baltimore-club";

export const maxDuration = 60;

const MAX_FILE_MB = 4;

// Override via GEMINI_MODEL env var in Vercel — no code change needed.
// Default: gemini-2.5-flash (original design). If your key returns 404,
// set GEMINI_MODEL to whatever `ListModels` shows as available.
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

// Tries v1beta first (newer/preview models), then v1 (stable models).
// This covers all possible model placements without manual configuration.
const API_VERSIONS = ["v1beta", "v1"];

const MIME_MAP: Record<string, string> = {
  mp3:  "audio/mpeg",
  wav:  "audio/wav",
  ogg:  "audio/ogg",
  flac: "audio/flac",
  aac:  "audio/aac",
  m4a:  "audio/mp4",
  aiff: "audio/aiff",
  aif:  "audio/aiff",
};

function getMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return MIME_MAP[ext] ?? "audio/mpeg";
}

type Genre = "boom-bap" | "house" | "trap" | "baltimore-club";

function getGenrePrompts(genre: Genre) {
  switch (genre) {
    case "boom-bap":       return { analysisPrompt: BOOM_BAP_ANALYSIS_PROMPT,       buildPrompt: buildBoomBapPrompt       };
    case "house":          return { analysisPrompt: HOUSE_ANALYSIS_PROMPT,           buildPrompt: buildHousePrompt         };
    case "trap":           return { analysisPrompt: TRAP_ANALYSIS_PROMPT,             buildPrompt: buildTrapPrompt          };
    case "baltimore-club": return { analysisPrompt: BALTIMORE_CLUB_ANALYSIS_PROMPT,  buildPrompt: buildBaltimoreClubPrompt };
  }
}

async function geminiGenerate(apiKey: string, parts: unknown[]): Promise<string> {
  let lastStatus = 0;
  let lastMsg    = "";

  for (const version of API_VERSIONS) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res  = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ contents: [{ role: "user", parts }] }),
    });

    const data = await res.json() as Record<string, unknown>;
    const errMsg = (data?.error as Record<string, string>)?.message ?? `HTTP ${res.status}`;

    if (res.status === 404) {
      // Model not on this API version — try the next one
      lastStatus = 404;
      lastMsg    = errMsg;
      continue;
    }

    if (!res.ok) throw new Error(`[${res.status}] ${errMsg}`);

    const text = (data?.candidates as Array<{content:{parts:Array<{text:string}>}}>)
      ?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Empty response from Gemini — response may have been blocked by safety filters");
    return text;
  }

  // All versions 404 — guide the user clearly
  throw new Error(
    `Model "${GEMINI_MODEL}" not found on v1beta or v1. ` +
    `Set the GEMINI_MODEL environment variable in Vercel to a model your API key can access. ` +
    `Visit aistudio.google.com, open your project, and check which models are listed. ` +
    `(Last error: ${lastMsg.slice(0, 120)})`
  );
}

function extractSection(text: string, header: string): string {
  const pattern = new RegExp(`##\\s*${header}\\s*\\n([\\s\\S]*?)(?=\\n#{1,6}\\s|$)`);
  const m = text.match(pattern);
  return m ? m[1].trim() : "";
}

function capPrompt(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 3);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + "...";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file  = formData.get("file")  as File  | null;
    const genre = formData.get("genre") as Genre | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!genre || !["boom-bap", "house", "trap", "baltimore-club"].includes(genre)) {
      return NextResponse.json({ error: "Invalid genre" }, { status: 400 });
    }

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.byteLength / 1_048_576 > MAX_FILE_MB) {
      return NextResponse.json({ error: `File too large. Max ${MAX_FILE_MB} MB.` }, { status: 413 });
    }

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) return NextResponse.json({ error: "GEMINI_KEY not configured" }, { status: 500 });

    const mimeType = getMimeType(file.name);
    const b64      = buffer.toString("base64");

    const { analysisPrompt, buildPrompt } = getGenrePrompts(genre);

    // Pass 1 — audio analysis
    const rawAnalysis = await geminiGenerate(apiKey, [
      { text: analysisPrompt },
      { inline_data: { mime_type: mimeType, data: b64 } },
    ]);
    const analysis = extractSection(rawAnalysis, "ANALYSIS") || rawAnalysis;

    // Pass 2 — prompt generation (text only)
    const rawPrompt       = await geminiGenerate(apiKey, [{ text: buildPrompt(analysis) }]);
    const generatedPrompt = capPrompt(rawPrompt.trim(), 1000);

    return NextResponse.json({ analysis, generatedPrompt });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    let userMessage = `${msg.slice(0, 400)}`;

    if (msg.includes("[429]") || msg.includes("RESOURCE_EXHAUSTED")) {
      userMessage = "API quota exceeded. Enable billing at aistudio.google.com or wait for the rate-limit window.";
    } else if (msg.includes("[403]") || msg.includes("API_KEY_INVALID")) {
      userMessage = "Invalid API key. Check GEMINI_KEY in your Vercel environment variables.";
    } else if (msg.includes("[413]") || msg.includes("Request payload size")) {
      userMessage = `File too large. Keep clips under ${MAX_FILE_MB} MB.`;
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
