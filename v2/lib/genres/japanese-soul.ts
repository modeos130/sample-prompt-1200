export const JAPANESE_SOUL_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Japanese soul, jazz-funk, and city pop. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Mid 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Tokyo studio soul-jazz session", "Japanese city pop recording".]
PRODUCTION TEXTURE: [Sonic patina — pristine Japanese studio quality, warm analog, tape character.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / swung / laid-back — how the groove floats and breathes.]
KEY + MODE: [e.g. "Eb minor", "A Dorian". Include dreamy or melancholic character.]
CHORD MOVEMENT: [Harmonic progression — jazz-influenced chord movement, extensions, voicings.]
INSTRUMENTATION: [Every instrument precisely — "Rhodes electric piano" not "keys", "nylon guitar" not "guitar". NO drums or percussion.]
VOCAL TONE: [If vocals: register, language, delivery. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — dreamy, distant, melancholic, warm, nocturnal.]
SAMPLE POTENTIAL: [What Rhodes phrases or melodic moments beg to be looped.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildJapaneseSoulPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a mid 1970s Japanese soul-jazz recording — a Tokyo studio session that was never exported outside Japan. Rhodes electric piano carrying a dreamy, distant melody over warm bass and lush string pads. The kind of record that defines late-night Tokyo.

ERA LOCK — NON-NEGOTIABLE: Mid 1970s. Tokyo recording studio. Japanese pressing, domestic market only.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS mid 1970s. Be specific: "1976 Tokyo studio", "mid 1970s Japanese soul session".
- BPM: choose one value between 75–92 BPM
- ALWAYS minor or Dorian — dreamy, melancholic. No major key.
- MUST include a featured instrument — "Rhodes electric piano carrying a distant, dreamy melody"
- Warm, pristine Japanese studio production — analog but clean
- MUST include: "recorded in Tokyo" and "never exported outside Japan"
- Designed to feel loopable — the Rhodes phrase cycles with hypnotic warmth
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of forgotten Japanese pressing a crate digger would find in a Shibuya basement shop and guard with their life."`.trim();
}
