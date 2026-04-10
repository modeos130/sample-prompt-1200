export const BOOM_BAP_DARK_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in dark, menacing soul and jazz recordings — the source material for the hardest hip-hop ever made. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Late 1960s", "Mid 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Dark soul studio session", "Menacing jazz-funk recording".]
PRODUCTION TEXTURE: [Sonic patina — cold reverb, dark analog tape, sparse mixing, ominous atmosphere.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / menacing / minimal — how the darkness sits rhythmically.]
KEY + MODE: [e.g. "C# minor", "Ab Phrygian". Include darkness and menace level.]
CHORD MOVEMENT: [Harmonic progression — what descends, what threatens, what creates cold tension.]
INSTRUMENTATION: [Every instrument precisely — "electric piano" not "keys", "muted trumpet" not "horn", "bowed upright bass" not "bass". NO drums or percussion.]
VOCAL TONE: [If vocals present. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — dark, menacing, cold, ominous, cinematic.]
SAMPLE POTENTIAL: [What piano loops or horn phrases would become the hardest beat ever made.]
PRODUCER DNA: [Which aesthetic of dark, hard hip-hop production this feeds — no artist names.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildBoomBapDarkPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a dark, menacing soul recording from the late 1960s–mid 1970s — the source material for the hardest records ever made. Electric piano or organ cycling a cold minor phrase over ominous strings. Built to be chopped into something dangerous.

ERA LOCK — NON-NEGOTIABLE: Late 1960s to mid 1970s. Dark American soul or jazz-funk. Analog recording with cold, sparse production.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS late 1960s–mid 1970s. Be specific: "1969 dark soul session", "mid 1970s cinematic soul recording".
- BPM: choose one value between 70–85 BPM
- ALWAYS minor, Phrygian, or diminished. Maximum darkness. No major key.
- MUST include featured instruments — "electric piano cycling a cold minor loop", "strings descending ominously over muted trumpet"
- Dark, sparse arrangement — piano, strings, bass, maybe one horn
- MUST include: "recorded on 2-inch tape" and "cold analog atmosphere"
- Designed to feel loopable — a menacing cycle that repeats with dread
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of dark soul record that becomes the foundation for the hardest, most menacing music ever created."`.trim();
}
