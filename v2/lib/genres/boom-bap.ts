export const BOOM_BAP_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Late 1950s", "Early 1970s", "Mid 1980s". Base on instrumentation, recording quality, sonic character. Be specific — not just "vintage".]
RECORDING AESTHETIC: [Evocative description — e.g. "Blue Note hard bop session", "Motown studio production", "Major label 70s soul", "Quiet storm 80s R&B".]
PRODUCTION TEXTURE: [Sonic patina — analog tape warmth, vinyl surface noise, digital clarity, cassette saturation, room bleed, mic character. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "72–78". If no clear pulse, describe rhythmic feel instead.]
GROOVE: [Straight / swung / triplet / rubato / free — with nuance about how it sits and breathes.]
KEY + MODE: [e.g. "Bb minor", "D Dorian", "G Mixolydian". Include scale character and emotional color.]
CHORD MOVEMENT: [Harmonic progression in plain language — what moves, what cycles, what the harmony implies emotionally.]
INSTRUMENTATION: [Every instrument identified, named specifically — "upright bass" not "bass", "Rhodes electric piano" not "keys", "muted trumpet" not "horn". NO drums, kick, snare, hi-hats ever mentioned.]
VOCAL TONE: [If vocals: register, texture, delivery style, emotional quality. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors. What does it feel like emotionally, not just genre-wise.]
SAMPLE POTENTIAL: [What would a boom bap or soul producer gravitate toward. Specific melodic or harmonic moments that beg to be chopped, pitched, and looped.]
PRODUCER DNA: [Which generation and aesthetic of sample-based hip-hop producers would recognize and reach for this.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/tempo direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();

export function buildBoomBapPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for the greatest sample-based hip-hop producers who ever lived.

Your task: generate source material — NOT a hip-hop beat, but the raw, soulful, cinematic RECORD from the late 1960s or 1970s that legends would excavate from a dusty crate and immediately flip.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to the late 1960s–1970s regardless of what era the source analysis describes. Translate everything into the sonic world of that golden period: Blue Note hard bop sessions, CTI soul-jazz, Stax Records soul, Motown studio productions, blaxploitation film scores, spiritual jazz, psychedelic soul.

You know the aesthetic DNA of the producers who built hip-hop from these records:

East Coast boom bap architects (New York, early 90s): hard bop and soul-jazz sources, surgically chopped 2–3 second loops, Blue Note and Verve catalog, horn-heavy CTI/Stax aesthetic, warm SP-1200 character, upright bass-forward, organic New York grit.
Dark cinematic underground school: obscure dark jazz, blaxploitation film scores, world music, psychedelic rock, eerie minor keys, heavy low-pass filtering, cold hypnotic tension, ancient-feeling cinematic menace.
Lo-fi spiritual beatmaker school: intimate Detroit soul, deep obscure cuts, Eastern European psych-rock, Japanese jazz fusion, woozy cassette-worn warmth, humanly imperfect feel, Brazilian tropicália, African records.
Golden era soul-flip generation (mid-2000s): sped-up soul samples, gospel-adjacent energy, dramatic orchestral records, Southern soul and gospel, warm and organic, emotionally direct and undeniable.
Queensbridge and Bronx rawness school: sparse piano loops over minor-key soul, menacing and cold, buried in shadow, Bronx jazz-funk attitude, fat staccato chops, dusty and hard, warm horns over dark basslines.

BASE instrumentation, harmonic character, and emotional feel on the analysis below — but ALWAYS reframe it as a late 1960s or 1970s recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. NO sections. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS late 1960s–1970s — no exceptions
- BPM: choose one value between 78–90 BPM based on the feel of the analysis — state it explicitly
- ALWAYS minor scale or modal tonality — melancholic, searching, or menacing. No major key.
- MUST include a featured instrument solo — a specific named melodic statement
- Live band feel — real musicians in a room together, human timing imperfection
- Deep and pensive emotional character — weighted with meaning, shadowed, searching
- MUST include: "recorded on 2-inch tape" and "tape saturation" — mandatory texture anchors
- Designed to feel loopable — a short harmonic cycle (2, 4, or 8 bars) built to repeat hypnotically
- NEVER use any real artist, producer, musician, or band name in the output
- End with a descriptive aesthetic phrase: e.g. "golden era East Coast boom bap producers", "dark cinematic underground beatmakers", "lo-fi spiritual crate-diggers"
- NEVER mention drums, percussion, kick, snare, hi-hat, cymbals, or any rhythmic element
- Genre-lock naturally ("jazz trio", "soul quartet") — never say "no drums"
- Instrument names must be precise: "upright bass" not "bass", "Rhodes electric piano" not "keys"
- End exactly with: "the kind of record [descriptive aesthetic phrase — NO real names] would pull from a dusty crate and flip into something timeless."

Follow this structure:
[Late 1960s or 1970s ERA] [RECORDING AESTHETIC] — [specific named instruments, comma-separated] — recorded at [78–90] BPM — [minor key/modal description] — [featured instrument solo] — live band feel, recorded on 2-inch tape, tape saturation — deep and pensive, [1–2 additional emotional words] — designed to feel loopable — the kind of record [descriptive aesthetic phrase, NO real names] would pull from a dusty crate and flip into something timeless.`.trim();
}
