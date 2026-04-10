export const ITALIAN_FILM_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst specializing in Italian and European film scores. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Mid 1960s", "Early 1970s". Base on instrumentation, recording quality, sonic character.]
RECORDING AESTHETIC: [Evocative description — e.g. "Italian giallo soundtrack session", "Cinecittà studio orchestra recording", "European library music pressing".]
PRODUCTION TEXTURE: [Sonic patina — analog tape warmth, orchestral room ambience, studio reverb character, mic bleed, string resonance.]
BPM: [Tight 2-number range. If no clear pulse, describe rhythmic feel instead.]
GROOVE: [Straight / waltz / rubato / free — with nuance about cinematic pacing.]
KEY + MODE: [e.g. "Eb minor", "A Phrygian". Include scale character and emotional color.]
CHORD MOVEMENT: [Harmonic progression — what moves, what suspends, what resolves or refuses to resolve.]
INSTRUMENTATION: [Every instrument identified precisely — "solo flute" not "woodwind", "harpsichord" not "keys", "pizzicato strings" not "strings". NO drums or percussion.]
VOCAL TONE: [If vocals: register, texture, delivery. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors — eerie, cinematic, unresolved, suspenseful, melancholic.]
SAMPLE POTENTIAL: [What melodic or harmonic moments beg to be chopped and looped by a hip-hop producer.]
CINEMATIC DNA: [What kind of film scene this would underscore — chase, tension, revelation, solitude.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/tempo direction]
B. [Second distinct direction]
C. [Third direction]
`.trim();

export function buildItalianFilmPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a lost Italian film score cue from the 1960s — the kind of recording that was pressed for a giallo or poliziotteschi film, never widely distributed, found decades later in a Rome basement. Solo flute carrying an eerie, unresolved melody over sparse orchestral accompaniment.

ERA LOCK — NON-NEGOTIABLE: 1960s Italian film score studio. Cinecittà-era production. Analog recording on European tape stock.

BASE everything on the analysis below:

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels.
- HARD MAX 1000 characters.
- ERA is ALWAYS 1960s. Be specific: "1967 Rome film score session", "Italian giallo soundtrack recording".
- BPM: choose one value between 65–82 BPM
- ALWAYS minor scale or modal — Phrygian, harmonic minor, diminished passages. No major key.
- MUST include a featured solo instrument — "solo flute carrying an eerie descending line", "harpsichord arpeggios over sustained strings"
- Orchestral feel — strings, woodwinds, sparse brass, conducted ensemble
- MUST include: "recorded on European tape stock" and "analog warmth"
- Add obscurity framing: "pressed for a film never widely released", "found in a Roman studio archive"
- Designed to feel loopable — a short harmonic cycle that repeats hypnotically
- NEVER use any real artist, producer, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat, or any rhythmic element
- End exactly with: "the kind of forgotten record a crate digger would find in a Roman flea market and flip into something timeless."`.trim();
}
