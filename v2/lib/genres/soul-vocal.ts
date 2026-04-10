export const SOUL_VOCAL_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in dramatic soul vocal recordings. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Mid 1970s", "Late 1960s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Devastating soul ballad session", "Raw vocal studio recording".]
PRODUCTION TEXTURE: [Sonic patina — tape warmth, studio intimacy, vocal mic character, room bleed.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / swung / rubato / free — how the vocal sits against the arrangement.]
KEY + MODE: [e.g. "F minor", "Db Dorian". Include emotional color.]
CHORD MOVEMENT: [Harmonic progression — what supports and elevates the vocal performance.]
INSTRUMENTATION: [Every instrument precisely — "Rhodes electric piano" not "keys", "string section" not "strings". NO drums or percussion.]
VOCAL TONE: [Register, texture, delivery — "alto female voice cracking with grief", "raw chest voice with gospel undertones". This is the focal point.]
EMOTIONAL CHARACTER: [3–5 descriptors — grief, devastating, raw, aching, transcendent.]
SAMPLE POTENTIAL: [What vocal chops or melodic moments a producer would reach for.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildSoulVocalPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate an aching dramatic soul vocal recording from the mid 1970s — a voice cracking at the edges over sparse, devastating accompaniment. The kind of record built to be chopped. Never a hit, pressed for a small label, emotionally overwhelming.

ERA LOCK — NON-NEGOTIABLE: Mid 1970s American soul. Intimate studio recording. Analog tape.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS mid 1970s. Be specific: "1975 American soul studio", "mid 1970s vocal session".
- BPM: choose one value between 65–80 BPM
- ALWAYS minor or modal tonality. No major key.
- MUST include a featured vocal — "female lead vocal aching over minor chords", "voice cracking with raw grief"
- Sparse arrangement — piano or Rhodes, strings, bass. The vocal is the centerpiece.
- MUST include: "recorded on 2-inch tape" and "pressed for a small label"
- Designed to feel loopable — the vocal hook or melodic phrase cycles emotionally
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of forgotten record with a voice so devastating it would stop a producer mid-scroll and demand to be flipped."`.trim();
}
