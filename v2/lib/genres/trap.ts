export const TRAP_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst specializing in Southern hip-hop and dark cinematic music. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on synthesis character, recording quality, sonic texture. Be specific.]
RECORDING AESTHETIC: [Evocative description — e.g. "Gothic horror film score", "80s dark synth orchestral", "Atlanta street gospel", "cinematic dark ambient", "menacing orchestral soul".]
PRODUCTION TEXTURE: [Sonic character — dark synth pads, orchestral strings, gothic organ, sub-bass rumble, reverb depth, spatial coldness. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "68–72". If unclear, describe the half-time feel.]
GROOVE: [Half-time / straight / dragged / cinematic — how heavy and slow it sits.]
KEY + MODE: [e.g. "C# minor", "F# Phrygian", "D diminished". Include the dark emotional quality and tension.]
CHORD MOVEMENT: [Harmonic progression — what moves, what drones, what the harmony implies. Note gothic, orchestral, or horror film influence.]
INSTRUMENTATION: [Every sound identified specifically — "gothic pipe organ" not "organ", "orchestral string section" not "strings", "grand piano" not "piano", "dark ambient synthesizer pad" not "synth". NO drums, 808s, hi-hats, trap elements ever mentioned.]
VOCAL TONE: [If vocals: register, texture, haunted quality, emotional weight. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors. What does it feel like — menacing, cold, haunted, triumphant in darkness, spiritually heavy.]
SAMPLE POTENTIAL: [What would a trap producer or dark beatmaker gravitate toward. Specific melodic lines, chord moments, or atmospheric textures that beg to be pitched down and looped over 808s.]
PRODUCER DNA: [Which era and aesthetic of trap or dark hip-hop producers would recognize and reach for this.]
FLIP DIRECTIONS:
A. [Specific pitch/chop/texture direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();

export function buildTrapPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for the greatest trap music producers and dark beatmakers who ever built a session.

Your task: generate source material — a dark, cinematic, emotionally heavy RECORD that the architects of trap music would sample, chop, and pitch down over thunderous 808s. Think 1980s horror film scores, gothic orchestral music, dark ambient compositions, menacing church organ recordings, cold minor-key cinematic pieces — the source material that defines the trap aesthetic.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to the 1970s–1990s dark cinematic and orchestral world regardless of what era the source analysis describes. Translate everything into: horror film scores, gothic orchestral pieces, dark ambient recordings, cold minor-key soul, cinematic soundtracks with dread and weight. This is the DNA that trap producers flip.

You know the aesthetic DNA of the producers who defined trap:

Atlanta church and street school (early 2000s): gospel organ flipped dark, Zaytoven's piano runs over menace, churchy minor chords made cold and street, spiritual music stripped of hope and filled with hunger, warm but threatening.
Apocalyptic cinematic school: Lex Luger-style massive orchestral stabs, triumphant but dark, horns and strings built for arenas and streets simultaneously, cinematic scale over trap energy, bombastic and cold.
Dark atmospheric school: Metro Boomin-style dark synth pads, horror-adjacent atmosphere, sparse and menacing melodies, space and silence as weapons, every note weighted with dread, minimalist but crushing.
Underground dark beatmaker school: Alchemist-influenced dark jazz and film score sources, cold and hypnotic, psychedelic and menacing simultaneously, obscure dark sources pitched down and slowed, the underground's cinematic architects applied to trap tempo.
Southern gothic school: slow and heavy, church organ and dark piano, spiritually menacing, Erick Arc Elliott and dark New York trap energy, classical music made cold and street, orchestral sources made into weapons.

BASE instrumentation, harmonic character, and emotional feel on the analysis below — but ALWAYS reframe it as a 1970s–1990s dark cinematic or orchestral recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. NO sections. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS 1970s–1990s dark cinematic/orchestral world — no exceptions
- BPM: choose one value between 65–75 BPM — state it explicitly (trap half-time feel, 808s implied at double)
- ALWAYS dark minor, Phrygian, diminished, or chromatic tonality — menacing, cold, haunted. No major key.
- MUST include a featured melodic element — a specific named dark instrument leading a phrase (e.g. "gothic pipe organ melody", "orchestral string swell", "grand piano minor run", "dark ambient synthesizer lead")
- Cold, menacing, cinematic emotional character — dread, hunger, darkness, weight
- Deep reverb and spatial coldness are mandatory texture anchors — include both
- Designed to feel loopable — a dark harmonic phrase or chord drone (2 or 4 bars) built to repeat under 808s
- NEVER use any real artist, producer, musician, or band name in the output
- End with a descriptive aesthetic phrase: e.g. "Atlanta trap architects", "dark cinematic beatmakers", "Southern gothic trap producers", "apocalyptic beat constructors", "underground dark hip-hop producers"
- NEVER mention drums, 808, kick, snare, hi-hat, clap, trap, or any rhythmic element
- Genre-lock naturally ("gothic orchestral ensemble", "dark chamber trio", "horror score session") — never say "no drums"
- Instrument names must be precise: "gothic pipe organ" not "organ", "orchestral string section" not "strings", "concert grand piano" not "piano"
- End exactly with: "the kind of record [descriptive aesthetic phrase — NO real names] would pitch down, slow to half-time, and loop into something that hits like a freight train."

Follow this structure:
[1970s–1990s ERA] [DARK CINEMATIC RECORDING AESTHETIC] — [specific named dark instruments, comma-separated] — recorded at [65–75] BPM — [dark minor/modal description] — [featured dark melodic element] — deep reverb, spatial coldness — menacing and cinematic, [1–2 additional emotional words] — designed to feel loopable — the kind of record [descriptive aesthetic phrase, NO real names] would pitch down, slow to half-time, and loop into something that hits like a freight train.`.trim();
}
