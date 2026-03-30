"use client";

export type Genre =
  | "boom-bap"
  | "house"
  | "trap"
  | "baltimore-club"
  | "gospel"
  | "jazz-soul"
  | "latin-soul"
  | "cinematic-dark"
  | "soviet-estrada"
  | "yugoslav-funk"
  | "south-african-jazz"
  | "afro-cuban-jazz"
  | "korean-psych"
  | "japanese-jazz-funk"
  | "algerian-rai"
  | "moroccan-gnawa"
  | "haitian-voodoo-jazz";

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
    id: "jazz-soul",
    label: "Jazz Soul",
    sub: "Small Ensemble",
    bpm: "82–96 BPM",
    era: "Early 1970s",
    tags: ["Regional Label", "Late Night", "Loop Dig"],
    num: "02",
  },
  {
    id: "gospel",
    label: "Gospel",
    sub: "Sacred Soul",
    bpm: "70–86 BPM",
    era: "Late 1960s",
    tags: ["Hammond B3", "Choir", "Black Church"],
    num: "03",
  },
  {
    id: "latin-soul",
    label: "Latin Soul",
    sub: "Orchestral",
    bpm: "74–86 BPM",
    era: "Late 1960s NYC",
    tags: ["Strings", "Barrio", "Cinematic"],
    num: "04",
  },
  {
    id: "cinematic-dark",
    label: "Cinematic",
    sub: "Dark European",
    bpm: "65–82 BPM",
    era: "Early 70s Europe",
    tags: ["Giallo", "Library", "Film Score"],
    num: "05",
  },
  {
    id: "trap",
    label: "Trap",
    sub: "Dark Orchestral",
    bpm: "65–75 BPM",
    era: "70s–90s Cinematic",
    tags: ["Gothic Orchestral", "Dark Ambient", "Half-Time"],
    num: "06",
  },
  {
    id: "house",
    label: "House",
    sub: "Soulful",
    bpm: "118–128 BPM",
    era: "Late 70s / 80s",
    tags: ["Deep House", "Gospel Soul", "Dance Floor"],
    num: "07",
  },
  {
    id: "baltimore-club",
    label: "Baltimore",
    sub: "Club Music",
    bpm: "130–145 BPM",
    era: "Late 70s / Early 80s",
    tags: ["Up-Tempo Funk", "Staccato Soul", "Party Floor"],
    num: "08",
  },
  {
    id: "soviet-estrada",
    label: "Soviet",
    sub: "Jazz-Funk / Estrada",
    bpm: "78–96 BPM",
    era: "Late 1970s USSR",
    tags: ["Melodiya", "Conservatory Funk", "Iron Curtain"],
    num: "09",
  },
  {
    id: "yugoslav-funk",
    label: "Yugoslav",
    sub: "Prog-Funk / Rock",
    bpm: "82–100 BPM",
    era: "Mid-1970s Yugoslavia",
    tags: ["Jugoton", "Balkan Modal", "Eastern Bloc"],
    num: "10",
  },
  {
    id: "south-african-jazz",
    label: "S. African",
    sub: "Township Jazz / Mbaqanga",
    bpm: "88–118 BPM",
    era: "Mid-1960s Johannesburg",
    tags: ["Penny Whistle", "Marabi Piano", "Township Jive"],
    num: "11",
  },
  {
    id: "afro-cuban-jazz",
    label: "Afro-Cuban",
    sub: "Descarga / Jazz",
    bpm: "95–130 BPM",
    era: "Late 1950s Havana",
    tags: ["Tres Guitar", "Piano Montuno", "Descarga"],
    num: "12",
  },
  {
    id: "algerian-rai",
    label: "Algerian",
    sub: "Electric Rai",
    bpm: "88–110 BPM",
    era: "Late 1970s Oran",
    tags: ["Gasba Flute", "Casio", "North African"],
    num: "13",
  },
  {
    id: "moroccan-gnawa",
    label: "Gnawa",
    sub: "Trance Fusion",
    bpm: "80–105 BPM",
    era: "Mid-1970s Morocco",
    tags: ["Sintir Lute", "Krakeb", "Spiritual Trance"],
    num: "14",
  },
  {
    id: "haitian-voodoo-jazz",
    label: "Haitian",
    sub: "Vodou-Jazz / Kompa",
    bpm: "76–108 BPM",
    era: "Mid-1960s Port-au-Prince",
    tags: ["Tanbou Drum", "Accordion", "Caribbean"],
    num: "15",
  },
  {
    id: "korean-psych",
    label: "Korean",
    sub: "Psych-Rock / Folk",
    bpm: "72–92 BPM",
    era: "Late 1960s Seoul",
    tags: ["Gayageum", "Fuzz Guitar", "Banned Records"],
    num: "16",
  },
  {
    id: "japanese-jazz-funk",
    label: "Japanese",
    sub: "Jazz-Funk / Spiritual",
    bpm: "80–108 BPM",
    era: "Mid-1970s Tokyo",
    tags: ["Rhodes", "Audiophile Vinyl", "Domestic Only"],
    num: "17",
  },
];

interface Props {
  selected: Genre | null;
  onSelect: (genre: Genre) => void;
  compact?: boolean;
}

export default function GenreSelector({ selected, onSelect, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => {
          const isSelected = selected === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelect(g.id)}
              className={[
                "flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-150 focus:outline-none",
                isSelected
                  ? "border-[#c9a84c] bg-[rgba(201,168,76,0.08)] text-[#c9a84c]"
                  : "border-[#1a2030] bg-[#0d1118] text-[#7e8fa0] hover:border-[#2a3a50] hover:text-[#a0b0c0]",
              ].join(" ")}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] flex-shrink-0" />}
              <span className="font-['Syne',sans-serif] font-bold text-[12px] tracking-[0.5px]">{g.label}</span>
              <span className="text-[9px] font-mono opacity-70">{g.bpm}</span>
            </button>
          );
        })}
      </div>
    );
  }

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
            <span
              className={[
                "absolute -bottom-3 right-3 font-['Syne',sans-serif] font-extrabold leading-none select-none pointer-events-none transition-colors duration-200",
                "text-[clamp(60px,10vw,100px)]",
                isSelected ? "text-[rgba(201,168,76,0.07)]" : "text-[#0d1118]",
              ].join(" ")}
            >
              {g.num}
            </span>

            {isSelected && (
              <span className="absolute top-5 right-5 w-2.5 h-2.5 rounded-full bg-[#c9a84c] shadow-[0_0_10px_rgba(201,168,76,0.7)] animate-pulse-subtle" />
            )}

            <div className="relative flex flex-col h-full gap-0">
              <span
                className={[
                  "font-['Syne',sans-serif] font-extrabold leading-none tracking-tight block transition-colors duration-200",
                  g.label.length > 6 ? "text-[28px]" : "text-[40px]",
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

              <div className="flex-1" />

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
