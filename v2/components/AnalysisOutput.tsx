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
  const { fields } = parseAnalysis(raw);

  if (!fields.length) {
    return (
      <div className="rounded-2xl border border-[#141c28] bg-[#0d1118] p-6 border-l-[3px] border-l-[#c9a84c]">
        <pre className="font-mono text-[11px] text-[#8a9bb0] whitespace-pre-wrap leading-[1.9]">{raw}</pre>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#141c28] bg-[#0d1118] overflow-hidden">
      {fields.map(({ key, value }, i) => (
        <div
          key={key}
          className={[
            "flex",
            i < fields.length - 1 ? "border-b border-[#111820]" : "",
          ].join(" ")}
        >
          {/* Key */}
          <div className="w-[130px] min-w-[130px] px-5 py-4 bg-[#0a0d14] border-r border-[#111820] flex items-start pt-[17px]">
            <span className="font-['Syne',sans-serif] font-bold text-[7.5px] tracking-[2px] uppercase text-[#c9a84c] leading-none">
              {key}
            </span>
          </div>
          {/* Value */}
          <div className="flex-1 px-5 py-4">
            <span className="font-mono text-[11.5px] text-[#8a9bb0] leading-[1.8] break-words">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
