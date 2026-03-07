"use client";

import { useState } from "react";

function charStatus(n: number): "ok" | "warn" | "over" {
  if (n > 1000) return "over";
  if (n > 850) return "warn";
  return "ok";
}

const STATUS_COLORS = {
  ok: "text-[#34c97a] border-[rgba(52,201,122,0.3)] bg-[rgba(52,201,122,0.15)]",
  warn: "text-[#e8944a] border-[#28333f] bg-[#141820]",
  over: "text-[#e05656] border-[#28333f] bg-[#141820]",
};

export default function PromptOutput({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const n = prompt.length;
  const sc = charStatus(n);

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="w-full">
      <div className="mb-3">
        <p className="font-['Syne',sans-serif] font-bold text-[9px] tracking-[2.5px] uppercase text-[#7e8fa0] mb-1">
          AI Music Prompt
        </p>
        <p className="text-[9.5px] font-mono text-[#3d4d5c]">
          Era-locked · Minor/modal · 2-inch tape · Live band · Loopable · Ready for Suno, Udio &amp; Sampla.ai
        </p>
      </div>

      <textarea
        readOnly
        value={prompt}
        rows={7}
        className={[
          "w-full rounded-[6px] border border-[#28333f] bg-[#1a1f28]",
          "font-mono text-[12px] text-[#d8e2ec] leading-[1.75]",
          "px-3.5 py-3 resize-none focus:outline-none focus:border-[#7a6230]",
          "focus:shadow-[0_0_0_2px_rgba(201,168,76,0.06)]",
        ].join(" ")}
      />

      {/* char bar */}
      <div className="flex items-center gap-2 flex-wrap mt-2">
        <span
          className={[
            "text-[9px] font-mono px-2 py-0.5 rounded border",
            STATUS_COLORS[sc],
          ].join(" ")}
        >
          {n}/1000 chars
        </span>
        {(["Suno", "Udio", "Sampla.ai"] as const).map((p) => (
          <span
            key={p}
            className="text-[9px] font-mono px-2 py-0.5 rounded border text-[#34c97a] border-[rgba(52,201,122,0.3)] bg-[rgba(52,201,122,0.15)]"
          >
            {p}&nbsp;✓
          </span>
        ))}
      </div>

      {/* copy button */}
      <button
        onClick={handleCopy}
        className={[
          "mt-3 inline-flex items-center gap-2 px-5 py-2 rounded-[6px] border font-mono text-[10.5px] transition-all duration-150",
          copied
            ? "border-[#34c97a] text-[#34c97a] bg-[rgba(52,201,122,0.15)]"
            : "border-[#28333f] bg-[#222a34] text-[#7e8fa0] hover:border-[#7a6230] hover:text-[#e8c97a] hover:bg-[rgba(201,168,76,0.06)]",
        ].join(" ")}
      >
        {copied ? "✓ Copied!" : "■ Copy Prompt"}
      </button>
    </div>
  );
}
