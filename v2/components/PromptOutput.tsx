"use client";

import { useState } from "react";

function charStatus(n: number): "ok" | "warn" | "over" {
  if (n > 1000) return "over";
  if (n > 850) return "warn";
  return "ok";
}

const BAR_COLORS = {
  ok:   "bg-[#2ecc71]",
  warn: "bg-[#e8944a]",
  over: "bg-[#e05656]",
};

const TEXT_COLORS = {
  ok:   "text-[#2ecc71]",
  warn: "text-[#e8944a]",
  over: "text-[#e05656]",
};

export default function PromptOutput({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  const n   = prompt.length;
  const sc  = charStatus(n);
  const pct = Math.min(100, (n / 1000) * 100);

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  }

  return (
    <div className="w-full flex flex-col gap-4">

      {/* Sub-header */}
      <p className="text-[9px] font-mono text-[#2a3545] leading-relaxed">
        Era-locked · Minor/modal · No drums · Loopable · Ready for Suno, Udio &amp; Sampla
      </p>

      {/* Prompt textarea */}
      <textarea
        readOnly
        value={prompt}
        rows={9}
        className={[
          "w-full rounded-2xl border border-[#141c28] bg-[#0d1118]",
          "font-mono text-[12.5px] text-[#eef2f7] leading-[1.85]",
          "px-5 py-4 resize-none focus:outline-none",
          "transition-colors duration-200 focus:border-[#7a6230]",
        ].join(" ")}
      />

      {/* Character meter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[9px] font-mono ${TEXT_COLORS[sc]}`}>
            {n} / 1000 chars
          </span>
          <div className="flex items-center gap-1.5">
            {(["Suno", "Udio", "Sampla"] as const).map((p) => (
              <span
                key={p}
                className="text-[8px] font-mono px-2.5 py-1 rounded-full bg-[rgba(46,204,113,0.08)] border border-[rgba(46,204,113,0.2)] text-[#2ecc71]"
              >
                {p} ✓
              </span>
            ))}
          </div>
        </div>
        <div className="h-[3px] rounded-full bg-[#111820] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[sc]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={[
          "w-full h-[56px] rounded-2xl font-['Syne',sans-serif] font-extrabold text-[12px]",
          "tracking-[3px] uppercase transition-all duration-200 flex items-center justify-center gap-3 border-2",
          copied
            ? "bg-[rgba(46,204,113,0.1)] border-[#2ecc71] text-[#2ecc71]"
            : [
                "bg-[#0d1118] border-[#1a2030] text-[#4a5a70]",
                "hover:border-[#c9a84c] hover:text-[#c9a84c] hover:bg-[rgba(201,168,76,0.05)]",
                "hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(201,168,76,0.15)]",
                "active:translate-y-0 active:shadow-none",
              ].join(" "),
        ].join(" ")}
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Copied to Clipboard
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            Copy Prompt
          </>
        )}
      </button>

    </div>
  );
}
