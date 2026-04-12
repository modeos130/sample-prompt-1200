import { NextRequest, NextResponse } from "next/server";
import { BOOM_BAP_ANALYSIS_PROMPT, buildBoomBapPrompt } from "@/lib/genres/boom-bap";
import { HOUSE_ANALYSIS_PROMPT, buildHousePrompt } from "@/lib/genres/house";
import { TRAP_ANALYSIS_PROMPT, buildTrapPrompt } from "@/lib/genres/trap";
import { BALTIMORE_CLUB_ANALYSIS_PROMPT, buildBaltimoreClubPrompt } from "@/lib/genres/baltimore-club";
import { GOSPEL_ANALYSIS_PROMPT, buildGospelPrompt } from "@/lib/genres/gospel";
import { JAZZ_SOUL_ANALYSIS_PROMPT, buildJazzSoulPrompt } from "@/lib/genres/jazz-soul";
import { LATIN_SOUL_ANALYSIS_PROMPT, buildLatinSoulPrompt } from "@/lib/genres/latin-soul";
import { CINEMATIC_DARK_ANALYSIS_PROMPT, buildCinematicDarkPrompt } from "@/lib/genres/cinematic-dark";
import { ITALIAN_FILM_ANALYSIS_PROMPT, buildItalianFilmPrompt } from "@/lib/genres/italian-film";
import { DARK_UNDERGROUND_ANALYSIS_PROMPT, buildDarkUndergroundPrompt } from "@/lib/genres/dark-underground";
import { PSYCH_SOUL_ANALYSIS_PROMPT, buildPsychSoulPrompt } from "@/lib/genres/psych-soul";
import { MIDDLE_EAST_ANALYSIS_PROMPT, buildMiddleEastPrompt } from "@/lib/genres/middle-east";
import { SOUL_VOCAL_ANALYSIS_PROMPT, buildSoulVocalPrompt } from "@/lib/genres/soul-vocal";
import { CHIPMUNK_SOUL_ANALYSIS_PROMPT, buildChipmunkSoulPrompt } from "@/lib/genres/chipmunk-soul";
import { DRUM_BREAK_ANALYSIS_PROMPT, buildDrumBreakPrompt } from "@/lib/genres/drum-break";
import { TV_SCORE_ANALYSIS_PROMPT, buildTvScorePrompt } from "@/lib/genres/tv-score";
import { JAPANESE_SOUL_ANALYSIS_PROMPT, buildJapaneseSoulPrompt } from "@/lib/genres/japanese-soul";
import { AFROBEAT_ANALYSIS_PROMPT, buildAfrobeatPrompt } from "@/lib/genres/afrobeat";
import { REGGAE_DUB_ANALYSIS_PROMPT, buildReggaeDubPrompt } from "@/lib/genres/reggae-dub";
import { BRAZILIAN_ANALYSIS_PROMPT, buildBrazilianPrompt } from "@/lib/genres/brazilian";
import { BOOM_BAP_DARK_ANALYSIS_PROMPT, buildBoomBapDarkPrompt } from "@/lib/genres/boom-bap-dark";
import { MOTOWN_ANALYSIS_PROMPT, buildMotownPrompt } from "@/lib/genres/motown";
import { LIVE_FUNK_ANALYSIS_PROMPT, buildLiveFunkPrompt } from "@/lib/genres/live-funk";
import { SOVIET_ESTRADA_ANALYSIS_PROMPT, buildSovietEstradaPrompt } from "@/lib/genres/soviet-estrada";
import { YUGOSLAV_FUNK_ANALYSIS_PROMPT, buildYugoslavFunkPrompt } from "@/lib/genres/yugoslav-funk";
import { KOREAN_PSYCH_ANALYSIS_PROMPT, buildKoreanPsychPrompt } from "@/lib/genres/korean-psych";
import { JAPANESE_JAZZ_FUNK_ANALYSIS_PROMPT, buildJapaneseJazzFunkPrompt } from "@/lib/genres/japanese-jazz-funk";
import { SOUTH_AFRICAN_JAZZ_ANALYSIS_PROMPT, buildSouthAfricanJazzPrompt } from "@/lib/genres/south-african-jazz";
import { AFRO_CUBAN_JAZZ_ANALYSIS_PROMPT, buildAfroCubanJazzPrompt } from "@/lib/genres/afro-cuban-jazz";
import { ALGERIAN_RAI_ANALYSIS_PROMPT, buildAlgerianRaiPrompt } from "@/lib/genres/algerian-rai";
import { MOROCCAN_GNAWA_ANALYSIS_PROMPT, buildMoroccanGnawaPrompt } from "@/lib/genres/moroccan-gnawa";
import { HAITIAN_VOODOO_JAZZ_ANALYSIS_PROMPT, buildHaitianVoodooJazzPrompt } from "@/lib/genres/haitian-voodoo-jazz";

export const maxDuration = 60;

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const analyzeIpLog = new Map<string, { count: number; windowStart: number }>();
const ANALYZE_RATE_LIMIT = parseInt(process.env.ANALYZE_RATE_LIMIT ?? "10");
const ANALYZE_RATE_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW ?? "86400000");
let analyzeTotalCalls = 0;
const ANALYZE_HARD_CAP = parseInt(process.env.MONTHLY_HARD_CAP ?? "500");

function checkAnalyzeRateLimit(ip: string): { allowed: boolean; reason?: string } {
  if (analyzeTotalCalls >= ANALYZE_HARD_CAP) {
    return { allowed: false, reason: "Daily capacity reached. Check back tomorrow." };
  }
  const now = Date.now();
  const record = analyzeIpLog.get(ip);
  if (!record || now - record.windowStart > ANALYZE_RATE_WINDOW) {
    analyzeIpLog.set(ip, { count: 1, windowStart: now });
    analyzeTotalCalls++;
    return { allowed: true };
  }
  if (record.count >= ANALYZE_RATE_LIMIT) {
    return { allowed: false, reason: `Rate limit reached. You get ${ANALYZE_RATE_LIMIT} analyses per day.` };
  }
  record.count++;
  analyzeTotalCalls++;
  return { allowed: true };
}

const MAX_FILE_MB = 4;

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

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

type Genre =
  | "boom-bap"
  | "house"
  | "trap"
  | "baltimore-club"
  | "gospel"
  | "jazz-soul"
  | "latin-soul"
  | "cinematic-dark"
  | "italian-film"
  | "dark-underground"
  | "psych-soul"
  | "middle-east"
  | "soul-vocal"
  | "chipmunk-soul"
  | "drum-break"
  | "tv-score"
  | "japanese-soul"
  | "afrobeat"
  | "reggae-dub"
  | "brazilian"
  | "boom-bap-dark"
  | "motown"
  | "live-funk"
  | "soviet-estrada"
  | "yugoslav-funk"
  | "korean-psych"
  | "japanese-jazz-funk"
  | "south-african-jazz"
  | "afro-cuban-jazz"
  | "algerian-rai"
  | "moroccan-gnawa"
  | "haitian-voodoo-jazz";

const VALID_GENRES: Genre[] = [
  "boom-bap", "house", "trap", "baltimore-club", "gospel", "jazz-soul",
  "latin-soul", "cinematic-dark", "italian-film", "dark-underground",
  "psych-soul", "middle-east", "soul-vocal", "chipmunk-soul", "drum-break",
  "tv-score", "japanese-soul", "afrobeat", "reggae-dub", "brazilian",
  "boom-bap-dark", "motown", "live-funk", "soviet-estrada", "yugoslav-funk",
  "korean-psych", "japanese-jazz-funk", "south-african-jazz", "afro-cuban-jazz",
  "algerian-rai", "moroccan-gnawa", "haitian-voodoo-jazz",
];

function getGenrePrompts(genre: Genre) {
  switch (genre) {
    case "boom-bap":       return { analysisPrompt: BOOM_BAP_ANALYSIS_PROMPT,       buildPrompt: buildBoomBapPrompt       };
    case "house":          return { analysisPrompt: HOUSE_ANALYSIS_PROMPT,           buildPrompt: buildHousePrompt         };
    case "trap":           return { analysisPrompt: TRAP_ANALYSIS_PROMPT,            buildPrompt: buildTrapPrompt          };
    case "baltimore-club": return { analysisPrompt: BALTIMORE_CLUB_ANALYSIS_PROMPT,  buildPrompt: buildBaltimoreClubPrompt };
    case "gospel":         return { analysisPrompt: GOSPEL_ANALYSIS_PROMPT,          buildPrompt: buildGospelPrompt        };
    case "jazz-soul":      return { analysisPrompt: JAZZ_SOUL_ANALYSIS_PROMPT,       buildPrompt: buildJazzSoulPrompt      };
    case "latin-soul":     return { analysisPrompt: LATIN_SOUL_ANALYSIS_PROMPT,      buildPrompt: buildLatinSoulPrompt     };
    case "cinematic-dark":     return { analysisPrompt: CINEMATIC_DARK_ANALYSIS_PROMPT,      buildPrompt: buildCinematicDarkPrompt     };
    case "italian-film":       return { analysisPrompt: ITALIAN_FILM_ANALYSIS_PROMPT,       buildPrompt: buildItalianFilmPrompt       };
    case "dark-underground":   return { analysisPrompt: DARK_UNDERGROUND_ANALYSIS_PROMPT,   buildPrompt: buildDarkUndergroundPrompt   };
    case "psych-soul":         return { analysisPrompt: PSYCH_SOUL_ANALYSIS_PROMPT,         buildPrompt: buildPsychSoulPrompt         };
    case "middle-east":        return { analysisPrompt: MIDDLE_EAST_ANALYSIS_PROMPT,        buildPrompt: buildMiddleEastPrompt        };
    case "soul-vocal":         return { analysisPrompt: SOUL_VOCAL_ANALYSIS_PROMPT,         buildPrompt: buildSoulVocalPrompt         };
    case "chipmunk-soul":      return { analysisPrompt: CHIPMUNK_SOUL_ANALYSIS_PROMPT,      buildPrompt: buildChipmunkSoulPrompt      };
    case "drum-break":         return { analysisPrompt: DRUM_BREAK_ANALYSIS_PROMPT,         buildPrompt: buildDrumBreakPrompt         };
    case "tv-score":           return { analysisPrompt: TV_SCORE_ANALYSIS_PROMPT,           buildPrompt: buildTvScorePrompt           };
    case "japanese-soul":      return { analysisPrompt: JAPANESE_SOUL_ANALYSIS_PROMPT,      buildPrompt: buildJapaneseSoulPrompt      };
    case "afrobeat":           return { analysisPrompt: AFROBEAT_ANALYSIS_PROMPT,           buildPrompt: buildAfrobeatPrompt          };
    case "reggae-dub":         return { analysisPrompt: REGGAE_DUB_ANALYSIS_PROMPT,         buildPrompt: buildReggaeDubPrompt         };
    case "brazilian":          return { analysisPrompt: BRAZILIAN_ANALYSIS_PROMPT,           buildPrompt: buildBrazilianPrompt         };
    case "boom-bap-dark":      return { analysisPrompt: BOOM_BAP_DARK_ANALYSIS_PROMPT,      buildPrompt: buildBoomBapDarkPrompt       };
    case "motown":             return { analysisPrompt: MOTOWN_ANALYSIS_PROMPT,             buildPrompt: buildMotownPrompt            };
    case "live-funk":          return { analysisPrompt: LIVE_FUNK_ANALYSIS_PROMPT,           buildPrompt: buildLiveFunkPrompt          };
    case "soviet-estrada":     return { analysisPrompt: SOVIET_ESTRADA_ANALYSIS_PROMPT,     buildPrompt: buildSovietEstradaPrompt     };
    case "yugoslav-funk":      return { analysisPrompt: YUGOSLAV_FUNK_ANALYSIS_PROMPT,      buildPrompt: buildYugoslavFunkPrompt      };
    case "korean-psych":       return { analysisPrompt: KOREAN_PSYCH_ANALYSIS_PROMPT,       buildPrompt: buildKoreanPsychPrompt       };
    case "japanese-jazz-funk": return { analysisPrompt: JAPANESE_JAZZ_FUNK_ANALYSIS_PROMPT, buildPrompt: buildJapaneseJazzFunkPrompt  };
    case "south-african-jazz": return { analysisPrompt: SOUTH_AFRICAN_JAZZ_ANALYSIS_PROMPT, buildPrompt: buildSouthAfricanJazzPrompt  };
    case "afro-cuban-jazz":    return { analysisPrompt: AFRO_CUBAN_JAZZ_ANALYSIS_PROMPT,    buildPrompt: buildAfroCubanJazzPrompt     };
    case "algerian-rai":       return { analysisPrompt: ALGERIAN_RAI_ANALYSIS_PROMPT,       buildPrompt: buildAlgerianRaiPrompt       };
    case "moroccan-gnawa":     return { analysisPrompt: MOROCCAN_GNAWA_ANALYSIS_PROMPT,     buildPrompt: buildMoroccanGnawaPrompt     };
    case "haitian-voodoo-jazz": return { analysisPrompt: HAITIAN_VOODOO_JAZZ_ANALYSIS_PROMPT, buildPrompt: buildHaitianVoodooJazzPrompt };
  }
}

async function geminiGenerate(apiKey: string, parts: unknown[]): Promise<string> {
  let lastStatus = 0;
  let lastMsg    = "";

  for (const version of API_VERSIONS) {
    const url = `https://generativelanguage.googleapis.com/${version}/models/${GEMINI_MODEL}:generateContent`;
    const res  = await fetch(url, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body:    JSON.stringify({ contents: [{ role: "user", parts }] }),
    });

    const data = await res.json() as Record<string, unknown>;
    const errMsg = (data?.error as Record<string, string>)?.message ?? `HTTP ${res.status}`;

    if (res.status === 404) {
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

  console.error(`Model "${GEMINI_MODEL}" not found. Last: ${lastMsg.slice(0, 120)}`);
  throw new Error("AI model not available. Contact support.");
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
  // Rate limit
  const fwd = req.headers.get("x-forwarded-for");
  const ip = (fwd ? fwd.split(",").pop()?.trim() : null)
          ?? req.headers.get("x-real-ip")
          ?? "unknown";
  const limit = checkAnalyzeRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json({ error: limit.reason }, { status: 429 });
  }

  try {
    // Support two input modes:
    // 1. JSON body with fileUri (Gemini File API reference — no size limit)
    // 2. FormData with file (legacy inline base64 — 4MB limit)
    const contentType = req.headers.get("content-type") ?? "";
    let genre: string | null = null;
    let audioPart: unknown;
    let mimeType: string;

    if (contentType.includes("application/json")) {
      // Mode 1: Gemini File API URI
      const body = await req.json();
      const fileUri = body.fileUri as string | undefined;
      mimeType = body.mimeType as string || "audio/mpeg";
      genre = body.genre as string | null;

      if (!fileUri) {
        return NextResponse.json({ error: "fileUri required" }, { status: 400 });
      }
      audioPart = { file_data: { mime_type: mimeType, file_uri: fileUri } };
    } else {
      // Mode 2: FormData with inline file (legacy, 4MB limit)
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      genre = formData.get("genre") as string | null;

      if (!file) {
        return NextResponse.json({ error: "Audio file required" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (buffer.byteLength / 1_048_576 > MAX_FILE_MB) {
        return NextResponse.json({ error: `File too large. Max ${MAX_FILE_MB} MB.` }, { status: 413 });
      }

      mimeType = getMimeType(file.name);
      const b64 = buffer.toString("base64");
      audioPart = { inline_data: { mime_type: mimeType, data: b64 } };
    }

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) return NextResponse.json({ error: "GEMINI_KEY not configured" }, { status: 500 });

    // Genre-free DNA analysis (used by /prompts page)
    if (!genre || !VALID_GENRES.includes(genre as Genre)) {
      const dnaPrompt = `You are an expert music analyst. Analyze this audio and create a Suno AI music generation prompt that captures its sonic DNA.

Your prompt must follow these STRICT rules (the same DNA framework used by professional producers):
- ONE PARAGRAPH, under 1000 characters
- Describe: era/decade, specific real instruments, recording style, tempo feel, mood/atmosphere, sonic texture
- NO drum descriptions (Suno handles rhythm separately)
- NO real artist names or song titles
- NO genre labels — describe the SOUND not the category
- Use sensory and technical language: 'muffled Rhodes', 'overdriven bass guitar', 'tape saturation', 'room reverb'
- Include a rarity/obscurity phrase like 'pressed in small quantities on a regional label'
- Include 'designed to feel loopable' or similar
- Focus on what a producer would sample: the feel, the space, the frequency range, the emotional quality
- Output ONLY the prompt text — no preamble, no explanation, no quotation marks

Analyze this audio and output the prompt now.`;

      const rawPrompt = await geminiGenerate(apiKey, [
        { text: dnaPrompt },
        audioPart,
      ]);
      const generatedPrompt = capPrompt(rawPrompt.trim(), 1000);
      return NextResponse.json({ analysis: "Sonic DNA analysis complete.", generatedPrompt, prompt: generatedPrompt });
    }

    // Genre-specific analysis (used by studio.html)
    const { analysisPrompt, buildPrompt } = getGenrePrompts(genre as Genre)!;

    // Pass 1 — audio analysis
    const rawAnalysis = await geminiGenerate(apiKey, [
      { text: analysisPrompt },
      audioPart,
    ]);
    const analysis = extractSection(rawAnalysis, "ANALYSIS") || rawAnalysis;

    // Pass 2 — prompt generation (text only)
    const rawPrompt       = await geminiGenerate(apiKey, [{ text: buildPrompt(analysis) }]);
    const generatedPrompt = capPrompt(rawPrompt.trim(), 1000);

    return NextResponse.json({ analysis, generatedPrompt });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyze]", msg);

    let userMessage = "An error occurred processing your request.";
    if (msg.includes("[429]") || msg.includes("RESOURCE_EXHAUSTED")) {
      userMessage = "API quota exceeded. Try again later.";
    } else if (msg.includes("[403]") || msg.includes("API_KEY_INVALID")) {
      userMessage = "Service configuration error. Contact support.";
    } else if (msg.includes("[413]") || msg.includes("Request payload size")) {
      userMessage = `File too large. Keep clips under ${MAX_FILE_MB} MB.`;
    } else if (msg.includes("safety filters")) {
      userMessage = "Content was blocked by safety filters. Try different audio.";
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
