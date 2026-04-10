export const JAPANESE_JAZZ_FUNK_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst specializing in Japanese jazz recordings, particularly the deep jazz-funk, spiritual jazz, and modal explorations from Tokyo's underground jazz scene (1970s–1980s). NOT city pop — the deeper, funkier, more spiritual side. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Mid 1970s", "Early 1980s". Base on instrumentation, recording quality, sonic character. Japanese jazz-funk peaked roughly 1971–1985. Consider the evolution from hard bop influence to fusion to spiritual jazz.]
RECORDING AESTHETIC: [Evocative description — e.g. "Three Blind Mice audiophile session", "East Wind studio recording", "Trio Records live-in-studio date". Japanese recording studios of this era were LEGENDARY for quality — warm, spacious, meticulous engineering with exceptional stereo imaging.]
PRODUCTION TEXTURE: [Sonic patina — Japanese studios were among the best in the world. Note the characteristic warmth, the wide stereo field, the clarity of instrument separation, the quality of the analog tape. Japanese pressings were also superior — heavier vinyl, quieter surfaces. These records SOUND expensive.]
BPM: [Tight 2-number range — e.g. "88–96". If no clear pulse, describe rhythmic feel instead.]
GROOVE: [Straight / swung / triplet / rubato / free — Japanese jazz-funk often has a distinctive tightness and precision even in its funkiest moments. Note any tension between American funk looseness and Japanese rhythmic precision.]
KEY + MODE: [e.g. "D Dorian", "F# minor pentatonic", "Bb Mixolydian". Japanese jazz musicians often favored Dorian and Mixolydian modes, with occasional use of Japanese pentatonic scales (miyako-bushi, in-sen). Include emotional color.]
CHORD MOVEMENT: [Harmonic progression — Japanese jazz musicians studied American harmony deeply but often added distinctly Japanese touches: unexpected chord substitutions, more circular progressions, a tendency toward melancholy even in uptempo pieces. What moves, what cycles, what surprises.]
INSTRUMENTATION: [Every instrument identified — watch for the Japanese jazz-funk palette: Fender Rhodes electric piano (ubiquitous), upright bass or electric bass (often switching within a track), tenor or alto saxophone, flute (very common in Japanese jazz), electric guitar with clean or slightly overdriven tone, vibraphone, koto (occasionally), Moog or ARP synthesizer in later recordings. Name precisely. NO drums, kick, snare, hi-hats ever mentioned.]
VOCAL TONE: [If vocals: register, texture, delivery style. Japanese jazz vocals often feature wordless singing (scat) or restrained, breathy Japanese-language delivery. If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors. Japanese jazz-funk carries a unique emotional signature: wabi-sabi (beauty in imperfection), mono no aware (the pathos of things), a melancholy that persists even in grooves. The music is technically brilliant but emotionally restrained — heat under ice.]
SAMPLE POTENTIAL: [What would a sample-based producer gravitate toward. Japanese jazz-funk is producer gold because of the pristine recording quality — when you chop it, every element is clean and separated. The Rhodes patterns, the bass lines, the flute melodies are all instantly usable.]
PRODUCER DNA: [Which generation and aesthetic of sample-based producers would reach for this. The lo-fi spiritual beatmaker school who flip Japanese jazz constantly, the producers obsessed with warm analog recordings, the beat-makers who recognize that Japanese jazz has the cleanest source material on earth for sampling.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/tempo direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();


export function buildJapaneseJazzFunkPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for the most serious crate-digging producers alive. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate source material — NOT a hip-hop beat, but the deep, pristine RECORD from 1970s–early 1980s Tokyo that was pressed on a legendary Japanese jazz label and never exported. A Japanese jazz-funk or spiritual jazz recording that combines American hard bop and funk influences with a distinctly Japanese musical sensibility — meticulous recording quality, emotional restraint masking deep feeling, and the kind of analog warmth that makes producers lose their minds. NOT city pop. The deeper, darker, funkier side of Japanese jazz.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to the 1970s–early 1980s Japanese jazz scene. This is the golden age of Japanese jazz labels — domestic-only pressings on heavy virgin vinyl, recorded in studios that rivaled or exceeded anything in New York or London. The sound quality is PRISTINE — warm, spacious, perfectly engineered.

JAPANESE JAZZ-FUNK DNA — WHAT MAKES THIS GENRE UNIQUE:

Japanese musicians who studied hard bop and soul jazz in New York and brought it back to Tokyo, filtering it through Japanese sensibility. The result: technically impeccable performances with a distinctive emotional quality — melancholy underneath the groove, restraint masking intensity. The recording quality is legendary. Japanese studios of this era used the finest equipment, the best tape, and the most meticulous engineers. These records sound better than almost anything recorded anywhere in the world at the same time.

KEY INSTRUMENTS — BE SPECIFIC:
- Fender Rhodes electric piano — the signature instrument, warm and bell-like, often with subtle chorus
- Upright bass — deep, woody, perfectly recorded with full low-end presence
- Electric bass — tight, funky, precisely played with a round warm tone
- Tenor saxophone — the dominant horn, played with a warm breathy tone
- Alto saxophone — bright and cutting when featured
- Flute — extremely common in Japanese jazz, breathy and lyrical
- Vibraphone — shimmering, with motor on for tremolo effect
- Electric guitar — clean or slightly overdriven, jazz voicings with occasional funk chops
- Moog synthesizer — in later recordings, warm analog pads or bass
- Koto (13-string Japanese zither) — occasionally integrated, adding unmistakable Japanese color

TONALITY: Dorian and Mixolydian modes dominate. Minor pentatonic for melodic themes. Occasional use of Japanese scales — miyako-bushi (half-step pentatonic) or in-sen scale for distinctly Japanese harmonic color. The harmony is sophisticated — extended chords, tritone substitutions, modal interchange. Always minor or modal in emotional character, even when technically in a major mode.

RECORDING CHARACTER: Japanese studios were LEGENDARY. Wide stereo imaging. Warm analog tape with minimal hiss. Perfect instrument separation — you can hear every element distinctly. The bass is deep and full, the Rhodes is warm and present, the horns are breathy and close-miked. Heavy virgin vinyl pressings with virtually silent surfaces. These records are audiophile-quality source material.

RARITY FRAMING: Most Japanese jazz pressings were domestic-only — 1000 to 3000 copies, never exported. The labels (use descriptive language, not real label names) pressed for the Japanese domestic market exclusively. Original pressings are now among the most sought-after jazz vinyl on earth, with prices reaching hundreds or thousands of dollars.

BASE everything on the analysis below — but ALWAYS reframe it as a 1970s–early 1980s Japanese jazz recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS 1970s–early 1980s Japan. Be geographically specific: "Mid 1970s Tokyo jazz-funk session", "Late 1970s Japanese spiritual jazz recording from a legendary Tokyo studio".
- BPM: choose one value between 80–108 BPM — state it explicitly
- ALWAYS minor or modal tonality — Dorian, Mixolydian, minor pentatonic, or Japanese scales. Name the emotional color.
- MUST include a featured instrument solo — "breathy tenor saxophone solo floating over the Rhodes changes", "flute melody ascending through the Dorian mode with Japanese inflection", "Fender Rhodes electric piano solo with tremolo and chorus"
- Pristine recording quality — legendary Japanese studio, warm analog tape, wide stereo imaging, perfect instrument separation
- MUST include obscurity framing referencing domestic-only pressing: "pressed in a quantity of 1500 copies on a prestigious Tokyo jazz label, never exported outside Japan", "a domestic-only Japanese pressing that Western collectors have spent decades hunting", "recorded for a small Japanese audiophile jazz label and never distributed beyond Tokyo record shops"
- Designed to feel loopable — a short harmonic cycle built to repeat hypnotically
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat, or any rhythmic element
- Instrument names must be precise
- End exactly with: "the kind of immaculate Japanese jazz recording a dedicated crate digger would find in a Shibuya basement shop and never stop flipping."`.trim();
}
