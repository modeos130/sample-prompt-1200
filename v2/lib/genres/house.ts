export const HOUSE_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst specializing in dance music and electronic soul. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, synthesis character, recording quality. Be specific.]
RECORDING AESTHETIC: [Evocative description — e.g. "Chicago warehouse deep house", "late 70s Philly disco session", "gospel-soaked soulful house", "Detroit spiritual techno", "NYC underground garage".]
PRODUCTION TEXTURE: [Sonic character — analog synth warmth, drum machine grit, vinyl crackle, tape saturation, reverb depth, room size. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "122–126". If unclear, describe the pulse feel.]
GROOVE: [Four-on-the-floor / swung / straight / shuffled — how it breathes and locks.]
KEY + MODE: [e.g. "F minor", "Bb minor 7", "Eb Dorian". Include emotional color and tension.]
CHORD MOVEMENT: [Harmonic progression — what moves, what cycles, what the chords imply emotionally. Note any gospel, jazz, or soul influence.]
INSTRUMENTATION: [Every sound identified specifically — "Roland Juno-106 pad" not "synth pad", "Fender Rhodes electric piano" not "piano", "upright bass" not "bass", "Hammond B3 organ" not "organ". NO kick, snare, hi-hats, drum machines ever mentioned.]
VOCAL TONE: [If vocals: register, texture, gospel influence, emotional delivery. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors. What does it feel like on the floor and in the soul simultaneously.]
SAMPLE POTENTIAL: [What would a house or deep house producer gravitate toward. Specific chord stabs, melodic runs, or harmonic moments that beg to be looped.]
PRODUCER DNA: [Which era and aesthetic of house producers would recognize and reach for this.]
FLIP DIRECTIONS:
A. [Specific loop/layer/chop direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();

export function buildHousePrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for the greatest house music producers and DJs who ever touched a mixer.

Your task: generate source material — a soulful, deeply musical RECORD from the late 1970s through the 1980s that the architects of house music would have sampled, looped, or been spiritually influenced by. Think Philly soul, Chicago gospel, deep disco, spiritual jazz, and early electronic soul — the records that built the house music canon.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to the late 1970s–1980s sonic world regardless of what era the source analysis describes. Translate everything into the world of: Philly International soul, Chicago gospel, deep soulful disco, Paradise Garage and Warehouse-era selections, spiritual jazz with an electronic edge, early synthesizer soul. This is the DNA of house music.

You know the aesthetic DNA of the producers who defined house:

Chicago warehouse originators (mid-80s): deep hypnotic grooves, soulful gospel-adjacent chord progressions, raw Roland drum machine energy, church organ textures, the spiritual and the physical simultaneously, warm and dusty, built for 4am.
Deep house architects: lush jazz-influenced chord voicings, minor 7ths and 9ths, Rhodes and Juno pads layered together, upright bass or deep synth bass, emotionally sophisticated and warm, recorded with intention and soul.
New York underground garage school: gospel-drenched vocals over deep soulful chords, Paradise Garage energy, Larry Levan's spiritual approach, disco roots showing through, sophisticated harmonic movement, made you feel something beyond the body.
Soulful house generation (late 80s–90s): warm analog synthesis, vocal chops, deep chord stabs, Kerri Chandler-style basement warmth, Masters At Work sophistication, jazz and soul influence running deep, made for both the dance floor and the living room at 2am.
Detroit spiritual school: more minimal and introspective, haunting melodic synth lines, jazz-influenced, cosmic and searching, the emotional weight of the city in every chord.

BASE instrumentation, harmonic character, and emotional feel on the analysis below — but ALWAYS reframe it as a late 1970s–1980s soulful dance record.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. NO sections. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS late 1970s–1980s — no exceptions
- BPM: choose one value between 118–128 BPM — state it explicitly (this is the sacred house tempo range)
- ALWAYS minor or minor 7th / modal tonality — soulful, searching, spiritually weighted
- MUST include a featured melodic element — a specific named instrument leading a hook or run (e.g. "Fender Rhodes chord stabs", "Hammond B3 organ run", "Juno-106 pad swell", "gospel-inflected piano melody")
- Warm and soulful emotional character — uplifting but weighted, spiritual and physical simultaneously
- Analog warmth and room reverb are mandatory texture anchors — include both
- Designed to feel loopable — a chord cycle or melodic phrase (4 or 8 bars) built to repeat and evolve
- NEVER use any real artist, producer, musician, or band name in the output
- End with a descriptive aesthetic phrase: e.g. "Chicago warehouse deep house architects", "New York underground garage selectors", "soulful house producers from the basement era", "spiritual dance floor constructors"
- NEVER mention drums, kick, snare, hi-hat, clap, drum machine, TR-909, TR-808, or any rhythmic element
- Genre-lock naturally ("gospel trio", "soul quartet", "jazz ensemble") — never say "no drums"
- Instrument names must be precise: "Fender Rhodes electric piano" not "piano", "Roland Juno-106" not "synth", "Hammond B3 organ" not "organ", "upright bass" not "bass"
- End exactly with: "the kind of record [descriptive aesthetic phrase — NO real names] would drop at 4am and make the room levitate."

Follow this structure:
[Late 1970s or 1980s ERA] [RECORDING AESTHETIC] — [specific named instruments, comma-separated] — recorded at [118–128] BPM — [minor/modal description] — [featured melodic element] — analog warmth, room reverb — soulful and searching, [1–2 additional emotional words] — designed to feel loopable — the kind of record [descriptive aesthetic phrase, NO real names] would drop at 4am and make the room levitate.`.trim();
}
