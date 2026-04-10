export const CHIPMUNK_SOUL_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in early 1960s girl group and doo-wop soul. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Early 1960s", "Late 1950s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Regional girl group 45 RPM single", "Small label doo-wop soul recording".]
PRODUCTION TEXTURE: [Sonic patina — mono recording, jukebox-ready compression, tape warmth, AM radio quality.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / bouncy / swung — how the rhythm drives and pops.]
KEY + MODE: [e.g. "A minor", "G Dorian". Include emotional energy level.]
CHORD MOVEMENT: [Harmonic progression — what bounces, what drives, what the doo-wop changes imply.]
INSTRUMENTATION: [Every instrument precisely — "female vocal harmonies" not "vocals", "standup bass" not "bass". NO drums or percussion.]
VOCAL TONE: [Register, texture — "bright female harmonies", "call-and-response girl group arrangement".]
EMOTIONAL CHARACTER: [3–5 descriptors — bouncy, energetic, bright, youthful, urgent.]
SAMPLE POTENTIAL: [What a chipmunk-soul producer would pitch up and chop — vocal hooks, melodic phrases.]
FLIP DIRECTIONS:
A. [Specific direction — pitched up]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildChipmunkSoulPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate an early 1960s girl group soul record — bouncy, energetic, bright female vocal harmonies over a snappy arrangement. A regional 45 RPM single that got local airplay but never crossed over. Built to be pitched up and flipped into a chipmunk soul anthem.

ERA LOCK — NON-NEGOTIABLE: Early 1960s. Girl group / doo-wop soul era. Mono recording, AM radio quality.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS early 1960s. Be specific: "1962 regional American studio", "early 1960s girl group session".
- BPM: choose one value between 95–115 BPM
- Minor or Dorian tonality preferred but bright minor energy is acceptable.
- MUST include featured vocals — "female vocal harmonies in tight thirds", "girl group call-and-response"
- Arrangement: standup bass, piano, strings, horns — bright and punchy
- MUST include: "mono recording" and "pressed as a 45 RPM single"
- Add obscurity framing: "local airplay only", "never crossed over", "regional label pressing"
- Designed to feel loopable — a vocal hook that begs to be pitched up
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of forgotten 45 a producer would find in a dollar bin and pitch up into an anthem that shakes the room."`.trim();
}
