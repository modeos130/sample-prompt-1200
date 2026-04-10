export const MOTOWN_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Motown, Detroit soul, and Northern soul. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Late 1960s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Detroit soul assembly line production", "Northern soul dancer".]
PRODUCTION TEXTURE: [Sonic patina — Studio A warmth, tambourine shimmer, bass-heavy mix, tape compression.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / bouncy / driving — how the Funk Brothers-style pocket sits.]
KEY + MODE: [e.g. "G minor", "Bb major". Motown used both — note the emotional temperature.]
CHORD MOVEMENT: [Harmonic progression — Motown changes, gospel-influenced, pop sophistication.]
INSTRUMENTATION: [Every instrument precisely — "tambourine" not "percussion", "Jamerson-style bass line" not "bass", "vibraphone" not "mallet". NO drums.]
VOCAL TONE: [If vocals: register, texture, Motown delivery style. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — soulful, bright, energetic, joyful, driving.]
SAMPLE POTENTIAL: [What bass lines, string arrangements, or vocal hooks beg to be flipped.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildMotownPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a late 1960s Detroit Motown recording — the assembly line of joy. Tambourine shimmering over a driving bass line, string section adding drama, the whole arrangement engineered for maximum emotional impact. A hit single that somehow never crossed over.

ERA LOCK — NON-NEGOTIABLE: Late 1960s. Detroit, Michigan. Motown studio production aesthetic.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS late 1960s. Be specific: "1967 Detroit studio", "late 1960s Motown-era session".
- BPM: choose one value between 100–120 BPM
- Minor or Dorian preferred for sampling depth, but bright emotional energy.
- MUST include featured elements — "tambourine shimmer", "driving bass line", "lush string arrangement"
- Full Motown ensemble — bass, strings, horns, vibraphone, tambourine
- MUST include: "Detroit studio production" and "engineered for emotional impact"
- Designed to feel loopable — the string hook or bass riff cycles irresistibly
- NEVER use any real artist, producer, or band name
- NEVER mention drums, kick, snare, hi-hat
- End exactly with: "the kind of Motown-era record that carries the joy of an entire era and begs to be reborn as something new."`.trim();
}
