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
PRODUCER DNA: [Which generation and aesthetic of sample-based hip-hop producers would recognize and reach for this. Be specific about the era and aesthetic — not artist names.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/tempo direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();


export function buildBoomBapPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for the most serious crate-digging producers alive. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate source material — NOT a hip-hop beat, but the raw, forgotten RECORD from the late 1960s or 1970s that was pressed in small quantities, never widely distributed, and would stop a serious producer cold the moment the needle dropped. The kind of record that sounds like it was recorded in a specific room in a specific city in a specific month, and carries all of that weight.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to the late 1960s–1970s regardless of what era the source analysis describes. Translate everything into the sonic world of that golden period: Blue Note hard bop sessions, CTI soul-jazz, Stax Records soul, Motown studio productions, blaxploitation film scores, spiritual jazz, Italian film scores, Eastern European library music, psychedelic soul, Brazilian tropicalia. No exceptions.

PRODUCER AESTHETIC DNA:

East Coast boom bap architects: hard bop and soul-jazz sources, surgically chopped loops, horn-heavy CTI/Stax aesthetic, upright bass-forward, organic grit. Records pressed for regional jazz labels found in Harlem basements.

Dark cinematic underground school: obscure dark jazz, blaxploitation film scores, world music, eerie minor keys, cold hypnotic tension, cinematic menace. Sounds like it was recorded for a film that was never released.

Lo-fi spiritual beatmaker school: intimate Detroit soul, deep obscure cuts, Eastern European psych-rock, Japanese jazz fusion, woozy cassette-worn warmth, humanly imperfect feel, Brazilian tropicalia, West African records. Records from cultures you cannot immediately place.

Golden era soul-flip generation: sped-up soul samples, gospel-adjacent energy, dramatic orchestral records, warm and organic, emotionally direct, made to be pitched up into anthems.

Queensbridge and Bronx rawness school: sparse piano loops over minor-key soul, menacing and cold, jazz-funk attitude, dusty and hard, warm horns over dark basslines. Records that sound like they were made in a concrete building at 3am.

BASE everything on the analysis below — but ALWAYS reframe it as a late 1960s or 1970s recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS late 1960s–1970s. Be geographically and era-specific: "Late 1960s New York hard bop session", "Early 1970s soul recording from a small Memphis label", "Mid-1970s Italian film score".
- BPM: choose one value between 78–90 BPM — state it explicitly
- ALWAYS minor scale or modal tonality — Dorian, Phrygian, harmonic minor. No major key.
- MUST include a featured instrument solo — named specifically: "Harmon-muted trumpet solo", "tenor saxophone running the minor harmony", "Hammond B3 organ break", "Rhodes electric piano statement"
- Live band feel — real musicians in a room, human timing imperfection, instruments bleeding into each other's mics
- MUST include: "recorded on 2-inch tape" and "tape saturation"
- Add obscurity framing: "pressed in 300 copies on a small regional label", "recorded for a film never widely released", "never distributed outside its home country"
- Designed to feel loopable — a short harmonic cycle (2, 4, or 8 bars) that repeats hypnotically
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat, or any rhythmic element
- Instrument names must be precise: "upright bass" not "bass", "Rhodes electric piano" not "keys"
- End exactly with: "the kind of forgotten record [descriptive aesthetic phrase — NO real names] would spend years hunting in overseas crates and flip into something timeless."

Structure:
[Late 1960s or 1970s ERA and LOCATION] [RECORDING AESTHETIC] — [specific named instruments] — recorded at [78–90] BPM — [minor/modal description] — [featured instrument solo] — live band feel, recorded on 2-inch tape, tape saturation — deep and pensive, [1–2 emotional words] — [obscurity framing] — designed to feel loopable — the kind of forgotten record [descriptive aesthetic phrase, NO real names] would spend years hunting in overseas crates and flip into something timeless.`.trim();
}
