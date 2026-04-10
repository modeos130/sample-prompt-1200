export const BRAZILIAN_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Brazilian music — samba, bossa nova, MPB, and tropicália. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Late 1960s", "Late 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Rio de Janeiro broken samba session", "São Paulo jazz-funk fusion recording".]
PRODUCTION TEXTURE: [Sonic patina — warm analog, intimate studio, tape character, room ambience.]
BPM: [Tight 2-number range.]
GROOVE: [Samba / bossa / broken / circular — how the Brazilian rhythmic feel sits.]
KEY + MODE: [e.g. "D minor", "Bb Dorian". Include warmth and melancholy.]
CHORD MOVEMENT: [Harmonic progression — bossa nova changes, jazz-influenced voicings, modal shifts.]
INSTRUMENTATION: [Every instrument precisely — "cavaquinho" not "guitar", "nylon guitar" not "acoustic guitar", "breathy flute" not "flute". NO drums or percussion.]
VOCAL TONE: [If vocals: register, Portuguese delivery, emotional quality. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — melancholic, warm, rhythmic, yearning, circular.]
SAMPLE POTENTIAL: [What guitar phrases or flute lines beg to be looped.]
FLIP DIRECTIONS:
A. [Specific direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildBrazilianPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a late 1960s–1970s Brazilian recording — Rio de Janeiro or São Paulo. Cavaquinho or nylon guitar carrying a melancholic, circular melody. A samba that never resolved, or a jazz-funk fusion that never left the country. Warm, analog, intimate.

ERA LOCK — NON-NEGOTIABLE: Late 1960s to late 1970s. Brazilian studio recording. Analog tape, intimate production.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS late 1960s–1970s. Be specific: "1969 Rio de Janeiro studio", "1978 São Paulo session".
- BPM: choose one value between 80–100 BPM
- Minor or Dorian — melancholic, warm. Jazz-influenced harmony.
- MUST include a featured instrument — "cavaquinho picking a circular minor melody", "nylon guitar and breathy flute over warm bass"
- Brazilian ensemble feel — guitar, flute, bass, piano
- MUST include: "recorded in Brazil" and "never exported"
- Designed to feel loopable — circular, warm, rhythmic
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat
- End exactly with: "the kind of Brazilian recording that was pressed for the domestic market and carries the warmth and melancholy of an entire city."`.trim();
}
