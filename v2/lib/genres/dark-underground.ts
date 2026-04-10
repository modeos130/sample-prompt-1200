export const DARK_UNDERGROUND_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst specializing in dark, obscure underground recordings. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Early 1970s", "Late 1960s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Eastern European concrete studio session", "Cold underground jazz recording", "Dark modal organ improvisation".]
PRODUCTION TEXTURE: [Sonic patina — concrete room reverb, analog tape hiss, claustrophobic close-mic, lo-fi warmth.]
BPM: [Tight 2-number range. If no clear pulse, describe rhythmic feel.]
GROOVE: [Straight / swung / rubato / hypnotic — how the rhythm sits and breathes.]
KEY + MODE: [e.g. "C# minor", "F Locrian". Include scale character and darkness level.]
CHORD MOVEMENT: [Harmonic progression — what cycles, what drones, what creates tension.]
INSTRUMENTATION: [Every instrument precisely — "Hammond organ" not "keys", "upright bass" not "bass". NO drums or percussion.]
VOCAL TONE: [If vocals: register, texture. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 mood descriptors — claustrophobic, menacing, hypnotic, cold, dread.]
SAMPLE POTENTIAL: [What a dark boom bap producer would gravitate toward.]
PRODUCER DNA: [Which aesthetic of underground hip-hop production this feeds — no artist names.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/tempo direction]
B. [Second distinct direction]
C. [Third direction]
`.trim();

export function buildDarkUndergroundPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a dark, claustrophobic recording from the early 1970s — recorded in a concrete building at 3am, Eastern European or underground American. Hammond organ or electric piano carrying a menacing modal line. The kind of record that was never meant to be heard outside a small circle.

ERA LOCK — NON-NEGOTIABLE: Early 1970s. Cold, dark, underground. Analog recording in a sparse, reverberant room.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS early 1970s. Be specific: "1971 Eastern European studio", "early 1970s underground recording session".
- BPM: choose one value between 65–80 BPM
- ALWAYS minor, Locrian, Phrygian, or diminished tonality. No major key.
- MUST include a featured instrument — "Hammond organ droning in minor thirds", "electric piano cycling a cold modal phrase"
- Sparse arrangement — organ, bass, maybe one other instrument. Minimal.
- MUST include: "recorded in a concrete room" and "analog tape hiss"
- Add obscurity framing: "pressed in small quantities", "never distributed outside its home country"
- Designed to feel loopable — hypnotic, cycling, claustrophobic
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of forgotten record that sounds like it was recorded in a bunker and would stop a producer cold the moment the needle dropped."`.trim();
}
