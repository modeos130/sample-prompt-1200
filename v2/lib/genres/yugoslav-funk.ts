export const YUGOSLAV_FUNK_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Yugoslav rock, progressive jazz-rock, and funk recordings of the 1970s and 1980s from the former Yugoslavia. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, recording quality, Yugoslav production characteristics. Be specific — e.g. "mid-1970s Jugoton pressing" or "early 1980s Belgrade studio session".]
RECORDING AESTHETIC: [Evocative description — e.g. "Belgrade jazz-rock ensemble session", "Zagreb prog-funk studio recording", "Ljubljana psychedelic rock session", "Sarajevo soul-funk ensemble", "Yugoslav film score cue from a domestic production".]
PRODUCTION TEXTURE: [Sonic character — Yugoslav state-adjacent studio sound: better high-frequency response than Soviet recordings but still distinctly Eastern European. Jugoton or PGP RTB vinyl pressing character. Analog tape with a slightly raw, energetic room sound. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "86–96". If no clear pulse, describe the rhythmic feel.]
GROOVE: [Jazz-rock fusion / psychedelic funk / Balkan-inflected groove / prog odd-meter — how it moves. Note the unique Yugoslav blend of Western rock energy and Balkan rhythmic sensibility.]
KEY + MODE: [e.g. "E Phrygian dominant", "A harmonic minor", "D Dorian with Balkan chromatic inflection". Include emotional character — Yugoslav musicians drew from Balkan folk scales alongside Western jazz harmony.]
CHORD MOVEMENT: [Harmonic progression — what cycles, what creates tension, the collision of prog-rock ambition and Balkan folk harmony.]
INSTRUMENTATION: [Every instrument named specifically — "Fender Rhodes electric piano", "Hammond organ", "wah-wah electric guitar", "overdriven electric bass", "alto saxophone", "flute", "analog synthesizer", "accordion" if present. Yugoslav bands had better access to Western instruments than Soviet musicians. NO drums, kick, snare, hi-hat mentioned.]
VOCAL TONE: [If vocals: register, Serbo-Croatian or Slovenian language, the Yugoslav rock vocal style — rawer and more rock-oriented than Soviet estrada. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 descriptors — raw, searching, psychedelic, urgent, Balkan melancholy, progressive ambition.]
SAMPLE POTENTIAL: [The Rhodes riff, the wah-wah guitar figure, the bass line, the horn break, the Balkan-inflected melodic phrase — what a producer would loop. The collision of Western prog-rock ambition and Balkan folk soul is the gold.]
PRODUCER DNA: [What era and sensibility of producers would reach for this. Untouched Yugoslav vinyl — not artist names, but aesthetic description.]
FLIP DIRECTIONS:
A. [Specific loop/chop/pitch direction grounded in what you heard]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildYugoslavFunkPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers who dig deep for untouched Eastern European recordings. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a mid-1970s Yugoslav jazz-rock-funk recording — the kind made by a Belgrade or Zagreb ensemble that had one foot in Western prog-rock and the other in Balkan folk tradition, pressed on Jugoton or PGP RTB vinyl, distributed across Yugoslavia and the Eastern Bloc but almost never exported West. The raw energy of rock musicians with conservatory chops and Balkan rhythmic DNA — that fusion is what makes Yugoslav recordings one of the most overlooked sample goldmines in existence.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to mid-1970s Yugoslav jazz-rock-funk regardless of what era the source analysis describes. Think Belgrade and Zagreb studio ensembles blending progressive rock, jazz fusion, psychedelic funk, and Balkan folk elements on domestic Yugoslav labels.

YUGOSLAV FUNK / PROG / ROCK AESTHETIC DNA:

Western rock energy meets Balkan soul: Yugoslav musicians had significantly more access to Western records and instruments than their Soviet counterparts. They absorbed progressive rock, jazz-rock fusion, psychedelic funk, and fed it through a distinctly Balkan musical sensibility — odd meters felt natural, minor modes carried a specific Balkan melancholy, and the energy was rawer and more rock-driven than Soviet jazz-funk.

Yugoslav studio sound: better high-frequency response and more dynamic range than Soviet recordings, but still distinctly Eastern European — a slightly raw, energetic room sound with analog warmth. Studios in Belgrade, Zagreb, and Ljubljana had a mix of Western and domestic equipment. The recordings have a characteristic live-in-the-room energy.

Jugoton and PGP RTB pressing character: Yugoslav vinyl pressings were higher quality than Soviet Melodiya but still carried a distinctive Eastern European pressing texture — slightly grainier than Western European pressings, with a warm mid-range presence. Pressings of 1000 to 5000 copies, distributed domestically and occasionally across the Eastern Bloc.

Balkan-inflected harmony and rhythm: the unique Yugoslav contribution — Phrygian dominant scales, harmonic minor with chromatic passing tones borrowed from Romani and Macedonian folk music, asymmetric meters that feel completely natural, and a rhythmic intensity that Western prog bands could only approximate. Minor keys with a specific bittersweet quality unique to Balkan musical tradition.

Instrumentation signatures: Fender Rhodes and Hammond organ (genuine Western imports more common than in USSR), wah-wah electric guitar with aggressive attack, overdriven electric bass playing melodic lines, alto saxophone and flute for jazz-fusion color, occasional analog synthesizer, and sometimes acoustic instruments like accordion or tamburica bridging the folk-rock divide.

BASE everything on the analysis below — translate into a mid-1970s Yugoslav jazz-rock-funk recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully.
- ERA is ALWAYS mid-1970s Yugoslav. Be specific: "1976 Belgrade studio jazz-funk session pressed on PGP RTB", "Mid-1970s Zagreb progressive funk ensemble recording on Jugoton".
- BPM: choose one value between 82–100 BPM — state it explicitly
- Tonality: Phrygian dominant, harmonic minor, Dorian with Balkan chromatic inflection — raw, searching, bittersweet. No bright major.
- MUST include a specific melodic lead — "wah-wah electric guitar tracing a Phrygian dominant melody", "alto saxophone break over the modal changes", "Fender Rhodes solo with a Balkan harmonic color"
- MUST include overdriven electric bass or deep electric bass as the groove anchor
- Yugoslav studio sound — raw room energy, analog tape warmth, slightly gritty Eastern European vinyl texture
- Add obscurity context: "pressed on Jugoton in a run of 2000 copies for Yugoslav domestic distribution", "never exported outside the Eastern Bloc", "recorded at a Belgrade state-adjacent studio and distributed only through Yugoslav retail channels"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat
- End exactly with: "the kind of untouched Yugoslav recording virtually unknown outside the Balkans that a serious digger would flip into something raw and devastating."

Structure:
[Mid-1970s ERA, Belgrade or Zagreb or Ljubljana location] [YUGOSLAV JAZZ-ROCK-FUNK RECORDING AESTHETIC] — [specific named instruments with Yugoslav/Balkan character] — recorded at [82–100] BPM — [Phrygian dominant/harmonic minor/Balkan modal description with emotional color] — [featured melodic solo moment] — raw Yugoslav studio sound, analog tape warmth, Eastern European vinyl texture — searching and bittersweet, [1–2 additional emotional words] — [Jugoton or PGP RTB pressing obscurity context] — designed to feel loopable — the kind of untouched Yugoslav recording virtually unknown outside the Balkans that a serious digger would flip into something raw and devastating.`.trim();
}
