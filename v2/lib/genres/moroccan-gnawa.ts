export const MOROCCAN_GNAWA_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Moroccan Gnawa music, particularly the electric fusion era of the 1970s when Gnawa trance ceremonies collided with jazz and funk. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period. Base on instrumentation, recording quality, fusion style markers. Be specific — "Mid 1970s Gnawa-jazz fusion" or "Late 1970s Essaouira festival-era recording".]
RECORDING AESTHETIC: [Evocative description — e.g. "Essaouira late-night lila ceremony recorded to tape", "Casablanca studio Gnawa-funk session", "Small Moroccan label Gnawa-jazz fusion pressing", "Field recording of a derdeba trance ceremony with electric instruments overdubbed".]
PRODUCTION TEXTURE: [Sonic character — analog tape warmth, room ambience from a riad courtyard, lo-fi field recording bleed, studio polish or raw ceremony capture. What does it physically feel like?]
BPM: [Tight 2-number range. If unclear, describe the rhythmic cycle and whether it has the accelerating trance quality typical of Gnawa ceremony music.]
GROOVE: [Trance cycle / hypnotic repetition / accelerating lila rhythm / locked Gnawa groove — how the sintir bass line and krakeb pattern interlock.]
KEY + MODE: [e.g. "G Phrygian", "D minor pentatonic with blue notes", "Bb natural minor". Include the modal character — Gnawa music uses specific modal scales tied to spiritual colors (mluk). Describe the emotional and spiritual color.]
CHORD MOVEMENT: [Harmonic cycle — typically a short repeating modal bass pattern (the sintir ostinato) with melodic instruments moving freely above. What the cycle implies emotionally.]
INSTRUMENTATION: [Every instrument named specifically — "sintir three-stringed bass lute" not "bass", "krakeb iron castanets" not "percussion", "tbel barrel drum" if present, "electric guitar" if present in fusion context, "tenor saxophone" if jazz fusion, "congas" if added. Precise Gnawa and fusion instrument names.]
VOCAL TONE: [If vocals: the Gnawa call-and-response chanting style, the lead maalem's vocal quality, communal response singing, Arabic/Amazigh dialect. If none: "Instrumental."]
EMOTIONAL CHARACTER: [3–5 descriptors — trance-inducing, spiritual, nocturnal, hypnotic, deep, grounding, possessed.]
SAMPLE POTENTIAL: [The sintir bass loop, the krakeb metal pattern, the vocal chant, the point where jazz instruments enter over the Gnawa foundation — what a producer would isolate and build around.]
PRODUCER DNA: [What era and sensibility of producers would recognize this as completely untouched territory. Specific aesthetic — not artist names.]
FLIP DIRECTIONS:
A. [Specific loop/chop/pitch direction grounded in what you heard]
B. [Second direction]
C. [Third direction]
`.trim();

export function buildMoroccanGnawaPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers hunting sounds from completely untouched territory. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate a Moroccan Gnawa fusion recording from the mid to late 1970s — the era when the ancient trance music of the Gnawa brotherhoods met jazz, funk, and electric instruments. The sintir bass lute has one of the deepest, most hypnotic bass tones in world music. When combined with krakeb iron castanets and communal call-and-response chanting, it creates music that is BUILT to loop. These recordings from small Moroccan labels and festival sessions are almost completely unknown to Western sample diggers.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to mid-to-late 1970s Morocco regardless of what era the source analysis describes. This is when Gnawa master musicians (maalems) began collaborating with jazz and funk musicians, creating a fusion that kept the deep spiritual trance foundation but added electric guitar, saxophone, and studio production. Essaouira, Marrakech, Casablanca — the Moroccan recording scene.

MOROCCAN GNAWA AESTHETIC DNA:

Sintir three-stringed bass lute as the foundation: the deep, woody, buzzing tone of the sintir — a bass instrument with a sound somewhere between an upright bass and a sitar, with sympathetic string buzz and a hypnotic repeating ostinato pattern. This instrument IS the loop. A two-bar sintir pattern is the foundation of everything.

Krakeb iron castanets as rhythmic identity: the metallic clashing pattern of heavy iron castanets played by the Gnawa brotherhood — not delicate, not shimmering, but heavy, insistent, and hypnotic. The interlocking krakeb pattern creates a polyrhythmic bed that is impossible to replicate with Western percussion.

Call-and-response communal chanting: the lead maalem singing a phrase, the brotherhood responding in unison — deep, guttural, spiritual, repetitive. Not a vocal performance — a spiritual invocation that functions as texture.

Jazz fusion additions: tenor saxophone, electric guitar with wah-wah, congas, flute — layered over the Gnawa trance foundation, adding harmonic color without disrupting the hypnotic cycle.

Trance ceremony architecture: music designed to induce spiritual possession — long, repetitive, slowly intensifying, built on short cycling patterns that repeat for extended periods. Inherently loopable by spiritual design.

BASE everything on the analysis below — translate into a mid-to-late 1970s Moroccan Gnawa fusion recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully.
- ERA is ALWAYS mid-to-late 1970s Morocco. Be specific: "1976 Gnawa-jazz fusion session recorded in Essaouira", "Late 1970s Moroccan Gnawa trance recording with electric instruments overdubbed in a Casablanca studio".
- BPM: choose one value between 80–105 BPM — state it explicitly
- Tonality: Phrygian, natural minor, minor pentatonic — the deep modal scales of Gnawa spiritual music. ALWAYS name the specific scale and its spiritual/emotional color.
- MUST include sintir three-stringed bass lute as the foundation — deep, buzzing, hypnotic ostinato pattern
- MUST include krakeb iron castanets as the rhythmic texture — heavy, metallic, interlocking
- Include at least one jazz fusion instrument: tenor saxophone, electric guitar with wah-wah, or flute
- Call-and-response vocal chanting as spiritual texture — communal, deep, repetitive
- Analog tape warmth with natural room ambience — the sound of a late-night session
- Add obscurity context: "recorded during a late-night session in Essaouira", "pressed on a small Moroccan label", "never distributed outside Morocco"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat — use "krakeb iron castanets" or "tbel barrel drum" for rhythmic identity
- End exactly with: "the kind of deep Moroccan trance recording [descriptive aesthetic phrase — NO real names] would discover and build the most hypnotic beat of their career around."

Structure:
[Mid-to-late 1970s ERA, Moroccan location] [GNAWA FUSION RECORDING AESTHETIC] — [sintir bass lute, krakeb castanets, specific named instruments] — recorded at [80–105] BPM — [Phrygian/minor modal description with spiritual-emotional color] — [featured sintir ostinato or saxophone solo moment] — analog tape warmth, natural room ambience — trance-inducing and spiritual, [1–2 emotional words] — [Moroccan label obscurity context] — designed to feel loopable by spiritual design — the kind of deep Moroccan trance recording [descriptive aesthetic phrase, NO real names] would discover and build the most hypnotic beat of their career around.`.trim();
}
