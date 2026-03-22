export const GOSPEL_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Black American sacred music and gospel. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, recording quality, production style. Be specific.]
RECORDING AESTHETIC: [Evocative description — e.g. "Small church live recording", "Major gospel label studio session", "Street corner spiritual soul", "Chicago gospel ensemble".]
PRODUCTION TEXTURE: [Sonic character — organ warmth, choir room ambience, tape saturation, vinyl surface noise, mic placement intimacy. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "72–82". If no clear pulse, describe the feel.]
GROOVE: [Swung / straight / shuffled / free / call-and-response rhythm — how it breathes and moves.]
KEY + MODE: [e.g. "Bb minor", "F major with gospel extensions", "G Dorian". Include emotional and spiritual color.]
CHORD MOVEMENT: [Harmonic progression — what the chord cycle implies. Note gospel extensions, call-and-response cadences, emotional swells.]
INSTRUMENTATION: [Every instrument named specifically — "Hammond B3 organ" not "organ", "upright bass" not "bass", "piano" if clearly acoustic. Include choir texture if present. NO drums, kick, snare, hi-hat mentioned.]
VOCAL TONE: [Register, texture, delivery style — "full-throated contralto with gospel melisma", "raw unrestrained tenor", "three-part female harmony". Emotional quality and church influence.]
EMOTIONAL CHARACTER: [3–5 specific descriptors. What does it feel like — devotional, yearning, triumphant, mournful, ecstatic.]
SAMPLE POTENTIAL: [What would a soul or hip-hop producer gravitate toward. The organ break, the choir swell, the call-and-response moment that begs to be looped.]
PRODUCER DNA: [What era and sensibility of producers would reach for this. Be specific about aesthetic — not artist names.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/loop direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();

export function buildGospelPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers who build sacred sounds into hard-hitting beats. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a raw, authentic gospel or sacred soul recording from the late 1960s — the kind pressed in small quantities for a congregation, recorded live in a church or small studio, never meant for commercial distribution. The kind of sacred music that becomes transcendent when chopped, pitched up, and placed underneath something hard.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to late 1960s Black American gospel and sacred soul regardless of what era the source analysis describes. Think small church recordings, Chicago gospel ensembles, Southern spiritual groups, Black Baptist and Pentecostal choir sessions.

GOSPEL AESTHETIC DNA:

Small church live recordings: raw and unpolished, congregation sounds bleeding into microphones, imperfect intonation from amateur musicians who feel everything, the acoustic warmth of wooden pews and plaster walls, a single overhead microphone capturing the entire room.

Hammond B3 gospel sessions: the organ as the spiritual anchor, full-chord voicings with expression pedal swells, the B3 leading the congregation and the choir answering back, the bass pedals walking under the melody.

Call and response structure: the lead vocal making a statement and the choir answering, building in emotional intensity over 4-8 bar cycles, natural loop edit points built into the arrangement.

Choir harmony textures: voices stacking in thirds and fifths, the tenors pushing the emotion, the altos grounding it, moments of unison hitting like a hammer.

BASE everything on the analysis below — translate it into a late 1960s gospel or sacred soul recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully.
- ERA is ALWAYS late 1960s Black American gospel or sacred soul. Be specific: "1968 Chicago Black Baptist church live recording", "Late 1960s Southern spiritual ensemble session".
- BPM: choose one value between 70–86 BPM — state it explicitly
- Tonality: minor key or gospel major with emotional weight. Describe the spiritual color.
- MUST include Hammond B3 organ and choir vocal texture — these are the genre's signature elements
- Live church or small studio feel — real congregation energy, imperfect intonation, acoustic room character
- Include call-and-response structure — the built-in loop edit points
- Add context: "recorded live in a small church", "pressed for congregational use only", "never commercially distributed"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat, or any rhythmic element — use "hand claps buried in the mix" if needed
- End exactly with: "the kind of sacred recording [descriptive aesthetic phrase — NO real names] would chop, pitch up, and place underneath something hard to make it feel like church."

Structure:
[Late 1960s ERA and LOCATION] [GOSPEL RECORDING AESTHETIC] — [Hammond B3 organ and specific named instruments] — recorded at [70–86] BPM — [key and spiritual emotional color] — [featured vocal or organ moment] — live church feel, raw and unpolished — [emotional words] — [church/obscurity context] — designed to feel loopable — the kind of sacred recording [descriptive aesthetic phrase, NO real names] would chop, pitch up, and place underneath something hard to make it feel like church.`.trim();
}
