"use client";

interface Field {
  key: string;
  value: string;
}

function parseAnalysis(raw: string): { fields: Field[]; flipBlock: string } {
  const lines = raw.split("\n");
  const fields: Field[] = [];
  const flipLines: string[] = [];
  let inFlip = false;
  let curKey = "";
  let curVal: string[] = [];

  const keyPat = /^([A-Z][A-Z\s+]*?):\s*(.*)/;
  const flipRe = /^FLIP\s+DIRECTIONS\s*:/i;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (flipRe.test(line)) {
      if (curKey && curVal.length) fields.push({ key: curKey, value: curVal.join(" ") });
      curKey = "";
      curVal = [];
      inFlip = true;
      const after = line.replace(flipRe, "").trim();
      if (after) flipLines.push(after);
      continue;
    }

    if (inFlip) { flipLines.push(line); continue; }

    const m = line.match(keyPat);
    if (m && m[1].trim().length >= 2 && /^[A-Z][A-Z\s+]*$/.test(m[1].trim())) {
      if (curKey && curVal.length) fields.push({ key: curKey, value: curVal.join(" ") });
      curKey = m[1].trim();
      curVal = m[2].trim() ? [m[2].trim()] : [];
    } else if (curKey) {
      curVal.push(line);
    }
  }
  if (curKey && curVal.length) fields.push({ key: curKey, value: curVal.join(" ") });

  return { fields, flipBlock: flipLines.join("\n") };
}

export default function AnalysisOutput({ raw }: { raw: string }) {
  const { fields, flipBlock } = parseAnalysis(raw);

  if (!fields.length) {
    return (
      <div className="rounded-2xl border border-[#141c28] bg-[#0d1118] p-6 border-l-[3px] border-l-[#c9a84c]">
        <pre className="font-mono text-[11px] text-[#8a9bb0] whitespace-pre-wrap leading-[1.9]">{raw}</pre>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main table */}
      <div className="rounded-2xl border border-[#141c28] bg-[#0d1118] overflow-hidden">
        {fields.map(({ key, value }, i) => (
          <div
            key={key}
            className={[
              "block sm:flex group transition-colors duration-150 hover:bg-[rgba(201,168,76,0.025)]",
              i < fields.length - 1 ? "border-b border-[#111820]" : "",
            ].join(" ")}
          >
            {/* Key */}
            <div className="sm:w-[130px] sm:min-w-[130px] px-4 sm:px-5 py-3 sm:py-4 bg-[#0a0d14] border-b sm:border-b-0 sm:border-r border-[#111820] flex items-start sm:pt-[17px] pt-3">
              <span className="font-['Syne',sans-serif] font-bold text-[7.5px] tracking-[2px] uppercase text-[#c9a84c] leading-none">
                {key}
              </span>
            </div>
            {/* Value */}
            <div className="flex-1 px-4 sm:px-5 py-3 sm:py-4">
              <span className="font-mono text-[11.5px] text-[#8a9bb0] leading-[1.85] break-words">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Flip Directions callout */}
      {flipBlock && (
        <div className="rounded-2xl border border-[rgba(201,168,76,0.22)] bg-[rgba(201,168,76,0.06)] px-5 py-5 animate-fade-in">
          <p className="font-['Syne',sans-serif] font-bold text-[8px] tracking-[2.5px] uppercase text-[#c9a84c] mb-3">
            Flip Directions
          </p>
          <p className="font-mono text-[11.5px] text-[#8a9bb0] leading-[1.85] whitespace-pre-wrap">
            {flipBlock}
          </p>
        </div>
      )}
    </div>
  );
}
