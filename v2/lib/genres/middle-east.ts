export const MIDDLE_EAST_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Middle Eastern and North African orchestral music. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Early 1970s", "Late 1960s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Cairo studio orchestra", "Istanbul modal recording session".]
PRODUCTION TEXTURE: [Sonic patina — analog warmth, room reverb, tape character, mic placement.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / hypnotic / rubato / cyclical — how the rhythm breathes.]
KEY + MODE: [e.g. "D Phrygian dominant", "Bb Hijaz". Include maqam or scale character.]
CHORD MOVEMENT: [Harmonic movement — what drones, what cycles, what creates tension.]
INSTRUMENTATION: [Every instrument precisely — "oud" not "guitar", "ney flute" not "flute", "qanun" not "harp". NO drums or percussion.]
VOCAL TONE: [If vocals: register, texture, melismatic quality. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — dread, hypnotic, unresolved, ancient, cinematic.]
SAMPLE POTENTIAL: [What a hip-hop producer would chop from this.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildMiddleEastPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a Middle Eastern orchestral recording from the early 1970s — recorded in Cairo or Istanbul, never exported outside the region. Oud or sitar carrying a hypnotic, unresolved modal line over sustained strings. The kind of record that drips with dread and ancient weight.

ERA LOCK — NON-NEGOTIABLE: Early 1970s. Middle Eastern or North African studio recording. Analog production.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS early 1970s. Be specific: "1971 Cairo studio", "early 1970s Istanbul recording session".
- BPM: choose one value between 65–80 BPM
- ALWAYS Phrygian dominant, Hijaz, harmonic minor, or related maqam-based tonality. No major key.
- MUST include a featured instrument — "oud cycling a hypnotic Phrygian phrase", "sitar bending through quarter-tone intervals"
- Orchestral Middle Eastern feel — strings, oud, ney flute, qanun
- MUST include: "recorded on analog tape" and "never left the region"
- Designed to feel loopable — hypnotic, cycling, unresolved
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of forgotten record that carries the weight of centuries and would stop a producer cold the moment it surfaces."`.trim();
}
