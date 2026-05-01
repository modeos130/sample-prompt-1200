import { NextRequest, NextResponse } from "next/server";
import { activeUserError, getActiveUser } from "@/lib/auth/active-user";

export const maxDuration = 30;

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
// In-memory store: resets on each cold start (every ~few hours on Vercel free tier)
// Good enough for limited beta testing — upgrade to Upstash Redis for production
const ipCallLog = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT_CALLS   = parseInt(process.env.RATE_LIMIT_CALLS   ?? "10"); // calls per window
const RATE_LIMIT_WINDOW  = parseInt(process.env.RATE_LIMIT_WINDOW  ?? "86400000"); // 24h in ms
const MONTHLY_HARD_CAP   = parseInt(process.env.MONTHLY_HARD_CAP   ?? "500"); // total calls this instance

let totalCallsThisInstance = 0;

function checkRateLimit(ip: string): { allowed: boolean; reason?: string; remaining?: number } {
  // Hard cap on total instance calls (resets on cold start)
  if (totalCallsThisInstance >= MONTHLY_HARD_CAP) {
    return { allowed: false, reason: "Daily capacity reached. Check back tomorrow." };
  }

  const now = Date.now();
  const record = ipCallLog.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    // New window
    ipCallLog.set(ip, { count: 1, windowStart: now });
    totalCallsThisInstance++;
    return { allowed: true, remaining: RATE_LIMIT_CALLS - 1 };
  }

  if (record.count >= RATE_LIMIT_CALLS) {
    const resetIn = Math.ceil((RATE_LIMIT_WINDOW - (now - record.windowStart)) / 3600000);
    return { allowed: false, reason: `Rate limit reached. You get ${RATE_LIMIT_CALLS} generations per day. Resets in ~${resetIn}h.` };
  }

  record.count++;
  totalCallsThisInstance++;
  return { allowed: true, remaining: RATE_LIMIT_CALLS - record.count };
}

// ─── GENRE RULES ─────────────────────────────────────────────────────────────
const GENRE_RULES: Record<string, string> = {
  "boom-bap": `ERA LOCK: Late 1960s–1970s. Soul-jazz, hard bop, spiritual jazz, blaxploitation scores, CTI soul-jazz, Stax soul. BPM: 78–90. Minor/modal only. Live band, 2-inch tape, upright bass anchor, featured horn or piano solo. Obscurity framing: pressed in small quantities, regional label, found in a crate. End: "the kind of forgotten record [era/aesthetic descriptor, no real names] would spend years hunting in overseas crates and flip into something timeless."`,
  "dark-underground": `ERA LOCK: Late 1960s–early 1970s. Eastern European modal jazz, Italian film score, obscure foreign library records, psychedelic soul. BPM: 63–80. Dorian, Phrygian, diminished — maximum tension, zero resolution. Flute, organ, or harpsichord lead. Heavy vinyl degradation, wow-flutter. End: "the kind of forgotten foreign record a serious crate digger would spend decades hunting in an overseas record shop."`,
  "soul-gospel": `ERA LOCK: Late 1960s Black American gospel and sacred soul. Small church or small studio recording. BPM: 70–86. Hammond B3 organ mandatory, full choir harmonies, call-and-response. Hand claps not drums. Raw, imperfect, devotional. "Recorded live in a small church, never commercially distributed." End: "the kind of sacred recording [descriptor] would chop, pitch up, and place underneath something hard to make it feel like church."`,
  "jazz": `ERA LOCK: Early 1970s small ensemble jazz. Regional jazz label. BPM: 82–96. Upright bass walking line anchor, muted trumpet or tenor saxophone lead, dry room acoustics, analog tape hiss. Minor or Dorian. Late-night intimate feel. "Pressed in small quantities for local distribution." End: "the kind of warm dusty record [descriptor] would loop two bars of and build entire worlds around."`,
  "latin": `ERA LOCK: Late 1960s New York Latin soul orchestral. Small NYC indie label for Spanish-speaking audience. BPM: 74–86. Dramatic dark string section, wordless female vocal hum as texture only, sparse congas and timbales, muted brass. Very cinematic, barrio midnight feeling. End: "the kind of orchestral Latin soul recording [descriptor] would loop and transform into something devastating."`,
  "japanese": `ERA LOCK: Late 1970s Japanese soul (Wamono). Small regional Japanese label, never exported. BPM: 76–86. Muffled Rhodes or electric piano, light bass that sits back, minimal brushed drums, reverb-soaked distant female vocal floating above the mix, flute or vibraphone accents. 3am Tokyo city feeling. End: "the kind of obscure Japanese pressing [descriptor] would discover and flip into something completely transformed."`,
  "brazilian": `ERA LOCK: Late 1970s Brazilian jazz-fusion. São Paulo small regional label, never exported outside Brazil. BPM: 88–100. Rhodes piano with Brazilian harmonic sensibility, surdo and pandeiro percussion, breathy flute or nylon-string guitar, wordless female vocal hum, humid room sound. Afro-Brazilian rhythmic pulse. End: "the kind of record [descriptor] would change their life the first time they heard it in a crate in São Paulo."`,
  "italian-film": `ERA LOCK: Early 1970s Italian Poliziotteschi crime film or giallo horror score. Roman studio, pressed for cinema distribution only. BPM: 65–82. Wah-wah rhythm guitar, overdriven walking bass, flute or harpsichord or tremolo strings, sparse Hammond stabs. Eerie and funky simultaneously. "Never released commercially outside Italian cinema." End: "the kind of forgotten European score cue [descriptor] would pitch down, slow, and loop into something that hits like a freight train."`,
  "soulful-house": `ERA LOCK: Early 1990s NYC underground soulful house. BPM: 118–128. Four-on-the-floor implied, gospel piano upbeat stabs, Hammond B3, live bass, full choir harmonies, congas alongside drum machine. Spiritual and physical simultaneously. Church-trained female vocal. End: "the kind of record [descriptor] would drop at 4am and make the room levitate."`,
  "disco-house": `ERA LOCK: Late 1990s French-influenced disco house. BPM: 120–126. Four-on-the-floor implied, filter sweep on bass opening and closing over the 8-bar cycle, lush 1970s disco strings, wah rhythm guitar, brass stabs, vocal chop as instrument. The filter movement is the defining element. Euphoric, sleek. End: "the kind of record [descriptor] would loop for eight minutes without losing momentum."`,
  "tv-score": `ERA LOCK: Early 1970s American television crime drama score cue. Three sections: sparse electric piano intro → wah-wah guitar groove with muted brass → strip back to piano. BPM: 82–96. Surveillance scene feeling, city at 2am. Written to loop under dialogue. "Composed for a gritty weekly crime drama on a major American network, 1972." End: "the kind of TV score cue [descriptor] would isolate, chop, and pitch into something completely unrecognizable and dangerous."`,
  "cinematic-dark": `ERA LOCK: Late 1980s–early 1990s orchestral. Simple 4–8 note piano melody in natural minor. Long slow string pads as patient presence. Deep resonant cello. BPM: 65–80. Silence between notes. Emotional ambiguity. Analog warmth without heavy vinyl degradation. End: "the kind of orchestral source material [descriptor] would low-pass filter and build their most emotional record around."`,
  "drum-break": `ERA LOCK: 1970s live funk drum performance. NO melody, NO harmony, NO bass — pure drums. Three-act structure: locked groove → extended solo breakdown (snare rolls, tom fills, open hi-hat splashes, 8–16 bars pure percussive improvisation) → groove return. BPM: 95–108. Raw room acoustics, minimal mic placement, human rushing and dragging. End: "the kind of isolated drum performance where the solo section alone can be chopped into dozens of separate hits and loops."`,
  "chipmunk": `ERA LOCK: Early 1960s girl group soul recording. Designed to be sped up. BPM: 108–120 source (will chipmunk to 130–145). Bright and clear. Call-and-response female harmonies, horn stabs, bouncy minor key progression. "Regional 45 single, local airplay only." End: "the kind of bright regional 45 [descriptor] would speed up, pitch up, and transform into something buoyant and undeniable."`,
  "marching-band": `ERA LOCK: Early 1970s college marching band live stadium recording. 60–80 horns in unison. BPM: 68–80, slow and majestic. Minor-to-major emotional arc. Dynamic: low brass foundation → full eruption → single trumpet soloist → full ensemble crash. Outdoor field microphones, crowd noise. End: "the kind of live brass recording [descriptor] would isolate a single horn stab from and place under a rolling 808 to make something feel enormous."`,
  "modern-trap": `ERA LOCK: Late 1980s–early 1990s orchestral. Simple haunting 4–8 note piano melody in natural minor. String pads as background texture, deep cello, silence between notes. BPM: 65–80 source (doubles to 130–140 trap range). Emotional ambiguity — works under introspective verses and drops. Analog warmth without heavy vinyl degradation. End: "the kind of simple orchestral source material [descriptor] would loop, filter, and place under 808s to make something emotionally overwhelming."`,
  "polish-jazz": `ERA LOCK: Early 1970s Polish jazz from Warsaw. State-owned Polskie Nagrania label, never exported outside Eastern Europe. BPM: 72–86. Crystalline European grand piano with brittle clarity, upright bass dry and forward in mix, Harmon-muted trumpet. Dorian or Phrygian mode. Cold metallic room reverb from concrete studio. Sparse ensemble, wide silence between phrases. End: "the kind of cold dusty record a serious producer would loop two bars of and build entire worlds around."`,
  "israeli-psych": `ERA LOCK: Early 1970s Israeli psychedelic folk from Tel Aviv. Small indie label, 300 copies, never distributed outside Israel. BPM: 68–80. Solo oud in Hijaz scale with microtonal bends, bouzouki tremolo arpeggios, electric guitar with heavy spring reverb. Warm midrange tape saturation. Middle Eastern ornamental melodic runs. End: "the kind of forgotten Middle Eastern recording a crate digger would spend years hunting and flip into something devastating."`,
  "hungarian-psych": `ERA LOCK: Mid 1970s Hungarian psychedelic folk-rock. State-funded session, limited domestic pressing, never exported beyond Eastern Bloc. BPM: 74–86. Cimbalom (hammered dulcimer) as lead — percussive bell-like attack with long metallic decay. Tárogató (dark reedy wind instrument). Electric guitar with fuzz and phaser drones. Hungarian minor scale (raised 4th, natural 7th). End: "the kind of obscure Eastern European record that sounds like nothing else when chopped and pitched."`,
  "krautrock": `ERA LOCK: Early 1970s German experimental / kosmische musik. Small independent label, 500 copies, converted farmhouse studio. BPM: 82–94. Moog synthesizer filter sweeps (low-pass cutoff opening and closing), Farfisa organ Phrygian drone through spring reverb, electric guitar through ring modulator. Motorik pulse feel. Cold, vast, industrial. End: "the kind of cold kosmische record a producer would slow down, low-pass filter, and build their most hypnotic record around."`,
  "turkish-psych": `ERA LOCK: Early 1970s Turkish psychedelic / Anadolu rock from Istanbul. 45 RPM single, small Turkish label, 500 copies, never distributed outside Anatolia. BPM: 70–82. Amplified bağlama (saz) in rapid tremolo in Hicaz makam — microtonal intervals. Farfisa organ dark modal chords. Electric bass high on neck following melodic contour. Mono mix, dense and punchy, saturated tape. End: "the kind of forgotten Turkish record a serious crate digger would spend decades hunting in an overseas record shop."`,
  "ethio-jazz": `ERA LOCK: Early 1970s Ethiopian recording from Addis Ababa. 7-inch single, 500 copies, small Ethiopian label, never exported. BPM: 72–84. Hammond organ in ambassel or tezeta mode — dark, aching, notes orbiting tonal center without resolving. Tenor saxophone with heavy vibrato and Ethiopian ornamental turns. Dry close-miked recording, minimal reverb. End: "the kind of forgotten African recording a producer would loop two bars of and build something timeless around."`,
  "ghana-funk": `ERA LOCK: Mid 1970s Ghanaian highlife funk from Accra. Small Ghanaian label, limited domestic run. BPM: 92–106. Clean-toned electric guitar locked into shimmering two-bar ostinato pattern, second guitar rhythmic comping with highlife swing feel. Electric bass walking melodic counter-line. Congas and cowbell polyrhythm. Bright analog tape, warm midrange. End: "the kind of bright dusty West African record a producer would pitch down, slow to half-speed, and flip into something that knocks."`,
  "bollywood": `ERA LOCK: Early 1970s Bollywood film score from Bombay. Pressed for Indian domestic distribution only, never exported. BPM: 72–84. Solo sitar in raga-influenced minor scale with microtonal bends. Lush tremolo strings, tablas weaving restrained rhythmic pattern. Hammond organ dark lower-register chords. Distant wordless female vocal hum. End: "the kind of forgotten Bollywood score cue a global crate digger would build entire projects around."`,
  "french-library": `ERA LOCK: Early 1970s French library music / Parisian studio. 200 copies pressed for broadcast use, never commercially released. BPM: 74–86. Harpsichord in harmonic minor — precise, cold, baroque-influenced. Solo flute with French classical phrasing. Nylon-string guitar comping sparse voicings. Lush string section dark cinematic chords. End: "the kind of elegant forgotten European recording a producer would pitch down and build something cinematic around."`,
  "philly-soul": `ERA LOCK: Mid 1970s Philadelphia soul orchestral. Small Philadelphia independent label, B-side overlooked. BPM: 76–88. Massive string section (30 players) sweeping through dramatic minor-key arrangement. Rhodes electric piano rich extended voicings. Full horn section stabs. Solo flugelhorn exposed melodic phrase. Warm analog tape from legendary Philly studio. End: "the kind of orchestral soul recording where a single string swell becomes the foundation of an anthem."`,
  "blaxploitation": `ERA LOCK: Early 1970s American blaxploitation film score. Regional crime film, released and forgotten. BPM: 82–94. Wah-wah rhythm guitar tight syncopated pattern, deep walking electric bass slightly overdriven. Harmon-muted trumpet cool minor-key melody. Hammond B3 dark background chords. Sparse string section tension. Dorian mode, late-night urban cool. End: "the kind of gritty urban score a producer would isolate the wah guitar from and flip into something dangerous."`,
  "spiritual-jazz": `ERA LOCK: Early 1970s spiritual jazz. Small independent jazz label, 300 copies, never reissued. BPM: 68–80. Rhodes electric piano modal drone in Dorian — warm, cosmic, tremolo sustained. Solo flute meditative melody circling without resolving. Upright bass sparse root notes. Congas and finger cymbals gentle polyrhythm. Devotional, beyond-themselves atmosphere. End: "the kind of cosmic jazz record a producer would loop two bars of and build entire worlds around."`,
  "synth-funk": `ERA LOCK: Early 1980s American synth-funk / quiet storm. Small independent funk label, limited regional distribution. BPM: 78–90. Prophet synthesizer lush extended minor chord voicings with filter sweeps. Moog bass deep repetitive pattern. Rhodes sparse melodic phrases. Talk box vocal texture — robotic yet emotional. Polished studio sheen with tape compression. End: "the kind of polished synth-soul record a producer would slow down, loop the pad, and build something heavy underneath."`,
  "kung-fu-score": `ERA LOCK: Mid 1970s Hong Kong martial arts film score. Pressed for Asian cinema distribution only, never released outside region. BPM: 70–82. Solo erhu slow pentatonic minor melody — dark, tense, nasal bowed quality. Chinese percussion (woodblocks, gongs, small cymbals) sharp dramatic accents. Tremolo strings low dissonant clusters. Guzheng sparse arpeggiated figures. End: "the kind of forgotten Eastern film score a producer would pitch down and build their most cinematic record around."`,
  "greek-rebetiko": `ERA LOCK: Early 1970s Greek laiko from Athens. Small Greek label, limited domestic run, never distributed outside Mediterranean. BPM: 72–84. Solo bouzouki rapid tremolo in Phrygian mode — bright, metallic, Mediterranean intensity. Nylon-string guitar dark minor chords. Electric bass following melodic contour. Sparse string section long sustained tones. Smoky nightclub atmosphere. End: "the kind of forgotten Greek recording a crate digger would spend years hunting and flip into something haunting."`,
  "8-bit": `ERA LOCK: Late 1980s 8-bit console game soundtrack. Japanese domestic market cartridge RPG, small run, never localized. BPM: 68–80. Single pulse wave slow haunting melody in Phrygian — each note isolated by digital silence. Triangle wave bass holding sustained drone notes. Second pulse wave high-register tremolo pulsing slowly. Pure 8-bit synthesis, low-resolution DAC, aliasing artifacts, zero effects. Dungeon/labyrinth atmosphere. End: "the kind of eerie 8-bit composition a producer would sample raw and build their most atmospheric record around."`,
  "vocal-chop": `ERA LOCK: Mid 1970s soul or gospel recording with a prominent vocal performance. The VOCAL is the centerpiece — a short emotionally charged phrase that repeats and functions as a hook. Female soul vocal preferred — wailing, gospel-drenched, straining at the edges. Rhodes piano, lush strings, Hammond organ underneath. BPM: 68–86. The vocal phrase should be 4-8 words maximum, repeating with slight variation. Minor key, Dorian or natural minor. End: "the kind of devastating soul vocal performance built to be chopped into a two-bar loop and transformed into something emotionally overwhelming."`,
  "childrens-toy": `ERA LOCK: Early 1970s budget children's music recording. Small educational distributor, pressed on thin vinyl, sold at school book fairs, never commercially distributed. BPM: 66–78. Toy piano (tinny, slightly detuned, percussive), glockenspiel doubling melody an octave higher, recorder (breathy, slightly sharp), music box mechanism two-note ostinato. Triangle and wood blocks sparse accents. Simple pentatonic minor melody, 2-4 bar repeating phrase. Mono, boxy room sound. End: "the kind of forgotten children's record that becomes deeply haunting when pitched down and placed underneath something hard."`,
  "zamrock": `ERA LOCK: Mid 1970s Zambian psychedelic rock from Lusaka/Copperbelt. Small Lusaka label, 500 copies, never exported. BPM: 78–90. Fuzz-drenched electric guitar (ragged distortion from damaged amplifier), circular bass pattern from Zambian folk intervals, Farfisa combo organ detuned. Dorian or minor pentatonic with unexpected leaps from indigenous tonal language. Warm saturated tape from recycled vinyl. End: "the kind of impossibly rare African psych record a crate digger would build entire projects around."`,
  "congolese-rumba": `ERA LOCK: Early 1970s Congolese rumba from Kinshasa. 45 RPM single, small Kinshasa label, 1,000 copies, never distributed outside Central Africa. BPM: 86–98. Clean-toned electric guitar rapid fingerpicked arpeggios (bright, liquid, cascading), second guitar interlocking rhythmic comping, deep melodic bass counter-line, congas and maracas polyrhythmic bed. Sebene instrumental breakdown section. Natural minor. End: "the kind of forgotten Congolese guitar record a producer would pitch down and flip into something no one has ever heard."`,
  "colombian-cumbia": `ERA LOCK: Early 1970s Colombian psychedelic cumbia from Medellín. Small coastal label for jukebox distribution, never exported. BPM: 78–90. Fuzz electric guitar carrying gaita-derived melody, Farfisa combo organ nasal reedy chords, deep repetitive electric bass, congas, guacharaca scraping shuffle, timbales. Harmonic minor with Phrygian-adjacent flat-second tension. Hot tape saturation, boxy room sound. End: "the kind of forgotten Colombian fuzz-cumbia record a producer would pitch down and flip into something hypnotic and menacing."`,
  "peruvian-chicha": `ERA LOCK: Mid 1970s Peruvian chicha from a small Lima studio. Tiny Lima label, 300 copies, never left Peru. BPM: 78–90. Electric guitar drenched in spring reverb and constant tremolo playing Andean pentatonic minor melody (wet, shimmering, wobbling). Farfisa organ doubling melody thin nasal tone. Electric bass simple cumbia-derived pattern. Congas and guiro rhythmic bed. Dead intimate room, lo-fi tape saturation. End: "the kind of forgotten Peruvian chicha recording a producer would pitch down three semitones and flip into something devastating and ancient-sounding."`,
  "thai-psych": `ERA LOCK: Late 1960s Bangkok psychedelic luk thung. 7-inch single, small Bangkok label, few hundred copies, most destroyed by tropical climate. BPM: 76–88. Overdriven fuzz guitar playing ornamental Thai pentatonic figures with pitch slides (gaita-derived phrasing through damaged tube amp). Thin reedy Farfisa organ sustained modal chords. Hammered dulcimer bright metallic accents. Two-stringed bowed fiddle high nasal tone. Mono, midrange-heavy. End: "the kind of impossibly rare Southeast Asian recording a crate digger would fly to Bangkok hoping to find and build something no one has ever heard."`,
  "cambodian-rock": `ERA LOCK: Early 1970s Cambodian rock from Phnom Penh. Fewer than 200 surviving copies of a 45 RPM single. BPM: 72–84. Spring-reverb-drenched tremolo guitar playing Khmer pentatonic melody (bright, cutting, surf technique applied to Southeast Asian modal phrasing with flattened second). Thin combo organ dark minor chords. Congas and bongos Latin-influenced rhythm. Heavy tape hiss, bright midrange-forward mono. End: "the kind of devastatingly rare recording from a scene that was destroyed, recovered from a hidden cassette, and given a second life as the foundation of something powerful."`,
  "soviet-estrada": `ERA LOCK: Late 1970s Soviet jazz-funk from Moscow state studio. Melodiya state label, limited domestic run, never exported outside USSR. BPM: 78–90. Soviet-made electric piano (thinner, more nasal than genuine Rhodes). Flugelhorn with conservatory precision over forbidden funk harmony. State orchestra string section lush minor chords. Upright bass with flat-wound strings. Dense midrange ORWO tape character. End: "the kind of hidden Iron Curtain recording a crate digger would find in a Moscow basement and flip into something the world has never heard."`,
  "yugoslav-funk": `ERA LOCK: Mid 1970s Yugoslav prog-funk from Belgrade. Jugoton pressing, domestic distribution, never exported to West. BPM: 82–94. Fender Rhodes in 7/8 time (asymmetric meter feeling natural). Wah-wah guitar syncopated accents. Electric bass deep Balkan groove with Romani chromatic passing tones. Moog synthesizer dark pads. Phrygian dominant with augmented second of Balkan folk harmony. End: "the kind of Eastern Bloc recording that sounds like nothing else when chopped."`,
  "korean-psych": `ERA LOCK: Early 1970s Korean psychedelic rock from Seoul. Small Seoul label, most copies banned and destroyed by government. BPM: 72–84. Fuzz guitar descending Korean pentatonic minor melody with microtonal pansori inflections. Gayageum twelve-string zither bright plucked accents. Daegeum bamboo flute breathy haunting counter-melody. Farfisa organ dark minor chords. Compressed tape, raw urgent room sound. End: "the kind of banned and burned Korean psych record that a crate digger would spend a lifetime searching for."`,
  "japanese-jazz-funk": `ERA LOCK: Mid 1970s Japanese jazz-funk from prestigious Tokyo studio. Domestic-only Japanese jazz label, 1,000 copies, never exported. BPM: 78–90. Warm Fender Rhodes extended chord voicings (ninths, elevenths) with subtle chorus. Deep upright bass perfectly recorded. Breathy tenor saxophone lyrical solo. Flute doubling Rhodes melody. Pristine analog tape, wide stereo imaging, heavy virgin vinyl pressing. Audiophile quality. End: "the kind of pristine Japanese jazz-funk record a producer would loop two bars of and build entire worlds around."`,
  "algerian-rai": `ERA LOCK: Late 1970s Algerian raï from Oran. Cassette-only distribution in Algerian market stalls, never pressed to vinyl, never exported. BPM: 82–94. Gasba bamboo flute ornate Hijaz scale melody (breathy, microtonal bends). Cheap Farfisa keyboard thin buzzy chords. Darbuka sharp rhythmic accents, guellal frame drum deeper pulse. Mandole repetitive minor chord strumming. Cassette-saturated lo-fi mono. End: "the kind of lost North African recording a global crate digger would build something devastating around."`,
  "moroccan-gnawa": `ERA LOCK: Mid 1970s Moroccan Gnawa trance-fusion. Limited domestic Moroccan pressing only. BPM: 80–92. Sintir three-stringed bass lute deep hypnotic Phrygian ostinato (woody, buzzing, between upright bass and sitar). Krakeb iron castanets interlocking heavy metallic polyrhythm. Tenor saxophone dark modal melody. Tbel barrel drum ceremonial pulse. Natural riad courtyard ambience. End: "the kind of hypnotic Gnawa recording a producer would low-pass filter and build their most atmospheric record around."`,
  "haitian-vodou": `ERA LOCK: Late 1960s Haitian vodou-jazz from Port-au-Prince. Tiny Haitian label, never exported. BPM: 76–88. Diatonic button accordion haunting natural minor melody (reedy, wheezy, bellows audible). Tanbou ceremonial drum sacred rhythmic patterns. Vaksin bamboo trumpets deep polytonal blasts creating dissonant brass choir. Tcha-tcha shaker rhythmic bed. Humid tropical room sound. End: "the kind of forgotten Caribbean recording a producer would chop and build something sacred and devastating around."`,
  "iranian-psych": `ERA LOCK: Early 1970s Tehran psychedelic pop. Small Tehran label, 500 copies, most destroyed after the revolution. BPM: 74–86. Hammered santur cascading minor modal melody with quarter-tone inflections (72 strings shimmering). Fuzz electric guitar doubling an octave below. Weeping kamancheh spike fiddle nasal almost-human solo with microtonal bends between Western semitones. Farfisa organ dark chords. Tight dry Tehran studio, recycled vinyl surface noise. End: "the kind of destroyed pressing from a Tehran label that a crate digger would spend a lifetime searching for in diaspora collections."`,
  "afghan-folk": `ERA LOCK: Early 1970s Kabul recording from Radio Afghanistan studios. Recorded for radio broadcast, never commercially pressed. BPM: 74–86. Solo rubab (three gut melody strings with fifteen sympathetic strings creating natural chorus of buzzing overtones). Hand-pumped harmonium sustained minor chords with audible bellows (equal-temperament friction against rubab natural intonation). Tabla slow asymmetric pattern. Mono tape, heavy hiss, close boxy room. End: "the kind of recording that survived three wars in a Kabul basement — the last physical evidence of a music scene erased from the Earth."`,
  "south-african-jazz": `ERA LOCK: Early 1970s South African township jazz from Johannesburg. Domestic Gallo pressing, never exported outside southern Africa. BPM: 84–96. Penny whistle bright virtuosic minor pentatonic melody (cutting, sharp). Marabi piano cyclical three-chord vamp (percussive, repeating hypnotically every two bars). Township guitar clean fingerpicked mbira-influenced patterns. Deep mbaqanga bass melodic counter-line. Slightly harsh mid-range analog tape. End: "the kind of township jazz record a producer would loop the marabi piano vamp and build something that knocks."`,
  "afro-cuban": `ERA LOCK: Late 1950s Afro-Cuban jazz descarga from Havana. Small pre-revolution Havana label, most copies never left Cuba. BPM: 88–100. Piano syncopated montuno figure locked to clave, cycling every two bars. Tres guitar bright arpeggiated guajeo interlocking with piano. Tumbao upright bass anticipating downbeat. Congas tumbao pattern, timbales cascading on shell. Charanga wooden flute rapid ornamental runs. Warm analog tape, slightly thin room. End: "the kind of forgotten descarga recording a producer would isolate the montuno and build an entire world around two bars of Cuban piano."`,
  "g-funk": `ERA LOCK: Mid 1970s Ohio/Detroit P-Funk — the raw funk SOURCE records that West Coast producers replayed. Small Dayton or Detroit funk label, 500 copies. BPM: 100–110. High-register Moog synthesizer whistle lead with slow portamento glide in Dorian mode — sunny menace. Deep Minimoog sine-wave bass blooming through slow filter envelope. Rhodes electric piano with extended minor ninth voicings and gentle tremolo. Talk box melodic phrase — synthesizer shaped through vocal tube. Clean polished wide stereo mix. End: "the kind of California synth-funk recording a producer would isolate the whistle from and build an anthem around."`,
  "p-funk": `ERA LOCK: Mid 1970s Detroit funk from a legendary Motor City studio. Small Midwestern label, 500 copies. BPM: 98–108. Minimoog synthesizer bass one-chord vamp in E Dorian — fat sawtooth with slow filter bloom. Hohner Clavinet D6 through Mutron envelope filter chopping rhythmic upbeat accents. Wah-wah rhythm guitar syncopated scratches. Tight horn section (trumpet, trombone, tenor saxophone) punching short unison stabs. Neve console warmth, 2-inch tape saturation, natural room bleed. End: "the kind of deep funk record a Midwest crate digger would find in a Dayton thrift store and build an entire career around."`,
  "atl-dungeon": `ERA LOCK: Early 1970s Southern psychedelic soul — the SOURCE records Atlanta Dungeon Family producers drew from. Small Southern independent label, 1973. BPM: 78–88. Hammond B3 organ with Leslie speaker rotating slowly — deep gospel minor voicings swelling in waves. Diatonic blues harmonica with Southern blues inflection. Nylon-string acoustic guitar fingerpicked circular pattern. Moog synthesizer bass sustained sub tones. Long plate reverb tails on everything. Psychedelic, spacey, converted basement studio at 3am. End: "the kind of heavy spacey Southern soul recording the most visionary producers from the South would build an entire double album around."`,
  "houston-funk": `ERA LOCK: Early 1970s cinematic soul/blaxploitation soundtrack — the SOURCE records Houston producers sampled. Regional crime film soundtrack, never commercially released. BPM: 82–92. Clean Fender Stratocaster single-note melodic licks with slight chorus — Gulf Coast player style. Yamaha DX7 electric piano warm sustained chords. Hammond organ short staccato rhythmic stabs. Talk box melodic phrase — singing robot texture. Deep Moog synthesizer bass round clean tone. Polished tight punchy mix. End: "the kind of polished funk recording a trunk-music producer would slow down, pitch into the basement, and let ride until the entire car vibrates."`,
  "memphis-dark": `ERA LOCK: Mid 1970s European horror film scores — the SOURCE records Memphis producers sampled. Italian/European cinema distribution only, never commercially released. BPM: 68–78. Cold dark-toned Yamaha DX7 synthesizer slow descending figure in Phrygian — thin, eerie, chromatic descent. Gothic pipe organ drone sustaining tritone, dissonant and menacing. Reverb-drenched flute sample descending minor melody buried in dark hall reverb. Cassette-saturated, heavy compression, clipping on peaks, 12-bit SP-1200 resolution. End: "the kind of sinister lo-fi recording a dark Southern beatmaker would loop on a four-track until it sounds like a transmission from underneath the earth."`,
  "nola-bounce": `ERA LOCK: Early 1970s New Orleans brass band field recordings — the SOURCE material bounce producers sampled. Local New Orleans label, 200 copies, sold at parades. BPM: 96–106. Sousaphone carrying deep round melodic bass line in Mixolydian — warm, pitched, rhythmically active, tuba as both bass and melody. Brass section (trumpet, trombone) tight arranged stabs and call-and-response phrases. Solo trumpet bluesy improvised passage with wide vibrato. Second-line parade swagger rhythmic feel. End: "the kind of heavy brass-inflected funk recording a bounce producer would chop into a call-and-response pattern and let the second line ride all night."`,
  "melodic-trap-source": `ERA LOCK: Late 2010s dark melodic source material. Unreleased, sat in a vault folder. BPM: 70–76 felt (140–150 actual). Plucked digital synthesizer simple descending phrase in minor — short attack, fast decay, melancholic and hypnotic. Dark analog pad sustained with subtle detuning, low-passed. Crystalline music box bell doubling melody higher register. Solo piano sparse minor ninth voicings with long reverb tails. Clean digital production, wide stereo, heavy reverb. NO drums NO bass. End: "the kind of unreleased loop that sat in a vault folder because it was too emotionally specific to place."`,
  "drill-source": `ERA LOCK: Early 2020s dark aggressive source material. Unreleased, circulated through private links. BPM: 70–74 felt (140–148 actual). Harsh orchestral string stab in Phrygian — short, violent, cutting to silence. Dark sustained cello drone holding tritone. Distorted detuned sawtooth synthesizer fast repeating pattern — flat-second interval creating unease. Reversed piano notes bleeding backward. Stark, minimal, dissonant. NO drums NO bass. End: "the kind of dark melodic source material a producer would layer sliding bass underneath and build the most aggressive record of the year around."`,
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are the master prompt engineer behind the 130 Mode Prompt Lab — the most respected AI sample generation prompt library in producer culture. Your prompts produce raw, vintage, sampleable source material for hip-hop and beat producers.

CORE DNA — NON-NEGOTIABLE RULES FOR EVERY PROMPT:

1. ONE single flowing paragraph. No headers, no labels, no bullet points. Pure prompt text only.
2. HARD MAX 1000 characters. Count carefully. Stay under.
3. NEVER use any real artist name, producer name, musician name, or band name. Suno blocks these.
4. NEVER mention drums, kick, snare, hi-hat, cymbals, or any rhythmic element explicitly. Genre-lock naturally instead ("jazz trio", "soul quartet", "string ensemble").
5. ALWAYS minor scale or modal tonality — Dorian, Phrygian, harmonic minor, diminished. No major key unless the genre specifically requires it (gospel/house).
6. Instrument names must be PRECISE: "upright bass" not "bass", "Rhodes electric piano" not "keys", "Harmon-muted trumpet" not "trumpet", "Hammond B3 organ" not "organ".
7. ALWAYS include a featured solo instrument or melodic statement.
8. ALWAYS include specific geographic and era framing: not "vintage" but "Late 1960s New York hard bop session" or "Early 1970s Italian film score recorded at a Roman studio".
9. ALWAYS include obscurity/scarcity framing: "pressed in 300 copies on a small regional label", "never distributed outside its home country", "recorded for a film that was never widely released".
10. Designed to feel loopable — a short harmonic cycle (2, 4, or 8 bars) that repeats hypnotically without fatigue.
11. Emotional register must be specific and evocative — not "sad" but "weighted with grief that has been carried for years" or "the feeling of a city at 3am when everything is possible and nothing is certain".

THE PROVEN STRUCTURE:
[ERA and SPECIFIC LOCATION] [RECORDING AESTHETIC] — [specific named instruments, comma-separated] — recorded at [BPM] BPM — [minor/modal description with emotional color] — [featured instrument solo or melodic statement] — [texture: tape saturation, vinyl surface noise, room character] — [2–3 emotional words] — [obscurity/scarcity framing] — designed to feel loopable — [genre-specific closer phrase with NO real names]

Output ONLY the prompt text. No preamble, no explanation, no quotes around it. Just the raw prompt.`;

// ─── HANDLER ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const activeUser = await getActiveUser(req);
  if (!activeUser.ok) return activeUserError(activeUser);

  // Rate limit check
  const limit = checkRateLimit(activeUser.user.id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: limit.reason },
      {
        status: 429,
        headers: { "X-RateLimit-Remaining": "0" },
      }
    );
  }

  try {
    // Body size check
    const contentLength = parseInt(req.headers.get("content-length") ?? "0");
    if (contentLength > 2048) {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }

    const body = await req.json() as { vibe?: string; genre?: string };
    const { vibe, genre } = body;

    if (!vibe?.trim()) {
      return NextResponse.json({ error: "No vibe description provided." }, { status: 400 });
    }
    if (vibe.length > 500) {
      return NextResponse.json({ error: "Vibe description too long. Max 500 characters." }, { status: 400 });
    }
    if (!genre || !GENRE_RULES[genre]) {
      return NextResponse.json({ error: "Invalid genre." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured." }, { status: 500 });
    }

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nGENRE-SPECIFIC RULES FOR THIS REQUEST:\n${GENRE_RULES[genre]}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `Producer vibe: "${vibe.trim()}"\n\nWrite the Suno prompt now. Remember: one paragraph, under 1000 characters, no real names, no drums.`,
        }],
      }),
    });

    const data = await response.json() as {
      content?: Array<{ text: string }>;
      error?: { message: string };
    };

    if (!response.ok) {
      const msg = data.error?.message ?? `Claude API error ${response.status}`;
      if (response.status === 429) {
        return NextResponse.json({ error: "Claude API quota exceeded. Try again shortly." }, { status: 503 });
      }
      throw new Error(msg);
    }

    const prompt = data.content?.[0]?.text?.trim() ?? "";
    if (!prompt) throw new Error("Empty response from Claude.");

    return NextResponse.json(
      { prompt, remaining: limit.remaining ?? 0 },
      { headers: { "X-RateLimit-Remaining": String(limit.remaining ?? 0) } }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[vibe-prompt]", msg);
    return NextResponse.json({ error: "An error occurred generating your prompt." }, { status: 500 });
  }
}
