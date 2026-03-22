export const LATIN_SOUL_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Latin soul, salsa, and New York Latin music of the late 1960s and 1970s. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, recording quality, Latin style markers. Be specific.]
RECORDING AESTHETIC: [Evocative description — e.g. "Spanish Harlem indie label session", "New York Latin soul ensemble", "Fania-era salsa orchestra", "Barrio street soul recording".]
PRODUCTION TEXTURE: [Sonic character — analog tape warmth, vinyl surface noise, room bleed, brass proximity. What does it physically feel like?]
BPM: [Tight 2-number range. If unclear, describe the clave feel and rhythmic pulse.]
GROOVE: [Clave pattern / mambo feel / slow bolero / son montuno — how it breathes and locks.]
KEY + MODE: [e.g. "D minor", "Bb minor", "G Phrygian". Include emotional and cultural color.]
CHORD MOVEMENT: [Harmonic progression — what the clave cycle implies, what the strings or brass accent, emotional weight of the harmony.]
INSTRUMENTATION: [Every instrument named specifically — "upright bass" not "bass", "timbales" not "drums", "congas" if present, "violin section" not "strings", "muted trumpet" not "trumpet". NO kick, snare, hi-hat mentioned.]
VOCAL TONE: [If vocals: the register, Spanish or English language, emotional delivery, wordless humming if applicable. If none: "Instrumental."]
EMOTIONAL CHARACTER: [3–5 descriptors — romantic, sorrowful, dramatic, passionate, midnight-heavy.]
SAMPLE POTENTIAL: [The violin intro, the trumpet stab, the piano guajeo, the wordless vocal hum — what a producer would loop and pitch into something devastating.]
PRODUCER DNA: [What era and sensibility of producers would reach for this. Specific aesthetic — not artist names.]
FLIP DIRECTIONS:
A. [Specific loop/chop/pitch direction grounded in what you heard]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildLatinSoulPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers who dig deep in Latin soul. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a late 1960s New York Latin soul orchestral recording — the kind pressed on a small indie label for a Spanish-speaking audience, never crossed over to national distribution, played in bodegas and social clubs and eventually found its way into a producer's crate decades later. The kind of record where the string intro alone is enough to make a beat.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to late 1960s New York Latin soul regardless of what era the source analysis describes. Think the NYC indie Latin label scene — Fania, Cotique, Alegre — when Latin, soul, and jazz were criss-crossing in Spanish Harlem.

LATIN SOUL AESTHETIC DNA:

Dramatic orchestral Latin soul: cinematic string sections playing slow moody minor key melodies, the violins swelling and retreating like waves, the harmony weighted with romantic and dramatic feeling, a natural loop built into the string cycle.

New York barrio midnight feeling: the sound of a deserted Latin neighborhood at midnight — beautiful but heavy, romantic but sorrowful, the music of people who have been through something and carry it with grace.

Wordless female vocal texture: not singing lyrics, just a wordless hum floating above everything, reverb-soaked and melancholic, functioning as texture not performance — sits underneath samples without fighting a rapper.

Congas and timbales sparse: the Latin rhythmic identity without locking the tempo too rigidly, breathing space between the percussion hits.

BASE everything on the analysis below — translate into a late 1960s New York Latin soul recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully.
- ERA is ALWAYS late 1960s New York Latin soul. Be specific: "1969 Spanish Harlem Latin soul recording pressed on a small NYC indie label".
- BPM: choose one value between 74–86 BPM — state it explicitly
- Tonality: minor key — dramatic, romantic, sorrowful. The emotional weight of the barrio at midnight.
- MUST include dramatic string section and wordless female vocal hum as texture
- Include sparse conga or timbales for Latin rhythmic identity — described as sparse and breathing
- Muted brass phrase answering the strings from a distance adds depth
- Add obscurity context: "pressed on a small New York indie label for a Spanish-speaking audience", "never crossed over to national distribution"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat
- End exactly with: "the kind of orchestral Latin soul recording [descriptive aesthetic phrase — NO real names] would loop and transform into something devastating."

Structure:
[Late 1960s ERA, Spanish Harlem or NYC location] [LATIN SOUL RECORDING AESTHETIC] — [string section, wordless female vocal, and specific named instruments] — recorded at [74–86] BPM — [minor key and dramatic emotional description] — [featured string or brass moment] — analog tape warmth, vinyl surface noise — deeply cinematic, [1–2 emotional words] — [NYC indie label obscurity context] — designed to feel loopable — the kind of orchestral Latin soul recording [descriptive aesthetic phrase, NO real names] would loop and transform into something devastating.`.trim();
}
