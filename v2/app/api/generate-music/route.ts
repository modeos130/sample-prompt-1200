import { NextRequest, NextResponse } from "next/server";
import { ALL_PROMPTS } from "@/lib/prompts";
import { activeUserError, getActiveUser } from "@/lib/auth/active-user";
import { consumeRateLimit } from "@/lib/rate-limit";
import { apiError, logApiError, providerError } from "@/lib/api/errors";

export const maxDuration = 120; // Music generation is slow

const MUSIC_RATE_WINDOW = parseInt(process.env.MUSIC_RATE_WINDOW ?? "86400000"); // 24h in ms

const TIER_LIMITS: Record<string, number> = {
  super_user: 9999,
  vip: 9999,
  tier2: 50,
  tier1: 10,
  free: 3,
};

// ─── PROVEN PROMPTS (SERVER-SIDE ONLY — NEVER SENT TO CLIENT) ────────────────
// Derived from the canonical catalog in lib/prompts.ts so the Sound Library and the
// /prompts page never drift apart. To add a new sound, append one entry to ALL_PROMPTS.
const PROVEN_PROMPTS: Record<string, { name: string; genre: string; prompt: string }> =
  Object.fromEntries(ALL_PROMPTS.map(p => [p.id, { name: p.name, genre: p.genre, prompt: p.vibe }]));

// ─── GENRE RULES (for Create Your Own path) ─────────────────────────────────
const GENRE_RULES: Record<string, string> = {
  "boom-bap": `ERA LOCK: Late 1960s\u20131970s. Soul-jazz, hard bop, spiritual jazz, blaxploitation scores, CTI soul-jazz, Stax soul. BPM: 78\u201390. Minor/modal only. Live band, 2-inch tape, upright bass anchor, featured horn or piano solo. Obscurity framing: pressed in small quantities, regional label, found in a crate. End: "the kind of forgotten record [era/aesthetic descriptor, no real names] would spend years hunting in overseas crates and flip into something timeless."`,
  "dark-underground": `ERA LOCK: Late 1960s\u2013early 1970s. Eastern European modal jazz, Italian film score, obscure foreign library records, psychedelic soul. BPM: 63\u201380. Dorian, Phrygian, diminished \u2014 maximum tension, zero resolution. Flute, organ, or harpsichord lead. Heavy vinyl degradation, wow-flutter. End: "the kind of forgotten foreign record a serious crate digger would spend decades hunting in an overseas record shop."`,
  "soul-gospel": `ERA LOCK: Late 1960s Black American gospel and sacred soul. Small church or small studio recording. BPM: 70\u201386. Hammond B3 organ mandatory, full choir harmonies, call-and-response. Hand claps not drums. Raw, imperfect, devotional. "Recorded live in a small church, never commercially distributed." End: "the kind of sacred recording [descriptor] would chop, pitch up, and place underneath something hard to make it feel like church."`,
  "jazz": `ERA LOCK: Early 1970s small ensemble jazz. Regional jazz label. BPM: 82\u201396. Upright bass walking line anchor, muted trumpet or tenor saxophone lead, dry room acoustics, analog tape hiss. Minor or Dorian. Late-night intimate feel. "Pressed in small quantities for local distribution." End: "the kind of warm dusty record [descriptor] would loop two bars of and build entire worlds around."`,
  "latin": `ERA LOCK: Late 1960s New York Latin soul orchestral. Small NYC indie label for Spanish-speaking audience. BPM: 74\u201386. Dramatic dark string section, wordless female vocal hum as texture only, sparse congas and timbales, muted brass. Very cinematic, barrio midnight feeling. End: "the kind of orchestral Latin soul recording [descriptor] would loop and transform into something devastating."`,
  "japanese": `ERA LOCK: Late 1970s Japanese soul (Wamono). Small regional Japanese label, never exported. BPM: 76\u201386. Muffled Rhodes or electric piano, light bass that sits back, minimal brushed drums, reverb-soaked distant female vocal floating above the mix, flute or vibraphone accents. 3am Tokyo city feeling. End: "the kind of obscure Japanese pressing [descriptor] would discover and flip into something completely transformed."`,
  "brazilian": `ERA LOCK: Late 1970s Brazilian jazz-fusion. S\u00e3o Paulo small regional label, never exported outside Brazil. BPM: 88\u2013100. Rhodes piano with Brazilian harmonic sensibility, surdo and pandeiro percussion, breathy flute or nylon-string guitar, wordless female vocal hum, humid room sound. Afro-Brazilian rhythmic pulse. End: "the kind of record [descriptor] would change their life the first time they heard it in a crate in S\u00e3o Paulo."`,
  "italian-film": `ERA LOCK: Early 1970s Italian Poliziotteschi crime film or giallo horror score. Roman studio, pressed for cinema distribution only. BPM: 65\u201382. Wah-wah rhythm guitar, overdriven walking bass, flute or harpsichord or tremolo strings, sparse Hammond stabs. Eerie and funky simultaneously. "Never released commercially outside Italian cinema." End: "the kind of forgotten European score cue [descriptor] would pitch down, slow, and loop into something that hits like a freight train."`,
  "soulful-house": `ERA LOCK: Early 1990s NYC underground soulful house. BPM: 118\u2013128. Four-on-the-floor implied, gospel piano upbeat stabs, Hammond B3, live bass, full choir harmonies, congas alongside drum machine. Spiritual and physical simultaneously. Church-trained female vocal. End: "the kind of record [descriptor] would drop at 4am and make the room levitate."`,
  "disco-house": `ERA LOCK: Late 1990s French-influenced disco house. BPM: 120\u2013126. Four-on-the-floor implied, filter sweep on bass opening and closing over the 8-bar cycle, lush 1970s disco strings, wah rhythm guitar, brass stabs, vocal chop as instrument. The filter movement is the defining element. Euphoric, sleek. End: "the kind of record [descriptor] would loop for eight minutes without losing momentum."`,
  "tv-score": `ERA LOCK: Early 1970s American television crime drama score cue. Three sections: sparse electric piano intro \u2192 wah-wah guitar groove with muted brass \u2192 strip back to piano. BPM: 82\u201396. Surveillance scene feeling, city at 2am. Written to loop under dialogue. "Composed for a gritty weekly crime drama on a major American network, 1972." End: "the kind of TV score cue [descriptor] would isolate, chop, and pitch into something completely unrecognizable and dangerous."`,
  "cinematic-dark": `ERA LOCK: Late 1980s\u2013early 1990s orchestral. Simple 4\u20138 note piano melody in natural minor. Long slow string pads as patient presence. Deep resonant cello. BPM: 65\u201380. Silence between notes. Emotional ambiguity. Analog warmth without heavy vinyl degradation. End: "the kind of orchestral source material [descriptor] would low-pass filter and build their most emotional record around."`,
  "drum-break": `ERA LOCK: 1970s live funk drum performance. NO melody, NO harmony, NO bass \u2014 pure drums. Three-act structure: locked groove \u2192 extended solo breakdown (snare rolls, tom fills, open hi-hat splashes, 8\u201316 bars pure percussive improvisation) \u2192 groove return. BPM: 95\u2013108. Raw room acoustics, minimal mic placement, human rushing and dragging. End: "the kind of isolated drum performance where the solo section alone can be chopped into dozens of separate hits and loops."`,
  "chipmunk": `ERA LOCK: Early 1960s girl group soul recording. Designed to be sped up. BPM: 108\u2013120 source (will chipmunk to 130\u2013145). Bright and clear. Call-and-response female harmonies, horn stabs, bouncy minor key progression. "Regional 45 single, local airplay only." End: "the kind of bright regional 45 [descriptor] would speed up, pitch up, and transform into something buoyant and undeniable."`,
  "marching-band": `ERA LOCK: Early 1970s college marching band live stadium recording. 60\u201380 horns in unison. BPM: 68\u201380, slow and majestic. Minor-to-major emotional arc. Dynamic: low brass foundation \u2192 full eruption \u2192 single trumpet soloist \u2192 full ensemble crash. Outdoor field microphones, crowd noise. End: "the kind of live brass recording [descriptor] would isolate a single horn stab from and place under a rolling 808 to make something feel enormous."`,
  "modern-trap": `ERA LOCK: Late 1980s\u2013early 1990s orchestral. Simple haunting 4\u20138 note piano melody in natural minor. String pads as background texture, deep cello, silence between notes. BPM: 65\u201380 source (doubles to 130\u2013140 trap range). Emotional ambiguity \u2014 works under introspective verses and drops. Analog warmth without heavy vinyl degradation. End: "the kind of simple orchestral source material [descriptor] would loop, filter, and place under 808s to make something emotionally overwhelming."`,
  "polish-jazz": `ERA LOCK: Early 1970s Warsaw. Cold Eastern European jazz, crystalline piano, Harmon-muted trumpet. BPM: 72\u201382. Dorian or Phrygian. Metallic room reverb, state-owned label, never exported outside Eastern Europe. End: "the kind of cold dusty record a serious producer would loop two bars of and build entire worlds around."`,
  "israeli-psych": `ERA LOCK: Early 1970s Tel Aviv. Israeli psychedelic folk. Oud in Hijaz scale, bouzouki tremolo, spring reverb guitar. BPM: 68\u201378. Hijaz, Bayati, or Saba maqam \u2014 microtonal intervals that land between Western tuning. Small indie pressing, never distributed outside Israel. End: "the kind of forgotten Middle Eastern recording a crate digger would spend years hunting and flip into something devastating."`,
  "hungarian-psych": `ERA LOCK: Mid 1970s Budapest. Hungarian psychedelic folk-rock. Cimbalom as lead instrument, t\u00e1rogat\u00f3, fuzz guitar drones through phaser. BPM: 74\u201384. Hungarian minor scale \u2014 raised 4th and natural 7th with minor 3rd. State-funded recording, limited domestic run, never exported beyond Eastern Bloc. End: "the kind of obscure Eastern European record that sounds like nothing else when chopped and pitched."`,
  "krautrock": `ERA LOCK: Early 1970s Germany. Kosmische experimental. Moog synthesizer filter sweeps, Farfisa organ drones, ring-modulated guitar. BPM: 82\u201392. Dorian, Phrygian, or pure drone. Motorik pulse implied. Converted farmhouse studio, small independent label, 500 copies. End: "the kind of cold kosmische record a producer would slow down, low-pass filter, and build their most hypnotic record around."`,
  "turkish-psych": `ERA LOCK: Early 1970s Istanbul. Anadolu psych rock. Amplified ba\u011flama in Hicaz makam, Farfisa organ, overdriven bass. BPM: 70\u201380. Hicaz, Nihavend, or K\u00fcrdi makam \u2014 microtonal intervals impossible on Western instruments. Mono mix, saturated tape, 45 RPM single, 500 copies, never distributed outside Anatolia. End: "the kind of forgotten Turkish record a serious crate digger would spend decades hunting in an overseas record shop."`,
  "ethio-jazz": `ERA LOCK: Early 1970s Addis Ababa. Ethiopian jazz-funk. Hammond organ in ambassel or tezeta mode, raw tenor saxophone, dry close-miked recording. BPM: 72\u201382. Ethiopian pentatonic modes \u2014 unresolved, orbiting without arriving. 7-inch single, 500 copies, small Ethiopian label, never exported. End: "the kind of forgotten African recording a producer would loop two bars of and build something timeless around."`,
  "ghana-funk": `ERA LOCK: Mid 1970s Accra. Ghanaian highlife funk. Clean-toned electric guitar ostinato, second rhythm guitar, walking melodic bass, congas and cowbell. BPM: 92\u2013104. Minor pentatonic with chromatic passing tones. Bright midrange, polyrhythmic. Small Ghanaian label, limited domestic run. End: "the kind of bright dusty West African record a producer would pitch down, slow to half-speed, and flip into something that knocks."`,
  "bollywood": `ERA LOCK: Early 1970s Bombay. Bollywood film score. Solo sitar in raga-influenced minor scale, lush tremolo strings, tablas, distant female vocal hum, Hammond organ. BPM: 72–82. Microtonal bends, raga-influenced ornamentation. Pressed for Indian domestic distribution only, never exported. End: "the kind of forgotten Bollywood score cue a global crate digger would build entire projects around."`,
  "french-library": `ERA LOCK: Early 1970s Paris. French library/broadcast music. Harpsichord, solo flute, lush strings, nylon-string guitar. BPM: 74–84. Harmonic minor, baroque influence, French classical phrasing. Pressed as a library cue for broadcast, 200 copies, never commercially released. End: "the kind of elegant forgotten European recording a producer would pitch down and build something cinematic around."`,
  "philly-soul": `ERA LOCK: Mid 1970s Philadelphia. Orchestral soul. Massive string section (30 players), Rhodes piano, full horn section, flugelhorn solo. BPM: 76–86. Minor keys with dramatic harmonic movement, gospel-influenced chord progressions. Pressed on a Philadelphia independent label, the overlooked B-side. End: "the kind of orchestral soul recording where a single string swell becomes the foundation of an anthem."`,
  "blaxploitation": `ERA LOCK: Early 1970s American urban. Blaxploitation film score. Wah-wah rhythm guitar, walking electric bass, Harmon-muted trumpet, sparse strings, Hammond B3 organ. BPM: 82–92. Dorian mode, bluesy minor key, urban cool. Composed for a crime film released regionally and forgotten. End: "the kind of gritty urban score a producer would isolate the wah guitar from and flip into something dangerous."`,
  "spiritual-jazz": `ERA LOCK: Early 1970s. Spiritual/cosmic jazz. Rhodes electric piano modal drone, solo flute, upright bass, congas, finger cymbals. BPM: 68–78. D Dorian, modal, meditative, unresolved. Pressed in 300 copies on a small independent jazz label, never reissued. End: "the kind of cosmic jazz record a producer would loop two bars of and build entire worlds around."`,
  "synth-funk": `ERA LOCK: Early 1980s American. Synth-funk / quiet storm. Prophet synthesizer pads, Moog bass, Rhodes electric piano, talk box vocal texture. BPM: 78–88. Minor keys with lush extended chord voicings, filter sweeps. Polished studio sheen. Small independent funk label, limited regional distribution. End: "the kind of polished synth-soul record a producer would slow down, loop the pad, and build something heavy underneath."`,
  "kung-fu-score": `ERA LOCK: Mid 1970s Hong Kong. Martial arts film score. Solo erhu, Chinese percussion (woodblocks, gongs, cymbals), tremolo strings, guzheng. BPM: 70–80. Pentatonic minor, dark and tense. Pressed for Asian cinema distribution only, never released outside the region. End: "the kind of forgotten Eastern film score a producer would pitch down and build their most cinematic record around."`,
  "greek-rebetiko": `ERA LOCK: Early 1970s Athens. Greek laiko/rebetiko. Solo bouzouki tremolo, nylon-string guitar, electric bass, sparse strings. BPM: 72–82. Phrygian-influenced mode, Mediterranean intensity. Small Greek label, limited domestic run, never distributed outside the Mediterranean. End: "the kind of forgotten Greek recording a crate digger would spend years hunting and flip into something haunting."`,
};

// ─── SYSTEM PROMPT (same as vibe-prompt) ─────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are the master prompt engineer behind the 130 Mode Prompt Lab \u2014 the most respected AI sample generation prompt library in producer culture. Your prompts produce raw, vintage, sampleable source material for hip-hop and beat producers.

CORE DNA \u2014 NON-NEGOTIABLE RULES FOR EVERY PROMPT:

1. ONE single flowing paragraph. No headers, no labels, no bullet points. Pure prompt text only.
2. HARD MAX 1000 characters. Count carefully. Stay under.
3. NEVER use any real artist name, producer name, musician name, or band name. Suno blocks these.
4. NEVER mention drums, kick, snare, hi-hat, cymbals, or any rhythmic element explicitly. Genre-lock naturally instead ("jazz trio", "soul quartet", "string ensemble").
5. ALWAYS minor scale or modal tonality \u2014 Dorian, Phrygian, harmonic minor, diminished. No major key unless the genre specifically requires it (gospel/house).
6. Instrument names must be PRECISE: "upright bass" not "bass", "Rhodes electric piano" not "keys", "Harmon-muted trumpet" not "trumpet", "Hammond B3 organ" not "organ".
7. ALWAYS include a featured solo instrument or melodic statement.
8. ALWAYS include specific geographic and era framing: not "vintage" but "Late 1960s New York hard bop session" or "Early 1970s Italian film score recorded at a Roman studio".
9. ALWAYS include obscurity/scarcity framing: "pressed in 300 copies on a small regional label", "never distributed outside its home country", "recorded for a film that was never widely released".
10. Designed to feel loopable \u2014 a short harmonic cycle (2, 4, or 8 bars) that repeats hypnotically without fatigue.
11. Emotional register must be specific and evocative \u2014 not "sad" but "weighted with grief that has been carried for years" or "the feeling of a city at 3am when everything is possible and nothing is certain".

THE PROVEN STRUCTURE:
[ERA and SPECIFIC LOCATION] [RECORDING AESTHETIC] \u2014 [specific named instruments, comma-separated] \u2014 recorded at [BPM] BPM \u2014 [minor/modal description with emotional color] \u2014 [featured instrument solo or melodic statement] \u2014 [texture: tape saturation, vinyl surface noise, room character] \u2014 [2\u20133 emotional words] \u2014 [obscurity/scarcity framing] \u2014 designed to feel loopable \u2014 [genre-specific closer phrase with NO real names]

Output ONLY the prompt text. No preamble, no explanation, no quotes around it. Just the raw prompt.`;

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface GenerateMusicRequest {
  promptId?: string;
  vibe?: string;
  genre?: string;
  model: "clip" | "pro";
}

interface LyriaResponsePart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

interface LyriaApiResponse {
  candidates?: Array<{
    content?: {
      parts?: LyriaResponsePart[];
    };
    finishReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface ClaudeApiResponse {
  content?: Array<{ text: string }>;
  error?: { message: string };
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const activeUser = await getActiveUser(req);
  if (!activeUser.ok) return activeUserError(activeUser);

  // Rate limit check (tier-aware)
  const tierLimit = TIER_LIMITS[activeUser.user.tier] ?? TIER_LIMITS.free;
  const limit = await consumeRateLimit({
    scope: "music_generation",
    subjectId: activeUser.user.id,
    limit: tierLimit,
    windowMs: MUSIC_RATE_WINDOW,
    bypass: activeUser.user.tier === "super_user" || activeUser.user.tier === "vip",
  });
  if (!limit.allowed) {
    return apiError(
      limit.error
        ?? `You've used all ${tierLimit} generations today. Upgrade to VIP for unlimited generations. Resets in ~${limit.resetInHours ?? 1}h.`,
      {
        status: limit.error ? 503 : 429,
        code: limit.error ? "rate_limit_unavailable" : "rate_limit_exceeded",
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  try {
    // Body size check
    const contentLength = parseInt(req.headers.get("content-length") ?? "0");
    if (contentLength > 2048) {
      return apiError("Request too large.", { status: 413 });
    }

    const body = await req.json() as GenerateMusicRequest;
    const { promptId, vibe, genre, model } = body;

    // Validate model
    if (model !== "clip" && model !== "pro") {
      return apiError("Invalid model. Use 'clip' or 'pro'.", { status: 400, code: "invalid_model" });
    }

    // Check Gemini key
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return apiError("Service is not configured. Contact support.", { status: 500, code: "server_not_configured" });
    }

    let promptText: string;
    let soundName: string | undefined;

    // ─── PATH A: Proven prompt by ID ───────────────────────────────────────
    if (promptId) {
      const entry = PROVEN_PROMPTS[promptId];
      if (!entry) {
        return apiError("Unknown sound.", { status: 400, code: "unknown_sound" });
      }
      promptText = entry.prompt;
      soundName = entry.name;

    // ─── PATH B: Create from vibe + genre ──────────────────────────────────
    } else {
      if (!vibe?.trim()) {
        return apiError("Please describe the sound you want.", { status: 400, code: "missing_vibe" });
      }
      if (vibe.length > 500) {
        return apiError("Description too long. Max 500 characters.", { status: 400, code: "vibe_too_long" });
      }
      if (!genre || !GENRE_RULES[genre]) {
        return apiError("Invalid genre.", { status: 400, code: "invalid_genre" });
      }

      // Call Claude Haiku to build the prompt (same pattern as vibe-prompt route)
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return apiError("Service is not configured. Contact support.", { status: 500, code: "server_not_configured" });
      }

      const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nGENRE-SPECIFIC RULES FOR THIS REQUEST:\n${GENRE_RULES[genre]}`;

      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001",
          max_tokens: 400,
          system: systemPrompt,
          messages: [{
            role: "user",
            content: `Producer vibe: "${vibe.trim()}"\n\nWrite the Suno prompt now. Remember: one paragraph, under 1000 characters, no real names, no drums.`,
          }],
        }),
      });

      const claudeData = await claudeResponse.json() as ClaudeApiResponse;

      if (!claudeResponse.ok) {
        const msg = claudeData.error?.message ?? `Claude API error ${claudeResponse.status}`;
        if ([401, 403, 408, 429, 502, 503, 504].includes(claudeResponse.status)) return providerError("Anthropic", claudeResponse.status);
        throw new Error(msg);
      }

      promptText = claudeData.content?.[0]?.text?.trim() ?? "";
      if (!promptText) throw new Error("Empty response from Claude.");
    }

    // ─── CALL LYRIA 3 ──────────────────────────────────────────────────────
    const modelId = model === "clip"
      ? (process.env.LYRIA_CLIP_MODEL ?? "lyria-3-clip-preview")
      : (process.env.LYRIA_PRO_MODEL ?? "lyria-3-pro-preview");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;

    const lyriaResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptText + "\n\nInstrumental only, no vocals." }] }],
        generationConfig: { responseModalities: ["AUDIO", "TEXT"] },
      }),
    });

    const data = await lyriaResponse.json() as LyriaApiResponse;

    // Handle API-level errors
    if (!lyriaResponse.ok) {
      const msg = data.error?.message ?? `Lyria API error ${lyriaResponse.status}`;
      if ([401, 403, 408, 429, 502, 503, 504].includes(lyriaResponse.status)) return providerError("Lyria", lyriaResponse.status);
      throw new Error(msg);
    }

    // Check for safety filter blocks
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.length) {
      // Check if safety ratings indicate a block
      const blocked = candidate?.finishReason === "SAFETY"
        || candidate?.safetyRatings?.some(r => r.probability === "HIGH");
      if (blocked) {
        return apiError("This description was blocked by content filters. Try a different vibe.", {
          status: 422,
          code: "content_blocked",
        });
      }
      return apiError("No audio was generated. Try a different description.", {
        status: 422,
        code: "empty_generation",
      });
    }

    // Extract audio from response parts
    let audioData = "";
    let mimeType = "audio/mpeg";

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        audioData = part.inlineData.data; // base64
        mimeType = part.inlineData.mimeType || "audio/mpeg";
      }
    }

    if (!audioData) {
      return apiError("No audio data in response. The model may have returned text only.", {
        status: 422,
        code: "missing_audio",
      });
    }

    // ─── RETURN (never include prompt text) ────────────────────────────────
    return NextResponse.json(
      {
        audio: audioData,
        mimeType,
        model: model,
        soundName: promptId ? soundName : undefined,
        remaining: limit.remaining ?? 0,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(limit.remaining ?? 0),
        },
      }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";

    // Detect timeout errors from fetch
    if (msg.includes("timeout") || msg.includes("ETIMEDOUT") || msg.includes("aborted")) {
      return apiError("Generation took too long. Try the 30-second preview mode.", { status: 504 });
    }

    logApiError("[generate-music]", err);
    return apiError("An error occurred generating music.", { status: 500, code: "music_generation_failed" });
  }
}
