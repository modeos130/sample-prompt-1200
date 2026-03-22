export const JAZZ_SOUL_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in small ensemble jazz and soul-jazz of the 1960s and 1970s. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, recording quality, sonic texture. Be specific.]
RECORDING AESTHETIC: [Evocative description — e.g. "Late night small group session", "Regional jazz label recording", "Soul-jazz fusion ensemble", "Hard bop trio with horns".]
PRODUCTION TEXTURE: [Sonic character — dry room acoustics, analog tape hiss, vinyl surface noise, mic placement. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "82–90". If no clear pulse, describe the rhythmic feel.]
GROOVE: [Swung / straight / walking / rubato — with nuance about how it breathes and locks.]
KEY + MODE: [e.g. "Eb minor", "C Dorian", "F blues scale". Include emotional color and tension.]
CHORD MOVEMENT: [Harmonic progression — what moves, what cycles, the jazz harmony implied emotionally.]
INSTRUMENTATION: [Every instrument named specifically — "upright bass" not "bass", "muted trumpet" not "trumpet", "tenor saxophone" not "sax", "brushed snare" if applicable but prefer no drum mention. NO kick, hi-hat, drum machine mentioned.]
VOCAL TONE: [If vocals: register, texture, jazz phrasing style. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — late night, melancholic, searching, warm, dusty, intimate.]
SAMPLE POTENTIAL: [The 2-bar phrase a producer would loop — the horn line, the piano comp, the bass walk, the moment that begs to be lifted.]
PRODUCER DNA: [What era and sensibility of producers would reach for this. Specific aesthetic — not artist names.]
FLIP DIRECTIONS:
A. [Specific loop/chop/pitch direction grounded in what you heard]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildJazzSoulPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers who dig deep for small ensemble jazz. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a late night small ensemble jazz recording from the early 1970s — the kind pressed in small quantities for a regional label, played at a club that closed years ago, never received national distribution. Warm, dusty, and live — the kind of two-bar loop a producer could build entire worlds around.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to early 1970s small ensemble jazz regardless of what era the source analysis describes. Think regional jazz labels, late night sessions, soul-jazz trios and quartets, hard bop with a warm earthy feel.

JAZZ SOUL AESTHETIC DNA:

Regional label late night sessions: small combo in a dry room, musicians responding to each other in real time, the sound of a club after midnight, upright bass anchor, brushed or loose rhythm, horn melody breezy on the surface but heavy underneath.

Soul-jazz fusion energy: jazz harmony meeting R&B feel, the groove between hard bop and soul, organ or Rhodes adding warmth, trumpet or saxophone carrying a melodic statement over the changes.

Warm dusty room character: minimal microphone placement, the room acoustics natural and present, analog tape hiss subtle but there, the sound of a recording made without overthinking it.

BASE everything on the analysis below — translate into an early 1970s regional jazz recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully.
- ERA is ALWAYS early 1970s small ensemble jazz. Be specific: "1971 regional label jazz session", "Early 1970s soul-jazz quartet pressed for local distribution".
- BPM: choose one value between 82–96 BPM — state it explicitly. Higher BPM flips naturally into boom bap range when looped.
- Tonality: minor or Dorian or blues — melancholic, searching, warm. No bright major.
- MUST include a specific horn or melodic instrument lead — "muted trumpet over the changes", "tenor saxophone running the minor harmony"
- Walking upright bass is mandatory — it is the genre's anchor
- Dry room acoustics, analog tape hiss, musicians responding to each other in real time
- Add regional obscurity context: "pressed in small quantities for a regional jazz label", "played at a club that closed years ago"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat — use "loose rhythm section" or omit entirely
- End exactly with: "the kind of warm dusty record [descriptive aesthetic phrase — NO real names] would loop two bars of and build entire worlds around."

Structure:
[Early 1970s ERA and LOCATION] [SMALL ENSEMBLE RECORDING AESTHETIC] — [upright bass and specific named instruments] — recorded at [82–96] BPM — [minor/Dorian description] — [featured horn or melodic statement] — dry room acoustics, analog tape hiss, musicians responding in real time — warm and melancholic, [1–2 additional emotional words] — [regional obscurity context] — designed to feel loopable — the kind of warm dusty record [descriptive aesthetic phrase, NO real names] would loop two bars of and build entire worlds around.`.trim();
}
