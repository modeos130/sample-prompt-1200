export const PSYCH_SOUL_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in psychedelic soul and dark underground recordings. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Late 1960s", "Early 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Hallucinatory soul session", "Psychedelic underground recording".]
PRODUCTION TEXTURE: [Sonic patina — tape warble, phaser effects, lo-fi haze, room ambience.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / swung / woozy / rubato.]
KEY + MODE: [e.g. "Ab minor", "E Phrygian".]
CHORD MOVEMENT: [Harmonic progression — what floats, what sinks, what disorients.]
INSTRUMENTATION: [Every instrument precisely — "harpsichord" not "keys", "fuzz bass" not "bass". NO drums or percussion.]
VOCAL TONE: [If vocals: register, texture, psychedelic quality. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — hallucinatory, dark, melancholic, woozy, spectral.]
SAMPLE POTENTIAL: [What moments beg to be chopped and pitched.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildPsychSoulPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a hallucinatory psychedelic soul recording from the late 1960s — pressed in small quantities by an unknown American label, never distributed. Harpsichord or electric sitar carrying a dark, woozy melody that feels like it's melting. The kind of record that sounds like a fever dream committed to vinyl.

ERA LOCK — NON-NEGOTIABLE: Late 1960s psychedelic soul. Analog recording with tape artifacts and phaser-like natural room effects.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS late 1960s. Be specific: "1968 unknown American studio", "late 1960s psychedelic soul session".
- BPM: choose one value between 68–82 BPM
- ALWAYS minor or modal — Dorian, Phrygian, harmonic minor. No major key.
- MUST include a featured instrument — "harpsichord arpeggios drifting through reverb", "electric sitar bending through a minor scale"
- Psychedelic production — tape warble, natural phasing, woozy feel
- MUST include: "recorded on 2-inch tape" and "pressed in small quantities"
- Designed to feel loopable — hypnotic and disorienting
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of forgotten record that sounds like a hallucination committed to vinyl and would haunt a producer for years."`.trim();
}
