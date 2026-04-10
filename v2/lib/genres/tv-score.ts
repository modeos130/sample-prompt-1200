export const TV_SCORE_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in early 1970s television and production library music. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Early 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Television production library cue", "Crime drama underscore session".]
PRODUCTION TEXTURE: [Sonic patina — broadcast-quality recording, studio compression, tape character.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / tense / pulsing / atmospheric — how it builds suspense.]
KEY + MODE: [e.g. "C minor", "G Phrygian". Include tension level.]
CHORD MOVEMENT: [Harmonic progression — what suspends, what builds, what refuses to resolve.]
INSTRUMENTATION: [Every instrument precisely — "vibraphone" not "mallet", "wah guitar" not "guitar", "Fender Rhodes" not "keys". NO drums or percussion.]
VOCAL TONE: [If vocals present. Usually: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — tense, unresolved, surveillance, functional, cinematic.]
SAMPLE POTENTIAL: [What moments create tension and atmosphere for sampling.]
SCENE DNA: [What TV scene this underscores — stakeout, chase, revelation, interrogation.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildTvScorePrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate an early 1970s television production library cue — the kind of music pressed in 300 copies for broadcast use only, never sold commercially. Flute and vibraphone over electric piano creating functional tension. A detective watching someone from a car at 2am.

ERA LOCK — NON-NEGOTIABLE: Early 1970s. American or British television studio. Production library pressing.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS early 1970s. Be specific: "1972 television broadcast studio", "early 1970s production library session".
- BPM: choose one value between 70–90 BPM
- ALWAYS minor or modal — tense, unresolved harmony. No major key.
- MUST include featured instruments — "flute over vibraphone", "wah guitar and electric piano creating tense atmosphere"
- Functional music feel — purposeful, scene-serving, mood-building
- MUST include: "pressed in 300 copies" and "for broadcast use only"
- Designed to feel loopable — tension that cycles without resolving
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of production library cue that was never meant for public ears and carries more tension than any commercial recording."`.trim();
}
