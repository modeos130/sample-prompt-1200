export const ALGERIAN_RAI_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in North African popular music, particularly Algerian raï from the pre-commercial electric era of the 1970s and early 1980s. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, recording quality, North African style markers. Be specific — "Early 1980s Oran electric raï" or "Late 1970s transitional raï".]
RECORDING AESTHETIC: [Evocative description — e.g. "Cheap Oran studio session with overdriven cassette bounce", "Small Algerian label pressing with analog warmth", "Raw electric raï recorded in a back-room studio in Oran's Médina".]
PRODUCTION TEXTURE: [Sonic character — cassette saturation, analog tape hiss, lo-fi room bleed, distorted amplifier warmth, cheap reverb unit, mono or narrow stereo. What does it physically feel like?]
BPM: [Tight 2-number range. If unclear, describe the rhythmic pulse and whether it has a chaâbi swing or a straighter feel.]
GROOVE: [Chaâbi-derived swing / straight desert pulse / galloping raï rhythm / rubato vocal passage — how it breathes and locks.]
KEY + MODE: [e.g. "D Hijaz (Phrygian dominant)", "Bb Bayati", "G double harmonic minor". Include the North African modal character and emotional color — the maqam or equivalent scale system.]
CHORD MOVEMENT: [Harmonic cycle — what the melodic instruments imply harmonically, the repetitive hypnotic nature of the modal cycle, emotional weight.]
INSTRUMENTATION: [Every instrument named specifically — "gasba bamboo flute" not "flute", "guellal frame drum" not "drums", "cheap Casio keyboard" or "Farfisa organ" not "keys", "mandole" not "guitar", "electric guitar with spring reverb" not "guitar", "darbuka" not "percussion", "oud" if present. Precise North African instrument names.]
VOCAL TONE: [If vocals: the raï vocal style — gritty, melismatic, the raw emotional delivery, Arabic dialect, call-and-response if applicable. If none: "Instrumental."]
EMOTIONAL CHARACTER: [3–5 descriptors — yearning, defiant, hypnotic, desert-heavy, nocturnal, rebellious.]
SAMPLE POTENTIAL: [The gasba flute loop, the Casio keyboard riff, the vocal melisma, the guellal pattern — what a producer would isolate, pitch, and loop into something that hits different from anything in the usual crate.]
PRODUCER DNA: [What era and sensibility of producers would recognize this as untouched gold. Specific aesthetic — not artist names.]
FLIP DIRECTIONS:
A. [Specific loop/chop/pitch direction grounded in what you heard]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildAlgerianRaiPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers hunting sounds that NO ONE has touched. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a raw, electric Algerian raï recording from the late 1970s or early 1980s — the pre-commercial era when raï was still underground street music in Oran, Algeria. Before the genre went mainstream and polished. These are the recordings pressed on cheap vinyl or distributed on cassette tapes through market stalls in the Médina — never exported, never heard outside North Africa, completely virgin sample territory.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to late 1970s or early 1980s Oran, Algeria regardless of what era the source analysis describes. This is the transitional moment when traditional raï instruments — gasba bamboo flute, guellal frame drum — collided with cheap electric keyboards, distorted electric guitars, and lo-fi studio recording. The raw, unpolished sound before major labels cleaned it up.

ALGERIAN RAÏ AESTHETIC DNA:

Gasba bamboo flute as melodic anchor: the breathy, overblown sound of the North African bamboo flute — haunting, slightly sharp, with natural overtones and microtonal bends that Western instruments cannot replicate. This is the melodic hook that stops a producer cold.

North African modal scales: Hijaz (Phrygian dominant), Bayati, double harmonic minor — the augmented seconds and flattened intervals that give the music its unmistakable desert-and-Mediterranean character. Not Western minor — distinctly North African.

Cheap electric keyboard textures: early Casio or Farfisa organ tones layered over traditional instruments — the collision of modernity and tradition that defined early electric raï. The keyboard sounds thin, buzzy, slightly out of tune with the acoustic instruments.

Lo-fi Oran studio aesthetic: cassette-saturated, narrow stereo or mono, room bleed from small concrete studios, overdriven vocals hitting cheap microphones, spring reverb on everything. The sound of music recorded fast and cheap for immediate street distribution.

Guellal frame drum and darbuka: the rhythmic pulse beneath everything — not kit drums, traditional North African hand percussion with a galloping, swinging feel that is impossible to program convincingly.

BASE everything on the analysis below — translate into a late 1970s or early 1980s Oran, Algeria raï recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully.
- ERA is ALWAYS late 1970s or early 1980s Oran, Algeria. Be specific: "1979 electric raï recording from a small studio in Oran's Médina", "Early 1980s Algerian raï pressed on a cheap local label in Oran".
- BPM: choose one value between 88–110 BPM — state it explicitly
- Tonality: Hijaz, Bayati, double harmonic minor, or Phrygian dominant — the augmented seconds and flattened intervals of North African maqam. ALWAYS name the specific scale and its emotional color.
- MUST include gasba bamboo flute as a featured melodic instrument — breathy, microtonal, haunting
- Include cheap electric keyboard (Casio or Farfisa) as textural contrast to the traditional instruments
- Lo-fi cassette-saturated recording aesthetic — mono or narrow stereo, room bleed, spring reverb
- Add obscurity context: "distributed on cassette through market stalls in Oran", "never exported outside Algeria", "pressed on a cheap local label for the Médina street trade"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat — use "guellal frame drum" or "darbuka" for rhythmic identity
- End exactly with: "the kind of raw North African recording [descriptive aesthetic phrase — NO real names] would discover in a market stall overseas and flip into something the world has never heard."

Structure:
[Late 1970s or early 1980s ERA, Oran Algeria location] [RAÏ RECORDING AESTHETIC] — [gasba flute, cheap keyboard, specific named instruments] — recorded at [88–110] BPM — [Hijaz/Bayati/North African modal description with emotional color] — [featured gasba flute melodic moment] — cassette-saturated, lo-fi room bleed, spring reverb — hypnotic and yearning, [1–2 emotional words] — [Oran market distribution obscurity context] — designed to feel loopable — the kind of raw North African recording [descriptive aesthetic phrase, NO real names] would discover in a market stall overseas and flip into something the world has never heard.`.trim();
}
