export const AFROBEAT_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Nigerian Afrobeat and West African highlife. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Early 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Lagos Afrobeat session", "West African studio recording".]
PRODUCTION TEXTURE: [Sonic patina — hot African studio, analog tape, room bleed, horn section proximity.]
BPM: [Tight 2-number range.]
GROOVE: [Polyrhythmic / cyclical / hypnotic — how multiple rhythmic layers interlock.]
KEY + MODE: [e.g. "D Dorian", "G minor pentatonic". Include cyclical harmonic character.]
CHORD MOVEMENT: [Harmonic movement — typically vamp-based, one or two chords cycling hypnotically.]
INSTRUMENTATION: [Every instrument precisely — "baritone saxophone" not "sax", "tenor guitar" not "guitar". NO drums or percussion.]
VOCAL TONE: [If vocals: register, call-and-response character. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — hypnotic, political, relentless, driving, transcendent.]
SAMPLE POTENTIAL: [What horn riffs or bass lines would be devastating in a hip-hop context.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildAfrobeatPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate an early 1970s Nigerian Afrobeat recording — a Lagos studio session with a massive horn section, relentless bass, and hypnotic repetition. Political energy channeled through music. The rhythm never stops.

ERA LOCK — NON-NEGOTIABLE: Early 1970s. Lagos, Nigeria. African studio recording on analog equipment.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS early 1970s. Be specific: "1972 Lagos studio", "early 1970s Nigerian recording session".
- BPM: choose one value between 100–120 BPM
- Dorian, minor pentatonic, or modal — cyclical, vamp-based harmony. No major key.
- MUST include featured instruments — "baritone saxophone driving a relentless riff", "tenor saxophone and trumpet section in unison"
- Full Afrobeat ensemble — horns, bass, guitar, organ
- MUST include: "recorded in Lagos" and "analog tape"
- Designed to feel loopable — the entire piece is built on hypnotic repetition
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of Afrobeat recording that carries the weight of a movement and would become the backbone of something legendary."`.trim();
}
