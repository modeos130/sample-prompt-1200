export const REGGAE_DUB_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Jamaican dub and roots reggae. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Late 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Kingston dub studio session", "Channel One mixing board recording".]
PRODUCTION TEXTURE: [Sonic patina — cavernous reverb, tape delay, spring echo, analog warmth, mixing board character.]
BPM: [Tight 2-number range.]
GROOVE: [Half-time / one-drop / steppers — how the rhythm breathes with space.]
KEY + MODE: [e.g. "A minor", "E Dorian". Include spacious, meditative character.]
CHORD MOVEMENT: [Harmonic movement — typically sparse, one or two chords with melodica or organ fills.]
INSTRUMENTATION: [Every instrument precisely — "melodica" not "keyboard", "clavinet" not "keys", "dub bass" not "bass". NO drums or percussion.]
VOCAL TONE: [If vocals present. If none: "Instrumental dub — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — cavernous, hypnotic, spacious, meditative, deep.]
SAMPLE POTENTIAL: [What bass lines or melodica phrases create atmosphere for sampling.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildReggaeDubPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a late 1970s Kingston dub recording — reverb as architecture, space as instrument. Melodica or organ floating over deep, cavernous bass. The kind of studio dub that turns a mixing board into a compositional tool.

ERA LOCK — NON-NEGOTIABLE: Late 1970s. Kingston, Jamaica. Analog studio with spring reverb and tape delay.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS late 1970s. Be specific: "1978 Kingston studio", "late 1970s Jamaican dub session".
- BPM: choose one value between 65–80 BPM
- Minor or Dorian — spacious, meditative. No major key.
- MUST include featured instruments — "melodica floating through cavernous reverb", "organ chords dissolving into tape delay"
- Dub production techniques — spring reverb, tape echo, mixing board manipulation
- MUST include: "Kingston, Jamaica" and "reverb as architecture"
- Designed to feel loopable — deep, hypnotic, spacious
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of dub recording where the silence between notes carries as much weight as the notes themselves."`.trim();
}
