# Prompt DNA Formula

This is the canonical formula for adding new Booman Lab prompt-library entries.
The goal is not to ask Suno for a finished beat. The goal is to generate an
obscure, sampleable source record that sounds like it already existed on tape,
vinyl, cassette, film reel, broadcast library, archive pressing, or private
label release.

## Non-Negotiable Rules

Every prompt must obey all of these rules:

1. One paragraph only. No headings, labels, bullets, or line breaks inside the prompt.
2. Hard max 1000 characters. Target 850-950 characters so edits do not break the limit.
3. Never use real artist, producer, musician, band, label, or celebrity names.
4. Never mention explicit rhythmic elements. Avoid drums, kick, snare, hi-hat, 808, drum machine, trap hats, or beat terms. Genre-lock through ensemble, era, region, and source-record context instead.
5. Always use minor or modal tonality and name the emotional color.
6. Use precise instrument names. Never use generic terms like keys, bass, strings, synth, horn, or guitar when a specific instrument is possible.
7. Include a featured instrument solo, motif, phrase, or melodic statement.
8. Always name both geography and era.
9. Include obscurity and scarcity framing.
10. Make it loopable by design.
11. Build in weirdness through unusual source context, tuning, instrumentation, room, medium, culture, and scarcity.
12. Set Suno Weirdness and Style Influence intentionally for each prompt.

## Proven Structure

Use this exact structure as the starting point:

```text
[ERA + LOCATION] [RECORDING AESTHETIC] - [precise instruments] - [BPM range] - [key/mode + emotional color] - [featured solo or melodic statement] - [texture anchors] - [emotional words] - [scarcity framing] - loopable - [closer phrase, no real names]
```

This structure is a checklist, not punctuation law. The finished prompt should
read as one natural paragraph under 1000 characters.

## Required DNA Fields

Define these before writing a new genre pack:

```text
Genre:
Source-record target:
Era:
Location:
Scene or release context:
Core instruments:
Forbidden generic terms:
Allowed modes/scales:
Emotional color:
BPM range:
Recording medium:
Texture anchors:
Weirdness source:
Obscurity/scarcity story:
Loop shape:
Suno Weirdness:
Suno Style Influence:
Closer phrase:
```

## Character Budget

Use this budget to stay under 1000 characters:

- Era, place, source context: 110-150 characters
- Recording texture and medium: 80-120 characters
- Instruments and arrangement: 220-300 characters
- Mode, emotional color, and hook: 120-180 characters
- Featured solo or motif: 100-150 characters
- Scarcity and obscurity framing: 120-180 characters
- Loopability and closer: 100-150 characters

If the prompt is over 1000 characters, cut adjectives first. Keep era, place,
instruments, mode, hook, scarcity, and loopability.

## Weirdness

Weirdness should create variation without turning the output into random novelty.
Do not write "weird music." Make the source record strange in a musically useful way.

Strong weirdness levers:

- Rare regional scene or overlooked country
- Non-Western or regional scales
- Microtonal drift or imperfect tuning
- Unusual featured instrument
- Damaged or mysterious recording medium
- Strange room acoustics
- State archive, shelved film, private press, radio transcription, or unlabeled acetate
- A flawed loop artifact that becomes musical

Recommended Suno Weirdness ranges:

- 25-40: cleaner, faithful genre source records
- 40-60: balanced sample-library prompt
- 60-75: darker, stranger, more regional or cinematic prompts
- 75-90: experimental archive, psych, horror, unknown-origin, or microtonal prompts

Avoid going high-weirdness unless the prompt still has a clear instrument hook and loop shape.

## Style Influence

Style Influence should control how tightly Suno follows the source-record identity.
Use higher values when the prompt depends on era, geography, instrumentation, or mode.
Use lower values when variation is more important than strict scene accuracy.

Recommended Suno Style Influence ranges:

- 45-60: loose exploration, broad vibe
- 60-75: balanced prompt-library default
- 75-88: strict source-record identity
- 88-95: highly specific regional, cinematic, or instrument-locked prompt

For most Booman Lab library prompts, start near:

```text
W: 55-75%
SI: 68-85%
```

Dark-underground, horror-score, foreign-archive, and unknown-origin prompts can push:

```text
W: 75-90%
SI: 72-88%
```

## Instrument Precision

Use this level of specificity:

```text
Generic: keys
Better: electric piano
Best: Rhodes electric piano

Generic: organ
Better: Hammond organ
Best: Hammond B3 organ with slow Leslie speaker rotation

Generic: bass
Better: upright bass
Best: bowed upright bass holding a low drone

Generic: trumpet
Better: muted trumpet
Best: Harmon-muted trumpet entering from silence

Generic: guitar
Better: wah-wah guitar
Best: wah-wah rhythm guitar through spring reverb

Generic: strings
Better: cello and violins
Best: solo cello counter-line under tremolo string section
```

## Genre-Lock Instead Of Rhythm Terms

Do not describe modern beat mechanics. Describe the source record:

```text
Bad: dark boom bap beat with dusty drums and hard snares
Good: early 1970s Eastern European modal jazz recording with Rhodes electric piano, bowed upright bass, warped tape, and a two-bar Phrygian motif built to loop

Bad: trap melody with 808s and hi-hats
Good: late 1980s dark orchestral source recording with sparse piano, deep cello drone, and a short natural-minor phrase designed to sit under heavy modern production
```

## Scarcity Framing

Every prompt needs a reason the record feels found, rare, and sampleable:

```text
pressed in 300 copies on a small regional label
recorded for a film that was shelved before release
state archive pressing, never commercially distributed
private acetate with a water-damaged handwritten sleeve
radio transcription disc never sold to the public
domestic-only pressing that never left its home country
the overlooked B-side on a regional 45
```

## Loopability

Loopability must be explicit and musical:

```text
a two-bar motif returning without resolution
a four-bar harmonic descent that cycles back into itself
an eight-bar melody that gains weight through repetition
a short modal phrase built to repeat hypnotically without fatigue
```

## Closer Phrase

End with a producer-use closer, but never use real names:

```text
the kind of forgotten record a serious crate digger would loop two bars of and build an entire world around
the kind of cold European score cue a producer would pitch down and turn into something dangerous
the kind of regional private-press soul record built to be chopped, pitched, and transformed
the kind of unknown archive recording that makes every producer ask where it came from
```

## Final Template

```text
[Era + place + source scene] recording, [medium/texture]. [Precise lead instrument] playing [specific motif or melody] in [mode/key] - [emotional color]. [Supporting precise instruments] creating [arrangement detail]. Mid-section: [featured instrument] steps forward with [solo/melodic statement]. Tempo [range] BPM. [Room/studio/medium character]. Pressed/released as [scarcity story], never widely distributed. Designed to loop - [two/four/eight-bar loop shape]. The kind of [source-record type] a producer would [sample action] into something [emotional payoff].
```

## Example Skeleton

```text
Early 1970s [city/country] [source scene] recording, [analog texture]. [Precise instrument] playing a [number]-note [mode] motif - [emotional color]. [Supporting instruments] sit underneath with [arrangement behavior]. Mid-section: [featured instrument] enters with [solo or phrase]. Tempo [range] BPM. [Room or medium flaw]. Pressed in [quantity] on [regional/state/private] label, never distributed outside [place]. Designed to loop - [loop shape]. The kind of [rare source] a producer would [flip/chop/pitch/loop] into something [payoff].
```

