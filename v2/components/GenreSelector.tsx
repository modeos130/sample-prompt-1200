"use client";

export type Genre = "boom-bap" | "house" | "trap";

interface GenreConfig {
  id: Genre;
  label: string;
  sub: string;
  bpm: string;
  era: string;
  tags: string[];
}

const GENRES: GenreConfig[] = [
  {
    id: "boom-bap",
    label: "Boom Bap",
    sub: "Hip Hop",
    bpm: "78–90 BPM",
    era: "Late 60s / 70s",
    tags: ["Soul-Jazz", "Hard Bop", "Crate Dig"],
  },
  {
    id: "house",
    label: "House",
    sub: "Music",
    bpm: "118–128 BPM",
    era: "Late 70s / 80s",
    tags: ["Deep House", "Gospel Soul", "Dance Floor"],
  },
  {
    id: "trap",
    label: "Trap",
    sub: "Music",
    bpm: "65–75 BPM",
    era: "70s–90s Dark Cinematic",
    tags: ["Gothic Orchestral", "Dark Ambient", "Cinematic"],
  },
];

interface Props {
  selected: Genre | null;
  onSelect: (genre: Genre) => void;
}

export default function GenreSelector({ selected, onSelect }: Props) {
  return (
    <div className="w-full">
      <div className="mb-5">
        <p className="text-[9px] font-mono font-medium tracking-[3px] uppercase text-[#c9a84c] mb-1">
          Select Your Mode
        </p>
        <p className="text-[11px] text-[#7e8fa0] font-mono">
          Choose a genre — the analysis and prompt will be tailored to its producers and aesthetic.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {GENRES.map((g) => {
          const isSelected = selected === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelect(g.id)}
              className={[
                "relative flex flex-col items-start text-left p-4 rounded-[10px] border transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[#c9a84c] focus:ring-offset-0",
                isSelected
                  ? "bg-[rgba(201,168,76,0.08)] border-[#c9a84c] shadow-[0_0_0_1px_rgba(201,168,76,0.2)]"
                  : "bg-[#141820] border-[#1e2530] hover:border-[#364452] hover:bg-[#1a1f28]",
              ].join(" ")}
            >
              {/* selected indicator */}
              {isSelected && (
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#c9a84c]" />
              )}

              {/* genre name */}
              <span
                className={[
                  "font-['Syne',sans-serif] font-bold text-[22px] leading-none tracking-tight",
                  isSelected ? "text-[#c9a84c]" : "text-[#d8e2ec]",
                ].join(" ")}
              >
                {g.label}
              </span>
              <span
                className={[
                  "font-['Syne',sans-serif] font-bold text-[11px] leading-none mt-0.5 mb-3",
                  isSelected ? "text-[#7a6230]" : "text-[#3d4d5c]",
                ].join(" ")}
              >
                {g.sub}
              </span>

              {/* meta */}
              <span className="text-[9px] font-mono text-[#7e8fa0] mb-1">{g.bpm}</span>
              <span className="text-[9px] font-mono text-[#3d4d5c] mb-3">{g.era}</span>

              {/* tags */}
              <div className="flex flex-wrap gap-1">
                {g.tags.map((t) => (
                  <span
                    key={t}
                    className={[
                      "text-[7.5px] font-mono px-1.5 py-0.5 rounded border",
                      isSelected
                        ? "text-[#c9a84c] border-[rgba(201,168,76,0.3)] bg-[rgba(201,168,76,0.06)]"
                        : "text-[#3d4d5c] border-[#1e2530] bg-[#141820]",
                    ].join(" ")}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
