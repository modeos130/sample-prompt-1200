import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120; // Music generation is slow

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
// Separate counters from vibe-prompt — resets on each cold start
const musicIpCallLog = new Map<string, { count: number; windowStart: number }>();

const MUSIC_RATE_LIMIT  = parseInt(process.env.MUSIC_RATE_LIMIT  ?? "5");       // calls per IP per day
const MUSIC_RATE_WINDOW = parseInt(process.env.MUSIC_RATE_WINDOW ?? "86400000"); // 24h in ms
const MUSIC_HARD_CAP    = parseInt(process.env.MUSIC_HARD_CAP    ?? "50");       // total calls per cold start

let musicTotalCalls = 0;

function checkMusicRateLimit(ip: string): { allowed: boolean; reason?: string; remaining?: number } {
  if (musicTotalCalls >= MUSIC_HARD_CAP) {
    return { allowed: false, reason: "Daily music generation capacity reached. Check back tomorrow." };
  }

  const now = Date.now();
  const record = musicIpCallLog.get(ip);

  if (!record || now - record.windowStart > MUSIC_RATE_WINDOW) {
    musicIpCallLog.set(ip, { count: 1, windowStart: now });
    musicTotalCalls++;
    return { allowed: true, remaining: MUSIC_RATE_LIMIT - 1 };
  }

  if (record.count >= MUSIC_RATE_LIMIT) {
    const resetIn = Math.ceil((MUSIC_RATE_WINDOW - (now - record.windowStart)) / 3600000);
    return { allowed: false, reason: `Rate limit reached. You get ${MUSIC_RATE_LIMIT} music generations per day. Resets in ~${resetIn}h.` };
  }

  record.count++;
  musicTotalCalls++;
  return { allowed: true, remaining: MUSIC_RATE_LIMIT - record.count };
}

// ─── PROVEN PROMPTS (SERVER-SIDE ONLY — NEVER SENT TO CLIENT) ────────────────
const PROVEN_PROMPTS: Record<string, { name: string; genre: string; prompt: string }> = {
  "P01": { name: "The Flute Digger", genre: "italian-film", prompt: "Obscure 1960s Italian film score recording, heavy analog degradation and deep vinyl surface noise. Haunting solo flute melody in Dorian mode, sparse pizzicato strings, dry upright bass with no drums. Tempo around 68\u201376 BPM, slow and heavy. Cold, eerie atmosphere with unresolved tension \u2014 no catharsis, no chorus swell. Slight tape splice artifacts and wow-flutter. Sounds like a lost b-side no one has ever sampled. Loopable, cinematic dread, the kind of forgotten foreign record a serious crate digger would spend decades hunting in an overseas record shop." },
  "P02": { name: "Cold Organ", genre: "dark-underground", prompt: "Early 1970s Eastern European modal jazz recording, warped tape and thick vinyl crackle throughout. Haunting Hammond organ lead in Phrygian mode, cold tremolo strings low in the mix, barely-audible upright bass. Tempo 70\u201378 BPM, heavy and deliberate. No drums, no vocals. Claustrophobic, dimly-lit atmosphere \u2014 sounds like it was recorded in a concrete building at 3am. Sparse and menacing with long sustained tones and silence used as texture. Designed to loop. The kind of obscure record that sounds dangerous when chopped and pitched." },
  "P03": { name: "Psych Soul Ghost", genre: "dark-underground", prompt: "Late 1960s psychedelic soul recording, extreme tape degradation, heavy vinyl surface noise and random crackle pops. Sparse harpsichord in a diminished scale, dissonant tremolo strings, and faint ghostly wordless female vocal buried deep in the mix \u2014 not a lead, just a haunting texture. Dry upright bass, no drums. Tempo 63\u201372 BPM, dragging and hypnotic. Dark, hallucinatory mood \u2014 melancholy without resolution. Feels like a forgotten record pressed in small quantities that never got distributed. Loopable and deeply sampleable when pitched up." },
  "P04": { name: "Middle East Menace", genre: "dark-underground", prompt: "Early 1970s Middle Eastern orchestral recording, analog tape saturation with heavy wow-flutter and vinyl degradation. Oud or sitar melody in a Hijaz scale, dark cello section low in the mix, minimal upright bass. No drums, no vocals. Tempo 72\u201380 BPM, swaying and hypnotic. Cinematic dread \u2014 the kind of music that plays before something terrible happens in a film. Unresolved harmonic tension throughout, no cathartic release. Sparse arrangement with long held tones and deep silences. Sounds like it was recorded in Cairo or Istanbul in 1971 and never released outside its region. Built to loop endlessly." },
  "P05": { name: "Hybrid Bridge", genre: "boom-bap", prompt: "1970s rare soul recording, heavy analog tape saturation and vinyl crackle. Slow Rhodes piano melody in Dorian mode, sparse cold strings and minimal upright bass. No drums. Tempo 74\u201382 BPM. Single ghostly female vocal hum buried under the instruments \u2014 not a performance, just an atmosphere. Dark, contemplative mood with no harmonic resolution. Imperfect human timing and tape artifacts throughout. Lush enough to feel emotional, menacing enough to feel dangerous. Loopable, designed to be chopped, pitched, and flipped into something brutal." },
  "P06": { name: "Black Church", genre: "soul-gospel", prompt: "Late 1960s Black church recording, warm analog tape saturation and subtle vinyl surface noise. Full Hammond B3 organ lead, thick gospel choir harmonies rising and falling in waves, strong live bass walking underneath. No drums except occasional hand claps buried deep in the mix. Tempo 72\u201382 BPM. Deep spiritual yearning \u2014 voices stacking on top of each other, call and response between organ and choir. Feels like it was recorded live in a small church on a Sunday morning. Raw, emotional, unrehearsed human feel. The kind of sacred music that becomes transcendent when chopped, pitched up, and placed underneath something hard." },
  "P07": { name: "Late Night Jazz Session", genre: "jazz", prompt: "Early 1970s small ensemble jazz recording, dry room acoustics, analog tape hiss and subtle vinyl surface noise. Upright bass walking line as the anchor, brushed snare and ride cymbal swinging loosely, muted trumpet or tenor saxophone carrying the melody. Tempo 84\u201396 BPM, light and swinging but melancholic underneath. Imperfect human timing, musicians responding to each other in real time. Sounds like a late-night session pressed in small quantities for a regional label. The kind of warm, dusty live jazz record producers have been digging for, looping two bars, and building entire worlds around." },
  "P08": { name: "Aching Soul Vocal", genre: "soul-gospel", prompt: "Mid 1970s dramatic soul recording, heavy analog tape saturation and deep vinyl crackle throughout. Wailing female lead vocal \u2014 emotive, strained, gospel-drenched \u2014 singing a slow aching minor key melody. Voice cracking and straining at the edges, raw and completely unrestrained. Lush string arrangement underneath, warm piano chords, live bass with no drums. Tempo 65\u201376 BPM, slow and weighted with grief. The kind of devastating soul performance built to be chopped into a two-bar loop, pitched up several semitones, and transformed into something completely unrecognizable but emotionally overwhelming." },
  "P09": { name: "45 Flip Ready", genre: "chipmunk", prompt: "Upbeat early 1960s girl group soul recording, bright analog tape, light vinyl surface noise. Call and response female vocal harmonies over a lively minor key chord progression with a bouncy swing feel. Piano, rhythm guitar, walking bass, and a loose live drum groove. Crisp punchy horn stabs punctuating the vocal phrases. Tempo 108\u2013120 BPM, energetic and driving. Feels like a regional 45 single that got local airplay but never crossed over nationally. Designed to be pitched up several semitones and transformed into a buoyant, chipmunked sample flip that still retains the original warmth and swing." },
  "P10": { name: "The Break", genre: "drum-break", prompt: "1970s live funk drum performance recorded to analog tape with moderate vinyl surface noise. No melody, no harmony, no bass \u2014 a single drummer in an empty room. Structure in three acts: opens with a tight locked-in groove \u2014 deep punchy kick, cracking snare, syncopated hi-hats. Mid-section breaks into a full extended drum solo breakdown \u2014 the drummer cuts loose completely, trading between snare rolls, tom fills, open hi-hat splashes, rim shots, and rapid kick doubles for eight to sixteen bars. Final section snaps back to the locked groove, tighter and harder than before. Tempo 95\u2013108 BPM with natural human rushing and dragging throughout." },
  "P11": { name: "Library Cue", genre: "tv-score", prompt: "Early 1970s production library cue recording \u2014 functional broadcast music, analog tape, light vinyl degradation. Short self-contained piece with a deliberate mood arc: tense sparse introduction, slowly building middle section, unresolved hanging ending. Solo flute or vibraphone over cold sparse strings and a dry upright bass. No vocals, no drums. Tempo 76\u201388 BPM. Pressed in a quantity of 300 copies for broadcaster licensing, never heard outside a television studio. Deeply loopable, harmonically restless, completely undiscovered \u2014 the definition of untouched sample material sitting in a library crate." },
  "P12": { name: "Tokyo Deep", genre: "japanese", prompt: "Late 1970s Japanese soul recording, warm analog tape with a slightly muffled, intimate room sound. Mid-tempo groove around 76\u201386 BPM. Soft muffled Rhodes keys carrying a gentle, dreamy minor key melody \u2014 delicate, slightly distant. Clean natural upright bass walking slowly underneath. Minimal brushed drums \u2014 sparse kick, quiet snare, hi-hat barely there. Bright distant female vocal singing a melancholic Japanese pop melody, reverb-soaked and floating above the mix. Subtle flute or vibraphone accents weaving between vocal phrases. The kind of obscure Japanese soul pressing from a small regional label never distributed outside Japan, loopable and deeply sampleable when pitched up and slowed." },
  "P13": { name: "Cinemascope Nero", genre: "italian-film", prompt: "Early 1970s Italian crime film soundtrack recording, analog tape with a slightly hollow studio sound. Mid-tempo groove around 80\u201392 BPM. Funky wah-wah rhythm guitar chopping on the upbeats, deep walking electric bass with a slightly overdriven tone. Lead instrument alternating between a haunting solo flute and a tense tremolo string section \u2014 the two trading off, never resolving harmonic tension. Sparse Hammond organ stabs punctuating dramatic moments. No vocals. Slightly eerie, slightly funky. Pressed in small quantities for film distribution only, never commercially released." },
  "P14": { name: "Midnight Sanctuary", genre: "soulful-house", prompt: "Early 1990s New York underground soulful house music recording, warm analog mixing board saturation. Four-on-the-floor kick drum at 122 BPM, crisp snare on the two and four, shimmering open hi-hat. Deep warm analog bass line in a gospel-influenced minor chord progression. Live gospel piano chords stabbing on the upbeats \u2014 full rich voicings with extended harmonies. A full-throated Black female lead vocal \u2014 powerful, church-trained, deeply emotional. Background choir harmonies swelling in call and response. Congas and shakers woven into the percussion bed. The feeling of a late-night underground club where the music is spiritual, not just physical." },
  "P15": { name: "Filtered Gold", genre: "disco-house", prompt: "Late 1990s French-influenced disco house production, warm heavily filtered analog processing throughout. Four-on-the-floor kick at 124 BPM, tight punchy snare, closed hi-hats with occasional open hat flares. A deeply funky filtered bass line \u2014 the low-pass filter slowly sweeping open and closed over the eight bar cycle. Lush 1970s disco string section looped and filtered. Tight funky rhythm guitar chopping on the upbeats, wah-wah processing giving it a rubbery elastic feel. Brass stabs accenting off-beats. Single short vocal phrase chopped into a two bar loop, pitched and effected until it functions as an instrument. Designed to loop for eight minutes without losing momentum." },
  "P16": { name: "Barrio Nocturno", genre: "latin", prompt: "Late 1960s New York Latin soul orchestral recording, warm analog tape with deep vinyl surface noise. Mid-tempo groove around 74\u201384 BPM. Dramatic dark string section playing a slow moody minor key melody with cinematic tension. Upright bass walking a deep slow groove, congas and timbales playing a restrained rhythmic pattern. Dark piano or organ chords voicing the harmony in the lower register. Female vocal texture floating above \u2014 not singing words, just wordless humming, reverb-soaked, almost ghostly. The feeling of a deserted Latin neighborhood at midnight. Pressed on a small New York indie label in 1969. The kind of orchestral Latin soul recording that loops and transforms into something devastating." },
  "P17": { name: "Giallo Nero", genre: "italian-film", prompt: "Mid 1970s Italian horror film score recording, analog tape with a slightly hollow studio sound. A pulsing electric bass line locked into a hypnotic minor key ostinato, and above it a cold analog synthesizer playing a slow repeating arpeggio that spirals and refuses to resolve. Harpsichord interjecting sharp stabbing phrases between the synth lines. No drums except a slow plodding kick \u2014 one hit every two beats, deliberate and funeral. Distant tremolo strings swelling in and out like something breathing in a dark room. A ghostly whispering female voice buried deep in the reverb \u2014 not words, just a barely-audible tonal hum. Church organ drone underneath everything. Tempo 68\u201380 BPM. Pressed for Italian cinema distribution only." },
  "P18": { name: "Murda Muzik Source", genre: "cinematic-dark", prompt: "Late 1960s dark orchestral recording, heavy analog tape degradation and deep vinyl surface noise throughout. A single repeating minor piano figure in harmonic minor \u2014 cold, mechanical, four to six notes cycling obsessively with no resolution. Not a melody, a motif. Sparse mournful string section underneath, violins playing long sustained tones in the lowest register, bowing slowly and without warmth. No drums, no bass. Tempo 68\u201380 BPM, slow and deliberate, heavy with dread. Occasional dissonant cello swell entering from silence and retreating back into it. Pressed on a small European label in 1967. Designed to be the foundation under the most menacing rap ever recorded." },
  "P19": { name: "Late Night Broadcast", genre: "tv-score", prompt: "Early 1970s American television crime drama score cue, analog tape with a slightly dry studio sound. Three distinct sections that loop back naturally. Opening: tense and sparse \u2014 lone electric piano playing a short repeating minor key figure, upright bass walking slowly. Middle: the groove drops in \u2014 punchy wah-wah rhythm guitar, tight snare, walking bass, muted trumpet playing a short bluesy phrase. Final: everything strips back to just the electric piano motif. Tempo 82\u201396 BPM. The feeling of a surveillance scene \u2014 a detective watching someone from a car at 2am. Composed as functional background music for a gritty weekly crime drama, 1972." },
  "P20": { name: "S\u00e3o Paulo Basement", genre: "brazilian", prompt: "Late 1970s Brazilian jazz-funk fusion recording from S\u00e3o Paulo, warm analog tape with a slightly humid room sound. Electric Rhodes piano carrying a bright hypnotic minor key melody with a distinctly Brazilian harmonic sensibility \u2014 the chord voicings more circular, more resolved into sadness than tension. Deep locked electric bass groove. Surdo and pandeiro percussion weaving through with congas. A breathy flute doubling the Rhodes melody in a higher register. Short wordless female vocal hum floating through the bridge sections. Tempo 88\u2013100 BPM. Pressed on a small regional Brazilian label in 1978, never exported outside Brazil." },
  "P21": { name: "Thunder Soul", genre: "boom-bap", prompt: "Early 1970s live high school stage band funk recording, raw and unpolished analog tape with natural room reverb. A large ensemble of teenage musicians playing with more feeling than technical precision \u2014 slightly imperfect intonation, tempos that breathe because the drummer is seventeen and full of adrenaline. Locked funky groove driven by a tight two-bar horn riff over a deep rhythm section. Mid-section: a young female flute soloist steps out over a stripped-back groove, the flute slightly breathy and raw. Then the drummer breaks into a full extended solo before the full ensemble crashes back in. Tempo 92\u2013108 BPM. Recorded live in a high school gymnasium in 1972." },
  "P22": { name: "Stadium Brass", genre: "marching-band", prompt: "Early 1970s college marching band live stadium recording, warm and slightly distorted from the outdoor field microphones, crowd noise audible. A massive brass section \u2014 sixty to eighty horns \u2014 performing a slow triumphant minor-to-major chord progression that swells and retreats like a tide. The horns begin sparse, just low brass laying foundation. Then the full section erupts. Mid-section: the brass drops to silence except for a single trumpet soloist playing a soaring gospel-influenced melodic phrase \u2014 raw, slightly sharp, deeply emotional. Then the full section crashes back at full volume. Percussion thundering underneath. Tempo 68\u201380 BPM. The kind of single horn stab that, isolated and filtered, becomes the foundation of a stadium rap anthem." },
  "P23": { name: "Dark Cinematic Loop", genre: "cinematic-dark", prompt: "Late 1980s to early 1990s cinematic orchestral recording, slightly degraded analog tape with subtle warmth and soft vinyl texture. A haunting minimal piano melody in a natural minor scale \u2014 four to eight notes, simple and devastating. Long slow string pads sustaining behind the piano like a held breath \u2014 not dramatic swells, just patient presence. Deep resonant cello line moving in slow half notes underneath. No drums, no percussion. Tempo 65\u201380 BPM, slow and weighted. Silence used as much as sound. The emotional register is cinematic grief. Reverb on everything, long tails, sounds bleeding into each other. Designed to work equally well under introspective verses and euphoric drops." },
  "P24": { name: "Warsaw Glass", genre: "polish-jazz", prompt: "Early 1970s Polish jazz recording from Warsaw, cold analog tape with a slightly metallic room reverb and moderate vinyl surface noise. A crystalline grand piano playing a slow repeating figure in D Dorian \u2014 cold, searching, each note ringing with a brittle clarity unique to Eastern European studio pianos. Upright bass recorded dry and forward in the mix, woody attack with minimal sustain. Harmon-muted trumpet entering from silence, playing a restrained melody that circles without resolving. Mid-section: the piano steps into an extended solo passage \u2014 spare, deliberate, the sustain pedal catching overtones that shimmer and decay in the reflective room. Tempo 72\u201382 BPM. No vocals. The atmosphere of a concrete studio at midnight in a country behind the Iron Curtain. Pressed on the state-owned label in a limited domestic run, never exported outside Eastern Europe. Designed to loop hypnotically \u2014 the kind of cold dusty record a serious producer would loop two bars of and build entire worlds around." },
  "P25": { name: "Dead Sea Scroll", genre: "israeli-psych", prompt: "Early 1970s Israeli psychedelic folk recording from Tel Aviv, warm analog tape with heavy midrange saturation and deep vinyl crackle. A solo oud carrying an ornate melody in Hijaz scale \u2014 dark, ancient, each microtonal bend landing between the cracks of Western tuning. Bouzouki arpeggios shimmering underneath in a slow tremolo, metallic and bright. Electric guitar drenched in spring reverb playing sparse modal phrases that echo and decay. Mid-section: the oud steps into an extended solo passage \u2014 rapid ornamental runs climbing through the augmented second intervals, each phrase more desperate than the last before retreating to the central motif. Tempo 68\u201378 BPM, swaying and hypnotic. No vocals except a distant wordless hum buried in reverb. Pressed in a quantity of 300 on a small Tel Aviv indie label, never distributed outside Israel. Built to loop endlessly \u2014 the kind of forgotten Middle Eastern recording a crate digger would spend years hunting and flip into something devastating." },
  "P26": { name: "Budapest Hammer", genre: "hungarian-psych", prompt: "Mid 1970s Hungarian psychedelic folk-rock recording, warm Eastern Bloc tape with subtle compression and moderate vinyl surface noise. A cimbalom playing a repeating figure in Hungarian minor \u2014 the hammered strings shimmering with complex overtones, each strike percussive and bell-like with a long metallic decay. T\u00e1rogat\u00f3 entering with a dark reedy melody in the lower register, mournful and almost vocal in its phrasing. Electric guitar underneath playing slow fuzz-drenched drones through a phaser. Mid-section: the cimbalom breaks into an extended solo \u2014 rapid hammered runs climbing through the augmented second intervals of the Hungarian minor scale, restless and searching. Tempo 74\u201384 BPM. No vocals. The atmosphere of a state-funded studio session where conservatory-trained musicians channeled ancient folk melodies through psychedelic distortion. Pressed in a limited run for domestic distribution, never exported beyond the Eastern Bloc. Loopable and deeply sampleable \u2014 the kind of obscure Eastern European record that sounds like nothing else when chopped and pitched." },
  "P27": { name: "Autobahn Noir", genre: "krautrock", prompt: "Early 1970s German experimental recording, warm precision-engineered tape with a dense midrange character and faint vinyl hiss. A Moog synthesizer locked into a slow hypnotic filter sweep \u2014 the low-pass cutoff opening and closing over an eight-bar cycle, dark and vast. Farfisa organ underneath sustaining a cold Phrygian drone through heavy spring reverb, swirling and disorienting. Electric guitar playing a single repeating note through a ring modulator, metallic and alien. Mid-section: the Moog steps into an extended passage \u2014 the filter fully open, revealing a complex evolving timbre that spirals upward before retreating back beneath the cutoff. Tempo 82\u201392 BPM, relentless and motorik. No vocals. The atmosphere of an endless night highway through industrial Germany. Recorded in a converted farmhouse studio, pressed on a small independent label in a run of 500 copies. Designed to loop indefinitely \u2014 the kind of cold kosmische record a producer would slow down, low-pass filter, and build their most hypnotic record around." },
  "P28": { name: "Anatolian Dust", genre: "turkish-psych", prompt: "Early 1970s Turkish psychedelic recording from Istanbul, saturated analog tape with heavy compression and thick vinyl surface noise. An amplified ba\u011flama locked into a rapid tremolo melody in Hicaz makam \u2014 buzzing, metallic, the microtonal intervals landing in places Western scales cannot reach. Farfisa organ sustaining dark modal chords underneath, thin and slightly sinister. Electric bass played high on the neck following the melodic contour, overdriven and woolly. Mid-section: the ba\u011flama steps into a full extended solo \u2014 the tremolo intensifying, ornamental hammer-ons and pull-offs climbing through the augmented seconds of Hicaz, raw and furious before retreating to the central riff. Tempo 70\u201380 BPM, heavy and swaying. No vocals. Mono mix, dense and punchy. Pressed as a 45 RPM single on a small Turkish label in a run of 500 copies, never distributed outside Anatolia. Built to loop endlessly \u2014 the kind of forgotten Turkish record a serious crate digger would spend decades hunting in an overseas record shop." },
  "P29": { name: "Addis Midnight", genre: "ethio-jazz", prompt: "Early 1970s Ethiopian recording from Addis Ababa, dry close-miked analog tape with minimal reverb and moderate vinyl degradation. A Hammond organ carrying an ornate melody in ambassel mode \u2014 dark, aching, the notes orbiting a tonal center without ever resolving, each phrase heavy with spiritual longing. Tenor saxophone entering with a raw slightly sharp solo, following Ethiopian melodic contours with heavy vibrato and ornamental turns drawn from vocal traditions. Upright bass playing a simple deep repetitive pattern underneath. Mid-section: the organ steps into an extended passage \u2014 expression pedal swelling, the melody climbing into the upper register with increasing urgency before cycling back to its opening phrase. Tempo 72\u201382 BPM. No vocals. The atmosphere of a dimly-lit Addis Ababa nightclub in 1973. Pressed as a 7-inch single in a quantity of 500 copies on a small Ethiopian label, never exported outside the country. Loopable and hypnotic \u2014 the kind of forgotten African recording a producer would loop two bars of and build something timeless around." },
  "P30": { name: "Accra Gold", genre: "ghana-funk", prompt: "Mid 1970s Ghanaian highlife funk recording from Accra, warm analog tape with bright midrange presence and moderate vinyl surface noise. A clean-toned electric guitar locked into a shimmering two-bar ostinato pattern in natural minor \u2014 bright, percussive, each picked note ringing with a clarity that cuts through the mix. Second guitar underneath playing a rhythmic comping figure with a rolling highlife swing feel. Electric bass walking a melodic counter-line, round and deep. Congas and cowbell weaving a polyrhythmic pattern through the groove. Mid-section: the lead guitar breaks into an extended solo \u2014 pentatonic minor runs with chromatic passing tones, bright and fluid, the picking attack slightly ahead of the beat creating a forward pull. Tempo 92\u2013104 BPM. No vocals. The atmosphere of a packed Accra dance hall in 1975. Pressed on a small Ghanaian label, limited domestic run, surviving copies showing decades of heavy play. Designed to loop \u2014 the kind of bright dusty West African record a producer would pitch down, slow to half-speed, and flip into something that knocks." },
  "P31": { name: "Bombay Reel", genre: "bollywood", prompt: "Early 1970s Bollywood film score recording from Bombay, warm analog tape with a slightly compressed studio sound and moderate vinyl surface noise. A solo sitar carrying a slow ornate melody in a raga-influenced minor scale \u2014 each note bent and sustained with microtonal precision. Lush tremolo string section swelling underneath, tablas weaving a restrained rhythmic pattern, and a distant female vocal humming a wordless melody drenched in reverb. Hammond organ sustaining dark chords in the lower register. Mid-section: the sitar steps into an extended solo passage \u2014 rapid ornamental runs climbing through the scale before retreating to the central motif. Tempo 72\u201382 BPM, hypnotic and swaying. The atmosphere of a dramatic scene in a film that played in Bombay cinemas and nowhere else. Pressed for Indian domestic distribution only, never exported. Loopable and devastating \u2014 the kind of forgotten Bollywood score cue a global crate digger would build entire projects around." },
  "P32": { name: "Paris Noir", genre: "french-library", prompt: "Early 1970s French orchestral recording from a Parisian studio, warm analog tape with subtle room reverb and light vinyl surface noise. A harpsichord playing a slow repeating baroque-influenced figure in harmonic minor \u2014 precise, cold, each note sharp and deliberate. Lush string section underneath sustaining dark cinematic chords. Solo flute entering with a breathy melody floating above the arrangement, melancholic and detached. Nylon-string guitar comping sparse voicings in the background. Mid-section: the flute steps into an extended solo \u2014 the melody climbing through chromatic passing tones with French classical phrasing before retreating to the opening theme. Tempo 74\u201384 BPM. No vocals. The atmosphere of a rain-soaked Paris crime film. Pressed as a library music cue for French broadcast use, 200 copies, never commercially released. Designed to loop \u2014 the kind of elegant forgotten European recording a producer would pitch down and build something cinematic around." },
  "P33": { name: "Sigma Gold", genre: "philly-soul", prompt: "Mid 1970s Philadelphia soul orchestral recording, warm analog tape saturated with the signature sound of a legendary Philly recording studio. A massive string section \u2014 thirty players \u2014 sweeping through a dramatic minor-key arrangement that swells and retreats in emotional waves. Rhodes electric piano underneath playing rich extended chord voicings, live electric bass locked into a slow groove. Full horn section \u2014 trumpet, trombone, tenor saxophone \u2014 playing arranged stabs between the string phrases. Mid-section: the strings drop to silence and a solo flugelhorn plays an exposed melodic phrase \u2014 warm, golden, deeply emotional \u2014 before the full orchestra crashes back in. Tempo 76\u201386 BPM. No vocals. The kind of orchestral soul recording pressed on a Philadelphia independent label in 1975, the B-side that got overlooked. Built to be chopped \u2014 a single string swell from this record becomes the foundation of an anthem." },
  "P34": { name: "Shaft Alley", genre: "blaxploitation", prompt: "Early 1970s American blaxploitation film score recording, analog tape with a slightly gritty studio sound and moderate vinyl surface noise. A wah-wah rhythm guitar chopping a tight syncopated pattern over a deep walking electric bass with a slightly overdriven tone. Harmon-muted trumpet playing a cool minor-key melody \u2014 bluesy, understated, urban. Sparse string section sustaining tension underneath. Hammond B3 organ comping dark chords in the background. Mid-section: the trumpet steps into an extended solo \u2014 breathy, bending notes at the edges, the melody circling through Dorian intervals with late-night city cool. Tempo 82\u201392 BPM. No vocals. The atmosphere of a car chase through a city at midnight in 1973. Composed as a score cue for a crime film that was released regionally and forgotten. Loopable and funky \u2014 the kind of gritty urban score a producer would isolate the wah guitar from and flip into something dangerous." },
  "P35": { name: "Astral Temple", genre: "spiritual-jazz", prompt: "Early 1970s spiritual jazz recording, warm analog tape with a slightly reverberant studio sound and subtle vinyl surface noise. A Rhodes electric piano carrying a slow modal drone in D Dorian \u2014 warm, cosmic, each chord sustained with tremolo and allowed to decay naturally. Solo flute floating above playing a meditative melody that circles without resolving. Upright bass holding sparse root notes, deep and resonant. Congas and finger cymbals weaving a gentle polyrhythmic texture. Mid-section: the Rhodes steps into an extended passage \u2014 the chords opening into wider voicings, the tremolo intensifying, the sound becoming more spacious and devotional before cycling back to the opening drone. Tempo 68\u201378 BPM. No vocals. The atmosphere of a late-night recording session where the musicians were channeling something beyond themselves. Pressed in a quantity of 300 on a small independent jazz label, never reissued. The kind of cosmic jazz record a producer would loop two bars of and build entire worlds around." },
  "P36": { name: "Chrome Love", genre: "synth-funk", prompt: "Early 1980s American synth-funk recording, warm analog synthesizer pads with a polished studio sheen and subtle tape compression. A Prophet synthesizer playing lush extended minor chord voicings \u2014 rich, shimmering, each pad slowly evolving through filter sweeps. Moog bass synthesizer underneath locked into a deep repetitive pattern. Fender Rhodes electric piano adding sparse melodic phrases between the synth pads. Talk box vocal texture floating through the bridge \u2014 not words, just a vocoded human tone, robotic yet emotional. Mid-section: the Prophet steps into an extended passage \u2014 the filter fully open, arpeggiated chords cascading in a slow minor-key sequence before retreating beneath the bass. Tempo 78\u201388 BPM. The atmosphere of a late-night quiet storm radio broadcast in 1983. Pressed on a small independent funk label, limited regional distribution. The kind of polished synth-soul record a producer would slow down, loop the pad, and build something heavy underneath." },
  "P37": { name: "Temple Fist", genre: "kung-fu-score", prompt: "Mid 1970s Hong Kong martial arts film score recording, analog tape with a slightly compressed studio sound and moderate vinyl degradation. A solo erhu carrying a slow pentatonic minor melody \u2014 dark, tense, each bowed note sustaining with a nasal human-voice quality. Chinese percussion \u2014 woodblocks, gongs, and small cymbals \u2014 punctuating dramatic moments with sharp accents. Tremolo strings sustaining underneath in low dissonant clusters. Guzheng plucking sparse arpeggiated figures between the erhu phrases. Mid-section: the erhu steps into an extended passage \u2014 the melody climbing rapidly through the pentatonic scale, bowing intensifying, before dropping to silence and a single gong strike. Tempo 70\u201380 BPM. No vocals. The atmosphere of the moment before a fight scene in a martial arts film from a legendary Hong Kong studio. Pressed for Asian cinema distribution only, never released outside the region. Built to loop \u2014 the kind of forgotten Eastern film score a producer would pitch down and build their most cinematic record around." },
  "P38": { name: "Aegean Ghost", genre: "greek-rebetiko", prompt: "Early 1970s Greek laiko recording from Athens, warm analog tape with heavy midrange saturation and deep vinyl crackle. A solo bouzouki carrying a rapid tremolo melody in a Phrygian-influenced mode \u2014 bright, metallic, each picked note ringing with a Mediterranean intensity. Nylon-string guitar comping dark minor chords underneath in a slow rhythmic pattern. Electric bass following the melodic contour, warm and round. Sparse string section sustaining long tones in the background. Mid-section: the bouzouki breaks into an extended solo \u2014 rapid descending runs through the Phrygian intervals, each phrase more urgent than the last before retreating to the central riff. Tempo 72\u201382 BPM, swaying and hypnotic. No vocals. The atmosphere of a smoky Athens nightclub in 1972. Pressed on a small Greek label, limited domestic run, never distributed outside the Mediterranean. Loopable \u2014 the kind of forgotten Greek recording a crate digger would spend years hunting and flip into something haunting." },
};

// ─── GENRE RULES (for Create Your Own path) ─────────────────────────────────
const GENRE_RULES: Record<string, string> = {
  "boom-bap": `ERA LOCK: Late 1960s\u20131970s. Soul-jazz, hard bop, spiritual jazz, blaxploitation scores, CTI soul-jazz, Stax soul. BPM: 78\u201390. Minor/modal only. Live band, 2-inch tape, upright bass anchor, featured horn or piano solo. Obscurity framing: pressed in small quantities, regional label, found in a crate. End: "the kind of forgotten record [era/aesthetic descriptor, no real names] would spend years hunting in overseas crates and flip into something timeless."`,
  "dark-underground": `ERA LOCK: Late 1960s\u2013early 1970s. Eastern European modal jazz, Italian film score, obscure foreign library records, psychedelic soul. BPM: 63\u201380. Dorian, Phrygian, diminished \u2014 maximum tension, zero resolution. Flute, organ, or harpsichord lead. Heavy vinyl degradation, wow-flutter. End: "the kind of forgotten foreign record a serious crate digger would spend decades hunting in an overseas record shop."`,
  "soul-gospel": `ERA LOCK: Late 1960s Black American gospel and sacred soul. Small church or small studio recording. BPM: 70\u201386. Hammond B3 organ mandatory, full choir harmonies, call-and-response. Hand claps not drums. Raw, imperfect, devotional. "Recorded live in a small church, never commercially distributed." End: "the kind of sacred recording [descriptor] would chop, pitch up, and place underneath something hard to make it feel like church."`,
  "jazz": `ERA LOCK: Early 1970s small ensemble jazz. Regional jazz label. BPM: 82\u201396. Upright bass walking line anchor, muted trumpet or tenor saxophone lead, dry room acoustics, analog tape hiss. Minor or Dorian. Late-night intimate feel. "Pressed in small quantities for local distribution." End: "the kind of warm dusty record [descriptor] would loop two bars of and build entire worlds around."`,
  "latin": `ERA LOCK: Late 1960s New York Latin soul orchestral. Small NYC indie label for Spanish-speaking audience. BPM: 74\u201386. Dramatic dark string section, wordless female vocal hum as texture only, sparse congas and timbales, muted brass. Very cinematic, barrio midnight feeling. End: "the kind of orchestral Latin soul recording [descriptor] would loop and transform into something devastating."`,
  "japanese": `ERA LOCK: Late 1970s Japanese soul (Wamono). Small regional Japanese label, never exported. BPM: 76\u201386. Muffled Rhodes or electric piano, light bass that sits back, minimal brushed drums, reverb-soaked distant female vocal floating above the mix, flute or vibraphone accents. 3am Tokyo city feeling. End: "the kind of obscure Japanese pressing [descriptor] would discover and flip into something completely transformed."`,
  "brazilian": `ERA LOCK: Late 1970s Brazilian jazz-fusion. S\u00e3o Paulo small regional label, never exported outside Brazil. BPM: 88\u2013100. Rhodes piano with Brazilian harmonic sensibility, surdo and pandeiro percussion, breathy flute or nylon-string guitar, wordless female vocal hum, humid room sound. Afro-Brazilian rhythmic pulse. End: "the kind of record [descriptor] would change their life the first time they heard it in a crate in S\u00e3o Paulo."`,
  "italian-film": `ERA LOCK: Early 1970s Italian Poliziotteschi crime film or giallo horror score. Roman studio, pressed for cinema distribution only. BPM: 65\u201382. Wah-wah rhythm guitar, overdriven walking bass, flute or harpsichord or tremolo strings, sparse Hammond stabs. Eerie and funky simultaneously. "Never released commercially outside Italian cinema." End: "the kind of forgotten European score cue [descriptor] would pitch down, slow, and loop into something that hits like a freight train."`,
  "soulful-house": `ERA LOCK: Early 1990s NYC underground soulful house. BPM: 118\u2013128. Four-on-the-floor implied, gospel piano upbeat stabs, Hammond B3, live bass, full choir harmonies, congas alongside drum machine. Spiritual and physical simultaneously. Church-trained female vocal. End: "the kind of record [descriptor] would drop at 4am and make the room levitate."`,
  "disco-house": `ERA LOCK: Late 1990s French-influenced disco house. BPM: 120\u2013126. Four-on-the-floor implied, filter sweep on bass opening and closing over the 8-bar cycle, lush 1970s disco strings, wah rhythm guitar, brass stabs, vocal chop as instrument. The filter movement is the defining element. Euphoric, sleek. End: "the kind of record [descriptor] would loop for eight minutes without losing momentum."`,
  "tv-score": `ERA LOCK: Early 1970s American television crime drama score cue. Three sections: sparse electric piano intro \u2192 wah-wah guitar groove with muted brass \u2192 strip back to piano. BPM: 82\u201396. Surveillance scene feeling, city at 2am. Written to loop under dialogue. "Composed for a gritty weekly crime drama on a major American network, 1972." End: "the kind of TV score cue [descriptor] would isolate, chop, and pitch into something completely unrecognizable and dangerous."`,
  "cinematic-dark": `ERA LOCK: Late 1980s\u2013early 1990s orchestral. Simple 4\u20138 note piano melody in natural minor. Long slow string pads as patient presence. Deep resonant cello. BPM: 65\u201380. Silence between notes. Emotional ambiguity. Analog warmth without heavy vinyl degradation. End: "the kind of orchestral source material [descriptor] would low-pass filter and build their most emotional record around."`,
  "drum-break": `ERA LOCK: 1970s live funk drum performance. NO melody, NO harmony, NO bass \u2014 pure drums. Three-act structure: locked groove \u2192 extended solo breakdown (snare rolls, tom fills, open hi-hat splashes, 8\u201316 bars pure percussive improvisation) \u2192 groove return. BPM: 95\u2013108. Raw room acoustics, minimal mic placement, human rushing and dragging. End: "the kind of isolated drum performance where the solo section alone can be chopped into dozens of separate hits and loops."`,
  "chipmunk": `ERA LOCK: Early 1960s girl group soul recording. Designed to be sped up. BPM: 108\u2013120 source (will chipmunk to 130\u2013145). Bright and clear. Call-and-response female harmonies, horn stabs, bouncy minor key progression. "Regional 45 single, local airplay only." End: "the kind of bright regional 45 [descriptor] would speed up, pitch up, and transform into something buoyant and undeniable."`,
  "marching-band": `ERA LOCK: Early 1970s college marching band live stadium recording. 60\u201380 horns in unison. BPM: 68\u201380, slow and majestic. Minor-to-major emotional arc. Dynamic: low brass foundation \u2192 full eruption \u2192 single trumpet soloist \u2192 full ensemble crash. Outdoor field microphones, crowd noise. End: "the kind of live brass recording [descriptor] would isolate a single horn stab from and place under a rolling 808 to make something feel enormous."`,
  "modern-trap": `ERA LOCK: Late 1980s\u2013early 1990s orchestral. Simple haunting 4\u20138 note piano melody in natural minor. String pads as background texture, deep cello, silence between notes. BPM: 65\u201380 source (doubles to 130\u2013140 trap range). Emotional ambiguity \u2014 works under introspective verses and drops. Analog warmth without heavy vinyl degradation. End: "the kind of simple orchestral source material [descriptor] would loop, filter, and place under 808s to make something emotionally overwhelming."`,
  "polish-jazz": `ERA LOCK: Early 1970s Warsaw. Cold Eastern European jazz, crystalline piano, Harmon-muted trumpet. BPM: 72\u201382. Dorian or Phrygian. Metallic room reverb, state-owned label, never exported outside Eastern Europe. End: "the kind of cold dusty record a serious producer would loop two bars of and build entire worlds around."`,
  "israeli-psych": `ERA LOCK: Early 1970s Tel Aviv. Israeli psychedelic folk. Oud in Hijaz scale, bouzouki tremolo, spring reverb guitar. BPM: 68\u201378. Hijaz, Bayati, or Saba maqam \u2014 microtonal intervals that land between Western tuning. Small indie pressing, never distributed outside Israel. End: "the kind of forgotten Middle Eastern recording a crate digger would spend years hunting and flip into something devastating."`,
  "hungarian-psych": `ERA LOCK: Mid 1970s Budapest. Hungarian psychedelic folk-rock. Cimbalom as lead instrument, t\u00e1rogat\u00f3, fuzz guitar drones through phaser. BPM: 74\u201384. Hungarian minor scale \u2014 raised 4th and natural 7th with minor 3rd. State-funded recording, limited domestic run, never exported beyond Eastern Bloc. End: "the kind of obscure Eastern European record that sounds like nothing else when chopped and pitched."`,
  "krautrock": `ERA LOCK: Early 1970s Germany. Kosmische experimental. Moog synthesizer filter sweeps, Farfisa organ drones, ring-modulated guitar. BPM: 82\u201392. Dorian, Phrygian, or pure drone. Motorik pulse implied. Converted farmhouse studio, small independent label, 500 copies. End: "the kind of cold kosmische record a producer would slow down, low-pass filter, and build their most hypnotic record around."`,
  "turkish-psych": `ERA LOCK: Early 1970s Istanbul. Anadolu psych rock. Amplified ba\u011flama in Hicaz makam, Farfisa organ, overdriven bass. BPM: 70\u201380. Hicaz, Nihavend, or K\u00fcrdi makam \u2014 microtonal intervals impossible on Western instruments. Mono mix, saturated tape, 45 RPM single, 500 copies, never distributed outside Anatolia. End: "the kind of forgotten Turkish record a serious crate digger would spend decades hunting in an overseas record shop."`,
  "ethio-jazz": `ERA LOCK: Early 1970s Addis Ababa. Ethiopian jazz-funk. Hammond organ in ambassel or tezeta mode, raw tenor saxophone, dry close-miked recording. BPM: 72\u201382. Ethiopian pentatonic modes \u2014 unresolved, orbiting without arriving. 7-inch single, 500 copies, small Ethiopian label, never exported. End: "the kind of forgotten African recording a producer would loop two bars of and build something timeless around."`,
  "ghana-funk": `ERA LOCK: Mid 1970s Accra. Ghanaian highlife funk. Clean-toned electric guitar ostinato, second rhythm guitar, walking melodic bass, congas and cowbell. BPM: 92\u2013104. Minor pentatonic with chromatic passing tones. Bright midrange, polyrhythmic. Small Ghanaian label, limited domestic run. End: "the kind of bright dusty West African record a producer would pitch down, slow to half-speed, and flip into something that knocks."`,
  "bollywood": `ERA LOCK: Early 1970s Bombay. Bollywood film score. Solo sitar in raga-influenced minor scale, lush tremolo strings, tablas, distant female vocal hum, Hammond organ. BPM: 72–82. Microtonal bends, raga-influenced ornamentation. Pressed for Indian domestic distribution only, never exported. End: "the kind of forgotten Bollywood score cue a global crate digger would build entire projects around."`,
  "french-library": `ERA LOCK: Early 1970s Paris. French library/broadcast music. Harpsichord, solo flute, lush strings, nylon-string guitar. BPM: 74–84. Harmonic minor, baroque influence, French classical phrasing. Pressed as a library cue for broadcast, 200 copies, never commercially released. End: "the kind of elegant forgotten European recording a producer would pitch down and build something cinematic around."`,
  "philly-soul": `ERA LOCK: Mid 1970s Philadelphia. Orchestral soul. Massive string section (30 players), Rhodes piano, full horn section, flugelhorn solo. BPM: 76–86. Minor keys with dramatic harmonic movement, gospel-influenced chord progressions. Pressed on a Philadelphia independent label, the overlooked B-side. End: "the kind of orchestral soul recording where a single string swell becomes the foundation of an anthem."`,
  "blaxploitation": `ERA LOCK: Early 1970s American urban. Blaxploitation film score. Wah-wah rhythm guitar, walking electric bass, Harmon-muted trumpet, sparse strings, Hammond B3 organ. BPM: 82–92. Dorian mode, bluesy minor key, urban cool. Composed for a crime film released regionally and forgotten. End: "the kind of gritty urban score a producer would isolate the wah guitar from and flip into something dangerous."`,
  "spiritual-jazz": `ERA LOCK: Early 1970s. Spiritual/cosmic jazz. Rhodes electric piano modal drone, solo flute, upright bass, congas, finger cymbals. BPM: 68–78. D Dorian, modal, meditative, unresolved. Pressed in 300 copies on a small independent jazz label, never reissued. End: "the kind of cosmic jazz record a producer would loop two bars of and build entire worlds around."`,
  "synth-funk": `ERA LOCK: Early 1980s American. Synth-funk / quiet storm. Prophet synthesizer pads, Moog bass, Rhodes electric piano, talk box vocal texture. BPM: 78–88. Minor keys with lush extended chord voicings, filter sweeps. Polished studio sheen. Small independent funk label, limited regional distribution. End: "the kind of polished synth-soul record a producer would slow down, loop the pad, and build something heavy underneath."`,
  "kung-fu-score": `ERA LOCK: Mid 1970s Hong Kong. Martial arts film score. Solo erhu, Chinese percussion (woodblocks, gongs, cymbals), tremolo strings, guzheng. BPM: 70–80. Pentatonic minor, dark and tense. Pressed for Asian cinema distribution only, never released outside the region. End: "the kind of forgotten Eastern film score a producer would pitch down and build their most cinematic record around."`,
  "greek-rebetiko": `ERA LOCK: Early 1970s Athens. Greek laiko/rebetiko. Solo bouzouki tremolo, nylon-string guitar, electric bass, sparse strings. BPM: 72–82. Phrygian-influenced mode, Mediterranean intensity. Small Greek label, limited domestic run, never distributed outside the Mediterranean. End: "the kind of forgotten Greek recording a crate digger would spend years hunting and flip into something haunting."`,
};

// ─── SYSTEM PROMPT (same as vibe-prompt) ─────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are the master prompt engineer behind the 130 Mode Prompt Lab \u2014 the most respected AI sample generation prompt library in producer culture. Your prompts produce raw, vintage, sampleable source material for hip-hop and beat producers.

CORE DNA \u2014 NON-NEGOTIABLE RULES FOR EVERY PROMPT:

1. ONE single flowing paragraph. No headers, no labels, no bullet points. Pure prompt text only.
2. HARD MAX 1000 characters. Count carefully. Stay under.
3. NEVER use any real artist name, producer name, musician name, or band name. Suno blocks these.
4. NEVER mention drums, kick, snare, hi-hat, cymbals, or any rhythmic element explicitly. Genre-lock naturally instead ("jazz trio", "soul quartet", "string ensemble").
5. ALWAYS minor scale or modal tonality \u2014 Dorian, Phrygian, harmonic minor, diminished. No major key unless the genre specifically requires it (gospel/house).
6. Instrument names must be PRECISE: "upright bass" not "bass", "Rhodes electric piano" not "keys", "Harmon-muted trumpet" not "trumpet", "Hammond B3 organ" not "organ".
7. ALWAYS include a featured solo instrument or melodic statement.
8. ALWAYS include specific geographic and era framing: not "vintage" but "Late 1960s New York hard bop session" or "Early 1970s Italian film score recorded at a Roman studio".
9. ALWAYS include obscurity/scarcity framing: "pressed in 300 copies on a small regional label", "never distributed outside its home country", "recorded for a film that was never widely released".
10. Designed to feel loopable \u2014 a short harmonic cycle (2, 4, or 8 bars) that repeats hypnotically without fatigue.
11. Emotional register must be specific and evocative \u2014 not "sad" but "weighted with grief that has been carried for years" or "the feeling of a city at 3am when everything is possible and nothing is certain".

THE PROVEN STRUCTURE:
[ERA and SPECIFIC LOCATION] [RECORDING AESTHETIC] \u2014 [specific named instruments, comma-separated] \u2014 recorded at [BPM] BPM \u2014 [minor/modal description with emotional color] \u2014 [featured instrument solo or melodic statement] \u2014 [texture: tape saturation, vinyl surface noise, room character] \u2014 [2\u20133 emotional words] \u2014 [obscurity/scarcity framing] \u2014 designed to feel loopable \u2014 [genre-specific closer phrase with NO real names]

Output ONLY the prompt text. No preamble, no explanation, no quotes around it. Just the raw prompt.`;

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface GenerateMusicRequest {
  promptId?: string;
  vibe?: string;
  genre?: string;
  model: "clip" | "pro";
}

interface LyriaResponsePart {
  text?: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
}

interface LyriaApiResponse {
  candidates?: Array<{
    content?: {
      parts?: LyriaResponsePart[];
    };
    finishReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

interface ClaudeApiResponse {
  content?: Array<{ text: string }>;
  error?: { message: string };
}

// ─── HANDLER ─────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Get real IP (Vercel sets x-forwarded-for)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          ?? req.headers.get("x-real-ip")
          ?? "unknown";

  // Rate limit check
  const limit = checkMusicRateLimit(ip);
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
    const body = await req.json() as GenerateMusicRequest;
    const { promptId, vibe, genre, model } = body;

    // Validate model
    if (model !== "clip" && model !== "pro") {
      return NextResponse.json({ error: "Invalid model. Use 'clip' or 'pro'." }, { status: 400 });
    }

    // Check Gemini key
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API not configured." }, { status: 500 });
    }

    let promptText: string;
    let soundName: string | undefined;

    // ─── PATH A: Proven prompt by ID ───────────────────────────────────────
    if (promptId) {
      const entry = PROVEN_PROMPTS[promptId];
      if (!entry) {
        return NextResponse.json({ error: "Unknown sound." }, { status: 400 });
      }
      promptText = entry.prompt;
      soundName = entry.name;

    // ─── PATH B: Create from vibe + genre ──────────────────────────────────
    } else {
      if (!vibe?.trim()) {
        return NextResponse.json({ error: "Please describe the sound you want." }, { status: 400 });
      }
      if (!genre || !GENRE_RULES[genre]) {
        return NextResponse.json({ error: "Invalid genre." }, { status: 400 });
      }

      // Call Claude Haiku to build the prompt (same pattern as vibe-prompt route)
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicKey) {
        return NextResponse.json({ error: "API not configured." }, { status: 500 });
      }

      const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\nGENRE-SPECIFIC RULES FOR THIS REQUEST:\n${GENRE_RULES[genre]}`;

      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicKey,
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

      const claudeData = await claudeResponse.json() as ClaudeApiResponse;

      if (!claudeResponse.ok) {
        const msg = claudeData.error?.message ?? `Claude API error ${claudeResponse.status}`;
        if (claudeResponse.status === 429) {
          return NextResponse.json({ error: "Claude API quota exceeded. Try again shortly." }, { status: 503 });
        }
        throw new Error(msg);
      }

      promptText = claudeData.content?.[0]?.text?.trim() ?? "";
      if (!promptText) throw new Error("Empty response from Claude.");
    }

    // ─── CALL LYRIA 3 ──────────────────────────────────────────────────────
    const modelId = model === "clip"
      ? (process.env.LYRIA_CLIP_MODEL ?? "lyria-3-clip-preview")
      : (process.env.LYRIA_PRO_MODEL ?? "lyria-3-pro-preview");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

    const lyriaResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptText + "\n\nInstrumental only, no vocals." }] }],
        generationConfig: { responseModalities: ["AUDIO", "TEXT"] },
      }),
    });

    const data = await lyriaResponse.json() as LyriaApiResponse;

    // Handle API-level errors
    if (!lyriaResponse.ok) {
      const msg = data.error?.message ?? `Lyria API error ${lyriaResponse.status}`;
      if (lyriaResponse.status === 429) {
        return NextResponse.json({ error: "Music generation quota exceeded. Try again later." }, { status: 429 });
      }
      if (lyriaResponse.status === 504 || lyriaResponse.status === 408) {
        return NextResponse.json({ error: "Generation took too long. Try the 30-second preview mode." }, { status: 504 });
      }
      throw new Error(msg);
    }

    // Check for safety filter blocks
    const candidate = data.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.length) {
      // Check if safety ratings indicate a block
      const blocked = candidate?.finishReason === "SAFETY"
        || candidate?.safetyRatings?.some(r => r.probability === "HIGH");
      if (blocked) {
        return NextResponse.json(
          { error: "This description was blocked by content filters. Try a different vibe." },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: "No audio was generated. Try a different description." },
        { status: 422 }
      );
    }

    // Extract audio from response parts
    let audioData = "";
    let mimeType = "audio/mpeg";

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        audioData = part.inlineData.data; // base64
        mimeType = part.inlineData.mimeType || "audio/mpeg";
      }
    }

    if (!audioData) {
      return NextResponse.json(
        { error: "No audio data in response. The model may have returned text only." },
        { status: 422 }
      );
    }

    // ─── RETURN (never include prompt text) ────────────────────────────────
    return NextResponse.json(
      {
        audio: audioData,
        mimeType,
        model: model,
        soundName: promptId ? soundName : undefined,
        remaining: limit.remaining ?? 0,
      },
      {
        headers: { "X-RateLimit-Remaining": String(limit.remaining ?? 0) },
      }
    );

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";

    // Detect timeout errors from fetch
    if (msg.includes("timeout") || msg.includes("ETIMEDOUT") || msg.includes("aborted")) {
      return NextResponse.json(
        { error: "Generation took too long. Try the 30-second preview mode." },
        { status: 504 }
      );
    }

    return NextResponse.json({ error: msg.slice(0, 200) }, { status: 500 });
  }
}
