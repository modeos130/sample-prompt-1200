export const LIVE_FUNK_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in live funk, stage band performances, and raw brass-driven music. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Early 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Live gymnasium funk performance", "High school stage band recording".]
PRODUCTION TEXTURE: [Sonic patina — live room acoustics, audience bleed, imperfect mic placement, raw energy.]
BPM: [Tight 2-number range.]
GROOVE: [Straight funk / syncopated / driving — how the live band locks in.]
KEY + MODE: [e.g. "F minor", "Bb Dorian". Include raw, energetic character.]
CHORD MOVEMENT: [Harmonic progression — typically vamp-based with horn riffs over cycling changes.]
INSTRUMENTATION: [Every instrument precisely — "brass section" not "horns", "flute solo" not "woodwind", "electric bass" not "bass". NO drums or percussion.]
VOCAL TONE: [If vocals: shouts, call-and-response. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — raw, adrenaline, imperfect, alive, triumphant.]
SAMPLE POTENTIAL: [What brass riffs or flute solos beg to be chopped.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildLiveFunkPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate an early 1970s live funk performance — teenage adrenaline in a gymnasium or stadium. Massive brass section, flute solos, raw and imperfect. The kind of live recording that captures lightning in a bottle — energy that studio recordings can never match.

ERA LOCK — NON-NEGOTIABLE: Early 1970s. Live performance recording — gymnasium, stadium, or auditorium. Raw acoustics.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS early 1970s. Be specific: "1972 high school gymnasium", "early 1970s live stage band performance".
- BPM: choose one value between 95–115 BPM
- Minor or Dorian — raw, driving energy. Funk vamp harmony.
- MUST include featured instruments — "brass section in unison", "flute solo cutting through the brass", "60-piece horn section"
- Live recording feel — room acoustics, imperfect timing, raw energy, audience presence
- MUST include: "live performance recording" and "gymnasium acoustics"
- Designed to feel loopable — the brass riff or flute phrase cycles with relentless energy
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of live recording that captures raw teenage adrenaline and imperfect brilliance that no studio could ever replicate."`.trim();
}
