export const DRUM_BREAK_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in 1970s live funk drumming and breakbeats. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade — e.g. "Early 1970s", "Mid 1970s".]
RECORDING AESTHETIC: [Evocative description — e.g. "Raw live funk drum performance", "Empty room drum session".]
PRODUCTION TEXTURE: [Sonic patina — room ambience, overhead mic character, tape saturation, snare rattle, cymbal wash.]
BPM: [Tight 2-number range.]
GROOVE: [Straight / swung / syncopated / loose — how the drummer sits in the pocket.]
DYNAMIC ARC: [How the performance builds — intro fill, verse groove, bridge break, climax.]
FEEL: [Behind the beat / on top / pushing — the human timing character.]
KIT CHARACTER: [Drum kit described in detail — shell sizes, cymbal types, tuning, snare character, bass drum tone.]
BREAK POTENTIAL: [Which sections are the money — the two-bar break, the fill into the chorus, the stripped-down moment.]
EMOTIONAL CHARACTER: [3–5 descriptors — raw, powerful, relentless, funky, untamed.]
FLIP DIRECTIONS:
A. [Specific chop direction]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildDrumBreakPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a raw 1970s live funk drum performance — one drummer in an empty studio room, three acts of escalating intensity. The kind of drum break that becomes the foundation for an entire genre. Recorded hot to tape with room ambience and natural compression.

ERA LOCK — NON-NEGOTIABLE: 1970s. Live studio drum recording. One drummer, one room, one take.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS 1970s. Be specific: "1973 empty studio room", "mid 1970s live drum session".
- BPM: choose one value between 90–110 BPM
- Focus entirely on the drum performance — groove, fills, dynamics, pocket
- MUST describe the performance arc — "opens with a two-bar fill, settles into a deep pocket groove, builds through syncopated variations"
- Kit description — "deep-tuned kick, cracking snare, sizzling ride cymbal"
- MUST include: "recorded hot to 2-inch tape" and "room ambience from overhead mics"
- This is DRUMS ONLY — solo drum performance, no other instruments
- Designed to feel loopable — the core groove section should cycle perfectly
- NEVER use any real artist, producer, or band name
- NEVER mention melodic instruments — this is purely rhythmic
- End exactly with: "the kind of drum break that was buried on the B-side and became the foundation for an entire generation of music."`.trim();
}
