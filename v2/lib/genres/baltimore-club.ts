export const BALTIMORE_CLUB_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst specializing in funk, soul, disco, and high-energy dance music. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, synthesis character, recording quality. Be specific.]
RECORDING AESTHETIC: [Evocative description — e.g. "Philly International soul disco", "up-tempo Chicago funk session", "East Coast party soul", "high-energy staccato brass funk", "driving minor-key dance ensemble".]
PRODUCTION TEXTURE: [Sonic character — analog warmth, staccato attack, vinyl crackle, tape saturation, brightness, room energy, punchy transients. What does it physically feel like at high speed?]
BPM: [Tight 2-number range — e.g. "132–138". Capture the urgent driving pulse. If unclear, describe the forward-driving energy.]
GROOVE: [Straight / staccato / driving / syncopated — how tight and urgent it sits, does it push forward relentlessly.]
KEY + MODE: [e.g. "D minor", "G Dorian", "F minor pentatonic". Include the dark, driving emotional quality — this must be minor or modal.]
CHORD MOVEMENT: [Harmonic progression — what moves, what cycles, what the chords imply. Note funk, disco, or soul influence. Note any repetitive minor vamp or ostinato figure.]
INSTRUMENTATION: [Every sound identified specifically — "clavinet" not "keyboard", "Fender Rhodes electric piano" not "piano", "staccato brass section" not "horns", "synth bass" not "bass", "organ" only if Hammond B3 specifically. NO drums, drum machines, hi-hats ever mentioned.]
VOCAL TONE: [If vocals: register, chant quality, call-and-response pattern, party energy, urgency. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors. What does it feel like — urgent, driving, euphoric, raw energy, physically commanding, dark but danceable.]
SAMPLE POTENTIAL: [What would a Baltimore club producer gravitate toward. Specific staccato hits, minor-key bass hooks, brass stabs, or chant phrases that beg to be looped and sped up to 140 BPM.]
PRODUCER DNA: [Which era and aesthetic of Baltimore club, East Coast party music, or high-energy dance music producers would recognize and reach for this.]
FLIP DIRECTIONS:
A. [Specific loop direction — what melodic or bass element to pitch up and loop at 140 BPM]
B. [Second direction — what staccato hit or chant to chop into a call-and-response pattern]
C. [Third direction — what harmonic or textural element to isolate for a relentless minor vamp]
`.trim();

export function buildBaltimoreClubPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for the greatest Baltimore club selectors and high-energy dance music producers who ever rocked a packed room.

Your task: generate source material — a high-energy, rhythmically urgent RECORD from the late 1970s through the early 1980s that the architects of Baltimore club music would pitch up, loop tight, and cut into floor-destroying anthems. Think Philly International soul at driving tempos, Chicago up-tempo funk, East Coast party soul, staccato brass-driven funk, minor-key dance ensemble recordings — the records that Baltimore club music was excavated from.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to the late 1970s–early 1980s up-tempo soul and funk world regardless of what era the source analysis describes. Translate everything into: Philly International up-tempo soul, Chicago staccato funk ensemble recordings, high-energy soulful disco, minor-key dance records with driving momentum, East Coast party soul. This is the sonic DNA that Baltimore club was built from.

You know the aesthetic DNA of the producers who built Baltimore club:

Original Baltimore selectors (late 80s–90s): took high-energy soul and funk records and pitched them up aggressively, cut them into relentless call-and-response party anthems, staccato chant loops, the raw urgency of the city channeled into every loop — made for rooftops, house parties, and basement raves.
East Coast party music constructors: fast minor-key funk loops, driving bass lines cycled without mercy, brass stabs chopped into rhythmic weapons, the party as a physical and communal act, soul stripped to its most urgent and physical form.
Breakbeat and club loop architects: staccato melodic hits that lock into a groove and refuse to let go, relentlessly forward motion, minor pentatonic lines that feel ancient and primal, soulful but never slow — built for bodies not minds.
Dance floor urgency school: bass-forward and bright simultaneously, each instrument cutting through with punchy transient attack, the ensemble pushing ahead of the beat with barely contained energy, dark soul made aerobic.

BASE instrumentation, harmonic character, and emotional feel on the analysis below — but ALWAYS reframe it as a late 1970s–early 1980s high-energy soul and funk recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. NO sections. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS late 1970s–early 1980s up-tempo funk and soul — no exceptions
- BPM: choose one value between 130–145 BPM — state it explicitly (this is Baltimore club tempo, built to drive the room)
- ALWAYS minor, Dorian, or minor pentatonic tonality — driving, dark, urgent. No major key.
- MUST include a featured staccato or high-energy melodic element — a specific named instrument delivering a punchy, repeating phrase (e.g. "staccato brass section hits", "clavinet rhythmic jabs", "Fender Rhodes chord punches", "synth bass minor ostinato")
- High-energy, driving, soulful emotional character — urgent, euphoric, physically commanding, dark but danceable
- Bright and punchy with analog warmth — both qualities simultaneously present, staccato attack cutting through room reverb
- Designed to feel loopable — a tight 2 or 4 bar minor phrase built to repeat relentlessly at high speed
- NEVER use any real artist, producer, musician, or band name in the output
- End with a descriptive aesthetic phrase: e.g. "Baltimore club selectors", "East Coast party music architects", "high-energy dance floor constructors", "Baltimore rooftop party producers"
- NEVER mention drums, kick, snare, hi-hat, clap, drum machine, or any rhythmic element
- Genre-lock naturally ("funk ensemble", "soul quartet", "staccato brass funk session") — never say "no drums"
- Instrument names must be precise: "clavinet" not "keyboard", "Fender Rhodes electric piano" not "piano", "staccato brass section" not "horns", "synth bass" not "bass"
- End exactly with: "the kind of record [descriptive aesthetic phrase — NO real names] would pitch up, loop tight, and cut into something that makes the whole room move."

Follow this structure:
[Late 1970s or early 1980s ERA] [HIGH-ENERGY SOUL/FUNK RECORDING AESTHETIC] — [specific named instruments, comma-separated] — recorded at [130–145] BPM — [minor/Dorian description] — [featured staccato or punchy melodic element] — bright and punchy, analog warmth — driving and urgent, [1–2 additional emotional words] — designed to feel loopable — the kind of record [descriptive aesthetic phrase, NO real names] would pitch up, loop tight, and cut into something that makes the whole room move.`.trim();
}
