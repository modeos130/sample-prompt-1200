export const CINEMATIC_DARK_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in European film scores, library music, and dark cinematic orchestral recordings of the 1960s and 1970s. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, orchestration style, recording texture. Be specific.]
RECORDING AESTHETIC: [Evocative description — e.g. "Italian giallo horror score", "French New Wave film cue", "Eastern European library music", "British crime drama incidental score", "Spaghetti western suspense cue".]
PRODUCTION TEXTURE: [Sonic character — analog tape hollow studio sound, vinyl degradation, wow-flutter, orchestral room bleed. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "68–76". If no clear pulse, describe the cinematic feel and pacing.]
GROOVE: [Slow and deliberate / pulsing ostinato / free cinematic / suspense rubato — how it moves.]
KEY + MODE: [e.g. "C# minor", "F Phrygian", "D diminished". Include the dark emotional quality and unresolved tension.]
CHORD MOVEMENT: [Harmonic progression — what drones, what creates dread, what never resolves. Gothic, film noir, or horror influence.]
INSTRUMENTATION: [Every instrument named specifically — "orchestral string section" not "strings", "solo flute" not "flute", "harpsichord" if present, "muted tremolo strings" if applicable. NO drums, kick, snare mentioned.]
VOCAL TONE: [If vocals: ghostly quality, wordless, buried. If none: "Instrumental."]
EMOTIONAL CHARACTER: [3–5 descriptors — eerie, menacing, haunting, cold, dread, cinematic darkness.]
SAMPLE POTENTIAL: [The repeating bass ostinato, the flute motif, the string swell, the harpsichord stab — what a dark producer would pitch down and loop over 808s.]
PRODUCER DNA: [What era and sensibility of dark producers would reach for this. Specific aesthetic — not artist names.]
FLIP DIRECTIONS:
A. [Specific pitch/loop/texture direction grounded in what you heard]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildCinematicDarkPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers who build dark cinematic beats from obscure European film scores. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a dark, eerie orchestral recording from the early 1970s — the kind recorded for a low-budget Italian crime film, pressed in tiny quantities for cinema distribution only, never commercially released. The kind of score cue that sounds dangerous when pitched down, slowed, and looped under a hard beat.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to early 1970s European dark cinematic music regardless of what era the source analysis describes. Think Italian giallo film scores, Eastern European library music, French New Wave suspense cues, British horror incidental scores — the underground of European film music that producers have been excavating for decades.

DARK CINEMATIC AESTHETIC DNA:

Italian giallo horror scores: pulsing electric bass ostinato locked in a minor key cycle, cold analog synthesizer arpeggio spiraling and refusing to resolve, harpsichord interjections sharp and startling, orchestral strings trembling with menace, ghostly female vocal buried deep — not words, just tonal atmosphere.

Eastern European library music: cold, sparse, harmonically restless, recorded for state film studios in small quantities, the sound of composers with classical training making functional music with maximum creative freedom.

Film score cue architecture: self-contained musical piece with built-in tension arc, unresolved ending that loops back naturally, written to accompany visual media — designed to loop without demanding attention.

BASE everything on the analysis below — translate into an early 1970s dark European cinematic recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully.
- ERA is ALWAYS early 1970s European dark cinematic. Be specific: "1972 Italian crime film score recorded at a Roman studio", "Early 1970s Eastern European library music cue".
- BPM: choose one value between 65–82 BPM — state it explicitly
- Tonality: Phrygian, diminished, harmonic minor — unresolved, menacing, cold. Absolute no major key.
- MUST include pulsing bass ostinato as the rhythmic anchor
- MUST include either solo flute, harpsichord, or cold analog synth as the melodic lead
- Ghostly buried female vocal hum as atmospheric texture — not singing, just tone
- Unresolved harmonic tension throughout — no cathartic release, no resolution
- Add distribution context: "pressed in tiny quantities for Italian cinema distribution", "recorded for a film that was never widely released"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat
- End exactly with: "the kind of forgotten European score cue [descriptive aesthetic phrase — NO real names] would pitch down, slow, and loop into something that hits like a freight train."

Structure:
[Early 1970s ERA and EUROPEAN LOCATION] [DARK CINEMATIC RECORDING AESTHETIC] — [pulsing bass ostinato, specific named dark instruments] — recorded at [65–82] BPM — [Phrygian/diminished/dark modal description] — [featured dark melodic element] — analog tape, hollow studio sound — eerie and menacing, [1–2 additional dark emotional words] — [cinema distribution obscurity context] — designed to feel loopable with no resolution — the kind of forgotten European score cue [descriptive aesthetic phrase, NO real names] would pitch down, slow, and loop into something that hits like a freight train.`.trim();
}
