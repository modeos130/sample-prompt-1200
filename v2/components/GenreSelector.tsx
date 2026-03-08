"use client";

export type Genre = "boom-bap" | "house" | "trap" | "baltimore-club";

interface GenreConfig {
  id: Genre;
  label: string;
  sub: string;
  bpm: string;
  era: string;
  tags: string[];
  num: string;
}

const GENRES: GenreConfig[] = [
  {
    id: "boom-bap",
    label: "Boom Bap",
    sub: "Hip Hop",
    bpm: "78–90 BPM",
    era: "Late 60s / 70s",
    tags: ["Soul-Jazz", "Hard Bop", "Crate Dig"],
    num: "01",
  },
  {
    id: "house",
    label: "House",
    sub: "Music",
    bpm: "118–128 BPM",
    era: "Late 70s / 80s",
    tags: ["Deep House", "Gospel Soul", "Dance Floor"],
    num: "02",
  },
  {
    id: "trap",
    label: "Trap",
    sub: "Music",
    bpm: "65–75 BPM",
    era: "70s–90s Dark Cinematic",
    tags: ["Gothic Orchestral", "Dark Ambient", "Cinematic"],
    num: "03",
  },
  {
    id: "baltimore-club",
    label: "Baltimore",
    sub: "Club Music",
    bpm: "130–145 BPM",
    era: "Late 70s / Early 80s",
    tags: ["Up-Tempo Funk", "Staccato Soul", "Party Floor"],
    num: "04",
  },
];

interface Props {
  selected: Genre | null;
  onSelect: (genre: Genre) => void;
}

export default function GenreSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
      {GENRES.map((g, i) => {
        const isSelected = selected === g.id;
        const staggerClass =
          i === 0 ? "animate-stagger-1" :
          i === 1 ? "animate-stagger-2" :
          i === 2 ? "animate-stagger-3" :
          "animate-stagger-3";
        return (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={[
              "relative flex flex-col text-left p-7 rounded-2xl border-2 transition-all duration-200 overflow-hidden",
              "focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:ring-offset-2 focus:ring-offset-[#080a0c]",
              "min-h-[230px]",
              staggerClass,
              isSelected
                ? "border-[#c9a84c] bg-[#0d1118] shadow-[0_0_80px_rgba(201,168,76,0.18),0_0_0_1px_rgba(201,168,76,0.1)_inset]"
                : "border-[#141c28] bg-[#0a0d14] hover:border-[#1e2838] hover:bg-[#0f1420] hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)]",
            ].join(" ")}
          >
            {/* Large ghost number — fluid size */}
            <span
              className={[
                "absolute -bottom-3 right-3 font-['Syne',sans-serif] font-extrabold leading-none select-none pointer-events-none transition-colors duration-200",
                "text-[clamp(60px,10vw,100px)]",
                isSelected ? "text-[rgba(201,168,76,0.07)]" : "text-[#0d1118]",
              ].join(" ")}
            >
              {g.num}
            </span>

            {/* Selected dot */}
            {isSelected && (
              <span className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.7)] animate-pulse-subtle" />
            )}

            {/* Content */}
            <div className="relative flex flex-col h-full gap-0">

              {/* Genre name */}
              <span
                className={[
                  "font-['Syne',sans-serif] font-extrabold leading-none tracking-tight block transition-colors duration-200",
                  g.label.length > 6 ? "text-[32px]" : "text-[40px]",
                  isSelected ? "text-[#c9a84c]" : "text-[#eef2f7]",
                ].join(" ")}
              >
                {g.label}
              </span>
              <span
                className={[
                  "font-['Syne',sans-serif] font-bold text-[11px] leading-none mt-1.5 mb-6 block transition-colors duration-200",
                  isSelected ? "text-[#c9a84c]/60" : "text-[#2a3545]",
                ].join(" ")}
              >
                {g.sub}
              </span>

              {/* Spacer */}
              <div className="flex-1" />

              {/* BPM */}
              <div
                className={[
                  "text-[12px] font-mono font-medium mb-1 transition-colors duration-200",
                  isSelected ? "text-[#c9a84c]" : "text-[#4a5a70]",
                ].join(" ")}
              >
                {g.bpm}
              </div>
              <div
                className={[
                  "text-[10px] font-mono mb-5 transition-colors duration-200",
                  isSelected ? "text-[#7a6230]" : "text-[#2a3545]",
                ].join(" ")}
              >
                {g.era}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {g.tags.map((t) => (
                  <span
                    key={t}
                    className={[
                      "text-[8px] font-mono px-2.5 py-1 rounded-full border transition-all duration-200",
                      isSelected
                        ? "text-[#c9a84c] border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.09)]"
                        : "text-[#2a3545] border-[#141c28] bg-[#0a0d14]",
                    ].join(" ")}
                  >
                    {t}
                  </span>
                ))}
              </div>

            </div>
          </button>
        );
      })}
    </div>
  );
}
