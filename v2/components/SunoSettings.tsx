"use client";

import type { Genre } from "./GenreSelector";

interface Props {
  analysis: string;
  genre: Genre;
}

type VocalGender = "Female" | "Male" | "Instrumental" | "Default";

interface GenrePreset {
  loudness: number;
  clarity: number;
  loudnessLabel: string;
  clarityLabel: string;
}

const GENRE_PRESETS: Record<Genre, GenrePreset> = {
  "boom-bap":       { loudness: 5, clarity: 3, loudnessLabel: "Moderate · vintage dynamics",     clarityLabel: "Warm / lo-fi · tape character"   },
  "house":          { loudness: 6, clarity: 5, loudnessLabel: "Medium · analog warmth",           clarityLabel: "Balanced · soulful depth"         },
  "trap":           { loudness: 8, clarity: 7, loudnessLabel: "Loud · dense & compressed",        clarityLabel: "Clean · cold and sharp"           },
  "baltimore-club": { loudness: 8, clarity: 6, loudnessLabel: "Loud · high-energy punchy",        clarityLabel: "Bright · staccato attack"         },
  "gospel":         { loudness: 5, clarity: 4, loudnessLabel: "Moderate · raw church warmth",     clarityLabel: "Warm / lo-fi · room ambience"     },
  "jazz-soul":      { loudness: 4, clarity: 3, loudnessLabel: "Soft · late night intimacy",       clarityLabel: "Warm / dusty · analog tape hiss"  },
  "latin-soul":     { loudness: 5, clarity: 5, loudnessLabel: "Moderate · orchestral dynamics",   clarityLabel: "Balanced · cinematic warmth"      },
  "cinematic-dark":     { loudness: 6, clarity: 4, loudnessLabel: "Medium · hollow studio tension",   clarityLabel: "Dark / cold · analog menace"      },
  "italian-film":       { loudness: 4, clarity: 4, loudnessLabel: "Soft · cinematic dynamics",        clarityLabel: "Warm · European tape character"    },
  "dark-underground":   { loudness: 5, clarity: 3, loudnessLabel: "Moderate · cold and sparse",       clarityLabel: "Dark · concrete room reverb"       },
  "psych-soul":         { loudness: 4, clarity: 3, loudnessLabel: "Soft · woozy tape warble",         clarityLabel: "Hazy · psychedelic lo-fi"          },
  "middle-east":        { loudness: 5, clarity: 4, loudnessLabel: "Moderate · orchestral presence",   clarityLabel: "Warm · analog Middle Eastern"      },
  "soul-vocal":         { loudness: 5, clarity: 5, loudnessLabel: "Moderate · vocal-forward",         clarityLabel: "Balanced · intimate studio"        },
  "chipmunk-soul":      { loudness: 6, clarity: 5, loudnessLabel: "Medium · mono AM radio",           clarityLabel: "Bright · 45 RPM energy"           },
  "drum-break":         { loudness: 7, clarity: 4, loudnessLabel: "Loud · raw room sound",            clarityLabel: "Warm · overhead mic ambience"      },
  "tv-score":           { loudness: 4, clarity: 5, loudnessLabel: "Soft · broadcast standard",        clarityLabel: "Balanced · functional clarity"     },
  "japanese-soul":      { loudness: 4, clarity: 5, loudnessLabel: "Soft · pristine analog",           clarityLabel: "Clean · Japanese studio quality"    },
  "afrobeat":           { loudness: 7, clarity: 4, loudnessLabel: "Loud · relentless energy",         clarityLabel: "Warm · Lagos studio character"     },
  "reggae-dub":         { loudness: 5, clarity: 3, loudnessLabel: "Moderate · spacious dub",          clarityLabel: "Deep · spring reverb & delay"      },
  "brazilian":          { loudness: 4, clarity: 5, loudnessLabel: "Soft · intimate warmth",           clarityLabel: "Balanced · analog Brazilian"       },
  "boom-bap-dark":      { loudness: 6, clarity: 3, loudnessLabel: "Medium · cold menacing",           clarityLabel: "Dark · sparse and ominous"         },
  "motown":             { loudness: 6, clarity: 5, loudnessLabel: "Medium · Detroit compression",     clarityLabel: "Bright · tambourine shimmer"       },
  "live-funk":          { loudness: 7, clarity: 3, loudnessLabel: "Loud · raw live energy",           clarityLabel: "Warm · gymnasium acoustics"        },
  "soviet-estrada":     { loudness: 5, clarity: 3, loudnessLabel: "Moderate · Soviet mid-heavy warmth", clarityLabel: "Warm / dense · state studio EQ"  },
  "yugoslav-funk":      { loudness: 6, clarity: 5, loudnessLabel: "Medium · raw room energy",           clarityLabel: "Balanced · Eastern European grit" },
  "south-african-jazz": { loudness: 5, clarity: 4, loudnessLabel: "Moderate · township energy",        clarityLabel: "Warm / bright · live room bleed"   },
  "afro-cuban-jazz":    { loudness: 6, clarity: 5, loudnessLabel: "Medium · Havana session warmth",    clarityLabel: "Balanced · analog Cuban studio"    },
  "korean-psych":       { loudness: 6, clarity: 4, loudnessLabel: "Medium · psychedelic saturation",   clarityLabel: "Dark / warm · distorted tape"      },
  "japanese-jazz-funk": { loudness: 5, clarity: 5, loudnessLabel: "Moderate · precise studio craft",   clarityLabel: "Balanced · clean analog warmth"    },
  "algerian-rai":       { loudness: 5, clarity: 2, loudnessLabel: "Moderate · cassette-saturated heat", clarityLabel: "Lo-fi / raw · Oran market tape"   },
  "moroccan-gnawa":     { loudness: 5, clarity: 3, loudnessLabel: "Moderate · trance ceremony depth",  clarityLabel: "Warm / deep · natural room sound"  },
  "haitian-voodoo-jazz": { loudness: 5, clarity: 3, loudnessLabel: "Moderate · tropical studio warmth", clarityLabel: "Warm / humid · Caribbean lo-fi"   },
};

const VOCAL_NOTES: Record<VocalGender, string> = {
  Female:       "Detected in analysis",
  Male:         "Detected in analysis",
  Instrumental: "No vocals in source",
  Default:      "Could not detect — check analysis",
};

function detectVocalGender(analysis: string): VocalGender {
  const t = analysis.toLowerCase();
  if (/\b(instrumental|no vocal|no vocals|no singing)\b/.test(t)) return "Instrumental";
  if (/\b(female|woman|soprano|mezzo|contralto|alto)\b/.test(t)) return "Female";
  // check "male" without also catching "female"
  if (/\b(male|baritone|tenor|bass voice|bass vocal|bass singer|man's voice|male vocal)\b/.test(t)) return "Male";
  return "Default";
}

function Bar({ value }: { value: number }) {
  return (
    <div className="h-[3px] rounded-full bg-[#111820] overflow-hidden mt-2.5 mb-2">
      <div
        className="h-full rounded-full bg-[#c9a84c] transition-all duration-700"
        style={{ width: `${(value / 10) * 100}%` }}
      />
    </div>
  );
}

export default function SunoSettings({ analysis, genre }: Props) {
  const vocal   = detectVocalGender(analysis);
  const preset  = GENRE_PRESETS[genre];
  const isInstr = vocal === "Instrumental";

  return (
    <div className="rounded-2xl border border-[#1a2030] bg-[#0d1118] overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-[#111820] flex items-center gap-3">
        <span className="text-[#c9a84c] text-[14px] leading-none flex-shrink-0">♪</span>
        <div>
          <p className="font-['Syne',sans-serif] font-bold text-[10px] tracking-[2.5px] uppercase text-[#eef2f7]">
            Suno · Recommended Settings
          </p>
          <p className="text-[9px] font-mono text-[#3d4d5c] mt-0.5">
            Paste the prompt into the{" "}
            <span className="text-[#c9a84c]">Styles</span> field, then apply these in{" "}
            <span className="text-[#4a5a70]">More Options</span>
          </p>
        </div>
      </div>

      {/* Three-column settings */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#111820]">

        {/* Vocal Gender */}
        <div className="px-5 py-5">
          <p className="text-[8px] font-mono tracking-[2.5px] uppercase text-[#3d4d5c] mb-3">
            Vocal Gender
          </p>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={[
                "w-2 h-2 rounded-full flex-shrink-0",
                isInstr || vocal === "Default"
                  ? "bg-[#2a3545]"
                  : "bg-[#c9a84c] shadow-[0_0_6px_rgba(201,168,76,0.5)]",
              ].join(" ")}
            />
            <span className="font-['Syne',sans-serif] font-bold text-[17px] text-[#eef2f7] leading-none">
              {isInstr ? "None" : vocal}
            </span>
          </div>
          <p className="text-[9px] font-mono text-[#3d4d5c]">{VOCAL_NOTES[vocal]}</p>
        </div>

        {/* Loudness */}
        <div className="px-5 py-5">
          <p className="text-[8px] font-mono tracking-[2.5px] uppercase text-[#3d4d5c] mb-3">
            Loudness
          </p>
          <span className="font-['Syne',sans-serif] font-bold text-[17px] text-[#eef2f7] leading-none">
            {preset.loudness}
            <span className="text-[11px] text-[#3d4d5c] font-mono"> / 10</span>
          </span>
          <Bar value={preset.loudness} />
          <p className="text-[9px] font-mono text-[#3d4d5c]">{preset.loudnessLabel}</p>
        </div>

        {/* Clarity */}
        <div className="px-5 py-5">
          <p className="text-[8px] font-mono tracking-[2.5px] uppercase text-[#3d4d5c] mb-3">
            Clarity
          </p>
          <span className="font-['Syne',sans-serif] font-bold text-[17px] text-[#eef2f7] leading-none">
            {preset.clarity}
            <span className="text-[11px] text-[#3d4d5c] font-mono"> / 10</span>
          </span>
          <Bar value={preset.clarity} />
          <p className="text-[9px] font-mono text-[#3d4d5c]">{preset.clarityLabel}</p>
        </div>

      </div>
    </div>
  );
}
