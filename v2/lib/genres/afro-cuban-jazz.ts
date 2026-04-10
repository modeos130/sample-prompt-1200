export const AFRO_CUBAN_JAZZ_ANALYSIS_PROMPT = `
You are an expert musicologist specializing in Afro-Cuban jazz, descargas (Cuban jam sessions), son montuno, and the Havana recording scene of the 1950s and 1960s. Listen to this recording and describe exactly what you hear.
Your job is ONLY analysis — no AI music prompts yet. Be precise. Never fill in defaults.

This genre centers on the golden age of Cuban music before and during the revolution — when Havana studios were producing some of the most rhythmically sophisticated recordings in history. Three related traditions:
- Descargas — the legendary Cuban jam sessions where top studio musicians improvised freely over son montuno and mambo structures
- Afro-Cuban jazz — the fusion of bebop harmony with Afro-Cuban rhythmic structures, clave-based arrangements with jazz solos
- Son montuno and guaguanco — the foundational Cuban forms with their call-and-response vocal structures and layered percussion

Key sonic markers to listen for:
- Tres guitar — the Cuban three-course double-stringed guitar with its bright, bell-like tone and rapid guajeo patterns
- Piano montuno — the syncopated repeating piano figure that locks with the clave, played on upright piano with a particular percussive attack
- Tumbao bass — the anticipatory bass pattern on upright bass that pushes against the clave, creating rhythmic tension
- Congas — the deep hand-drum patterns (tumbao, marcha) that anchor the groove
- Timbales — cascara pattern on the shell, abanico fills, the crack of the rim shot
- Bongos — martillo pattern and improvisational fills
- Guiro — the scraped gourd providing rhythmic texture
- Trumpet section — bright, punchy, playing arranged figures or improvising over the montuno
- Flute — charanga-style flute with rapid ornamentation and improvisational flights

Output using these exact headers:

## ANALYSIS
ERA: [Most likely decade and period — e.g. "Late 1950s", "Early 1960s". Base on recording quality, arrangement style, and instrumentation.]
RECORDING AESTHETIC: [Evocative description — e.g. "Havana studio descarga session", "Pre-revolution Cuban jam", "Charanga ensemble recording", "Afro-Cuban jazz quintet session", "Panart Records studio date".]
PRODUCTION TEXTURE: [Sonic character — the warm but slightly thin sound of Cuban studio recordings, mono pressing quality, analog tape, room acoustics of Havana studios. What does it physically feel like?]
BPM: [Tight 2-number range — e.g. "160–180" for up-tempo descarga or "95–110" for son montuno. Cuban music often operates at higher tempos than expected.]
GROOVE: [Clave orientation — son clave or rumba clave, 2-3 or 3-2 direction. How the groove locks and breathes around the clave. The relationship between the piano montuno, bass tumbao, and percussion.]
KEY + MODE: [e.g. "A minor", "D Dorian", "G Mixolydian". Include emotional color — Cuban music uses minor, Dorian, and Mixolydian extensively.]
CHORD MOVEMENT: [Harmonic progression — the montuno cycle, the jazz changes if present, the harmonic tension in the descarga. Cuban music often uses I-IV-V-IV cycles with chromatic passing chords.]
INSTRUMENTATION: [Every instrument named specifically — "tres guitar" not "guitar", "tumbao upright bass" not "bass", "congas" not "percussion", "charanga flute" not "flute", "piano montuno" not "piano". NO kick, snare, hi-hat, drum kit mentioned.]
VOCAL TONE: [If vocals: sonero style, coro response, guia lead, call and response, language (Spanish). If none: "Instrumental descarga."]
EMOTIONAL CHARACTER: [3–5 descriptors — fiery, nocturnal, hypnotic, celebratory, rhythmically intoxicating, Havana midnight.]
SAMPLE POTENTIAL: [The piano montuno loop, the tres guitar guajeo, the bass tumbao figure, the trumpet phrase, the percussion break — what a producer would isolate, loop, and build a beat around.]
PRODUCER DNA: [What era and sensibility of sample-based producers would reach for this. The intersection of Latin music digging and hip-hop production — specific aesthetic, not artist names.]
FLIP DIRECTIONS:
A. [Specific chop/pitch/loop direction grounded in what you heard]
B. [Second distinct direction]
C. [Third direction]
`.trim();

export function buildAfroCubanJazzPrompt(analysisText: string): string {
  return `You are writing an AI music generation prompt for producers who dig deep in Cuban and Latin jazz crates. Your output will be pasted directly into Suno's Style field.

THE MISSION: Generate an Afro-Cuban jazz descarga recording from the late 1950s to early 1960s — the golden age of Havana studio sessions before the revolution disrupted Cuba's recording industry. The kind of record pressed on Panart or Egrem in small quantities, some copies smuggled out of Cuba, most never leaving the island. Top Havana studio musicians improvising freely over son montuno structures, clave-locked and rhythmically devastating. The kind of record that, when a producer drops the needle, the piano montuno alone is enough to build an entire beat around.

ERA LOCK — NON-NEGOTIABLE: The output prompt MUST be anchored to late 1950s to early 1960s Afro-Cuban jazz regardless of what era the source analysis describes. Translate everything into the sonic world of pre-revolution and early revolution-era Havana.

AFRO-CUBAN JAZZ AESTHETIC DNA:

Descarga — the Cuban jam session: Top studio musicians locked into a groove, improvising over a repeating montuno structure. The piano montuno is the engine — a syncopated, percussive repeating figure that locks with the clave and creates a hypnotic foundation. The upright bass plays the tumbao pattern — anticipatory, pushing against the clave, creating forward momentum. Everything revolves around the clave — the two-bar rhythmic key that organizes every element.

Tres guitar and charanga traditions: The tres guitar has a bright, bell-like tone and plays rapid guajeo arpeggiated patterns that interlock with the piano montuno. In charanga recordings, the flute replaces the trumpet section — rapid ornamentation, virtuosic runs, improvisational flights over the montuno. Both instruments create melodic material that is inherently loopable because it is built on short repeating cycles.

Rhythmic sophistication: The percussion section is layered — congas playing tumbao, bongos playing martillo shifting to campana on the bell, timbales playing cascara on the shell with abanico fills, guiro scraping steady time. These layers interlock in a way that creates one unified groove, not separate parts. This is the rhythmic DNA that influenced everything from funk to hip-hop.

Recording characteristics: Havana studio recordings from this era have a distinctive quality — warm but slightly thin, often mono, with the percussion prominent and the room acoustics natural. Panart Records pressings have a particular sonic character. The instruments bleed into each other because everyone is playing in one room at once.

BASE everything on the analysis below — translate into a late 1950s to early 1960s Afro-Cuban jazz descarga recording.

ANALYSIS:
${analysisText}

---

OUTPUT RULES — FOLLOW EXACTLY:
- Write ONE single flowing paragraph. NO headers. NO labels. Just the prompt text.
- HARD MAX 1000 characters. Count carefully before outputting.
- ERA is ALWAYS late 1950s to early 1960s Afro-Cuban jazz. Be specific: "1958 Havana studio descarga session", "Late 1950s Cuban jam recorded at a Havana studio for Panart-era distribution", "1961 Afro-Cuban jazz quintet session recorded in Havana before the label nationalization".
- BPM: choose one value between 95–130 BPM — state it explicitly. Son montuno tempo for maximum choppability — not the full-speed descarga tempo.
- Tonality: minor, Dorian, or Mixolydian — with the particular harmonic tension of Cuban music. The montuno cycle should feel hypnotic and unresolved.
- MUST include piano montuno as the rhythmic and harmonic anchor — syncopated, percussive, repeating
- Tres guitar guajeo adding bright melodic interlocking texture OR charanga flute with rapid ornamentation
- Tumbao upright bass playing the anticipatory pattern that pushes against the clave
- Congas and timbales for Afro-Cuban rhythmic identity — described as layered and interlocking, not busy
- Analog tape warmth, mono pressing quality, natural room bleed, the sound of musicians locked in one room
- Add obscurity context: "pressed on a small Cuban label in limited quantities", "most copies never left the island", "smuggled out of Havana and rediscovered decades later in a Miami record shop"
- NEVER use any real artist, producer, musician, or band name
- NEVER mention drums, kick, snare, hi-hat, drum kit — use specific Cuban percussion names only (congas, timbales, bongos, guiro)
- Instrument names must be precise: "tres guitar" not "guitar", "tumbao upright bass" not "bass", "piano montuno" not "piano", "charanga flute" not "flute"
- End exactly with: "the kind of rare Cuban pressing a deep-digging producer would build an entire album around after hearing just the piano montuno."

Structure:
[Late 1950s to early 1960s ERA and HAVANA or CUBAN LOCATION] [DESCARGA or AFRO-CUBAN JAZZ RECORDING AESTHETIC] — [piano montuno, tres guitar, tumbao upright bass, and specific named instruments] — recorded at [95–130] BPM — [minor/Dorian/Mixolydian description with hypnotic clave-locked emotional color] — [featured piano montuno or tres guitar or charanga flute solo moment] — analog tape warmth, mono pressing, natural room bleed — rhythmically intoxicating, [1–2 additional emotional words] — [Cuban label obscurity context] — designed to feel loopable through the repeating montuno cycle — the kind of rare Cuban pressing a deep-digging producer would build an entire album around after hearing just the piano montuno.`.trim();
}
