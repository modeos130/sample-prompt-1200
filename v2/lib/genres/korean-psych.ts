export const KOREAN_PSYCH_ANALYSIS_PROMPT = `
You are an expert musicologist and audio analyst specializing in East Asian psychedelic and folk-rock recordings, particularly the Korean golden age (1960s–1975). Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Late 1960s", "Early 1970s". Base on instrumentation, recording quality, sonic character. Consider Korean psychedelic rock peaked 1968–1975 before government crackdowns.]
RECORDING AESTHETIC: [Evocative description — e.g. "Raw Seoul garage recording", "Korean Broadcasting System session tape", "Underground nightclub recording from Myeong-dong". Reference the distinctive Korean recording aesthetic: rawer, more lo-fi than Japanese studios, often mono or narrow stereo.]
PRODUCTION TEXTURE: [Sonic patina — analog tape warmth, vinyl degradation, fuzz distortion character, room bleed, mic limitations of Korean studios of the era. Korean recordings tend toward rawer, more compressed sound than their Japanese counterparts.]
BPM: [Tight 2-number range — e.g. "72–78". If no clear pulse, describe rhythmic feel instead.]
GROOVE: [Straight / swung / triplet / rubato / free — note any collision between Western rock rhythm and Korean traditional rhythmic sensibility. Korean psych often has a distinctive push-pull between pentatonic phrasing and rock backbeat.]
KEY + MODE: [e.g. "A minor pentatonic", "E Phrygian", "Korean pentatonic (la-do-re-mi-sol)". Korean psychedelic rock frequently used traditional Korean pentatonic scales fused with Western minor modes. Include emotional color.]
CHORD MOVEMENT: [Harmonic progression — note any tension between Korean melodic tradition (which tends toward pentatonic, descending phrases) and Western rock harmony. What cycles, what resolves, what drones.]
INSTRUMENTATION: [Every instrument identified — watch for the distinctive Korean psych palette: fuzz guitar, tremolo guitar, gayageum (Korean zither), daegeum (large transverse bamboo flute), haegeum (Korean fiddle), janggu (hourglass drum), electric organ, bass guitar. Name precisely. NO drums, kick, snare, hi-hats ever mentioned.]
VOCAL TONE: [If vocals: register, texture, delivery style, emotional quality. Korean psych vocals often have a distinctive wailing quality rooted in han (Korean cultural concept of deep sorrow). If none: "Instrumental — no vocals."]
EMOTIONAL CHARACTER: [3–5 specific mood descriptors. Reference the unique emotional landscape: han (deep sorrow), jeong (deep attachment), the defiance of youth culture under authoritarian rule.]
SAMPLE POTENTIAL: [What would a sample-based producer gravitate toward. Specific melodic, textural, or harmonic moments. Korean psych is gold for producers because of the unfamiliar-yet-emotional pentatonic melodies over fuzz guitar — instantly recognizable as "different" when chopped.]
PRODUCER DNA: [Which generation and aesthetic of sample-based producers would reach for this. The lo-fi spiritual beatmaker school, the obscure world-music diggers, the producers who flip records from cultures you cannot immediately place.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/tempo direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();


export function buildKoreanPsychPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for the most serious crate-digging producers alive. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate source material — NOT a hip-hop beat, but the raw, banned, destroyed RECORD from late 1960s to early 1970s Korea that survived the government purges. A Korean psychedelic folk-rock recording that fuses traditional Korean pentatonic melodies with Western fuzz guitar and electric organ — the kind of record that was pressed in tiny quantities before the Park regime's crackdowns destroyed the masters and banned the music. A record that a crate digger would find in a dusty Seoul back-alley shop and recognize instantly as gold.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to late 1960s–1975 Korea. This is the golden age before Emergency Decree No. 9 effectively killed Korean rock. The sound is raw, the studios were modest, the recordings have a lo-fi intensity that Japanese studios of the same era did not — Korean recordings feel more compressed, more urgent, more garage.

KOREAN PSYCHEDELIC DNA — WHAT MAKES THIS GENRE UNIQUE:

The collision of Korean traditional music and Western psychedelic rock. Korean pentatonic scales (la-do-re-mi-sol, often descending) played through fuzz pedals and tremolo. The emotional weight of han — a uniquely Korean concept of deep, unresolved sorrow — running through every melody. Wailing vocals that draw from pansori (Korean narrative singing) tradition but channeled through rock energy.

KEY INSTRUMENTS — BE SPECIFIC:
- Fuzz guitar with heavy tremolo — the signature sound, raw and overdriven
- Gayageum (12-string Korean zither) — plucked, creates an instantly recognizable Korean texture
- Daegeum (large transverse bamboo flute) — breathy, haunting, cuts through distortion
- Haegeum (two-string Korean fiddle) — wailing, bowed, sounds like a human crying
- Electric organ — Farfisa or similar combo organ, thin and reedy
- Bass guitar — often simple, repetitive, anchoring the pentatonic riffs

TONALITY: Korean pentatonic modes (related to but distinct from Japanese pentatonic). Heavy use of minor pentatonic with the distinctive Korean "bent" notes — microtonal inflections that come from traditional Korean music. Phrygian and Aeolian modes common. Always minor or modal — no major key.

RECORDING CHARACTER: Korean studios of this era were raw. Mono or narrow stereo. Tape compression. Room bleed. Fuzz pedals overdriving modest amplifiers. The sound has an urgency and compression that distinguishes it from the pristine Japanese recordings of the same period.

RARITY FRAMING: Many of these recordings were literally destroyed by the Korean government. Masters burned. Pressings confiscated. The surviving copies are among the rarest vinyl on earth. A single 7-inch from this era can sell for thousands of dollars. Frame the output as one of these survivors.

BASE everything on the analysis below — but ALWAYS reframe it as a late 1960s–early 1970s Korean recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS late 1960s–early 1970s Korea. Be geographically specific: "Late 1960s Seoul psychedelic recording", "Early 1970s Korean underground rock session".
- BPM: choose one value between 72–92 BPM — state it explicitly
- ALWAYS minor pentatonic or modal tonality — Korean pentatonic, Phrygian, Aeolian, Dorian. Name the emotional color.
- MUST include a featured instrument making a specific melodic statement — "wailing haegeum solo over the fuzz guitar drone", "gayageum melody descending through the pentatonic scale", "breathy daegeum cutting through distorted electric organ"
- Raw recording feel — modest Korean studio, tape compression, fuzz pedal distortion, mono or narrow stereo
- MUST include obscurity framing referencing the government crackdowns: "one of fewer than 100 surviving copies after the government confiscated and destroyed the master tapes", "pressed before the Emergency Decrees banned this music", "a record that survived the purges only because a single copy was hidden"
- Designed to feel loopable — a short harmonic cycle built to repeat hypnotically
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, percussion, kick, snare, hi-hat, or any rhythmic element
- Instrument names must be precise and culturally specific
- End exactly with: "the kind of impossibly rare Korean recording a serious world-music crate digger would build an entire album around after finding the last surviving copy in a Seoul back-alley shop."`.trim();
}
