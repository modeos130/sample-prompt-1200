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
      <div className="rounded-[10px] border border-[#1e2530] border-l-[3px] border-l-[#c9a84c] bg-[#141820] p-4">
        <pre className="font-mono text-[11px] text-[#7e8fa0] whitespace-pre-wrap">{raw}</pre>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-[#1e2530] border-l-[3px] border-l-[#c9a84c] bg-[#141820] overflow-hidden">
      {fields.map(({ key, value }, i) => (
        <div
          key={key}
          className={[
            "flex",
            i < fields.length - 1 ? "border-b border-[#1e2530]" : "",
          ].join(" ")}
        >
          <div className="w-[130px] min-w-[130px] px-4 py-3 border-r border-[#1e2530] bg-[rgba(201,168,76,0.02)] flex items-start pt-[13px]">
            <span className="font-['Syne',sans-serif] font-bold text-[8px] tracking-[1.5px] uppercase text-[#c9a84c]">
              {key}
            </span>
          </div>
          <div className="flex-1 px-4 py-3">
            <span className="font-mono text-[11px] text-[#7e8fa0] leading-relaxed break-words">
              {value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
