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

const BADGES = [
  { icon: "♫", label: "Era-locked" },
  { icon: "◈", label: "Minor/modal" },
  { icon: "∅", label: "No drums" },
  { icon: "∞", label: "Loopable" },
];

export default function PromptOutput({ prompt }: { prompt: string }) {
  const [copied, setCopied]       = useState(false);
  const [showToast, setShowToast] = useState(false);

  const n   = prompt.length;
  const sc  = charStatus(n);
  const pct = Math.min(100, (n / 1000) * 100);

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 2200);
      setTimeout(() => setShowToast(false), 2800);
    });
  }

  return (
    <div className="w-full flex flex-col gap-4">

      {/* Sub-header badges */}
      <div className="flex flex-wrap gap-2">
        {BADGES.map(({ icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border border-[#1e2838] bg-[#0d1118] text-[#6a7a8a]"
          >
            <span className="text-[#c9a84c] text-[11px] leading-none">{icon}</span>
            {label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border border-[#1e2838] bg-[#0d1118] text-[#6a7a8a]">
          <span className="text-[#34c97a] text-[11px] leading-none">✓</span>
          Suno · Udio · Sampla
        </span>
      </div>

      {/* Character meter — above textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[9px] font-mono ${TEXT_COLORS[sc]}`}>
            {n} / 1000 chars
          </span>
          <span className={`text-[8px] font-mono ${TEXT_COLORS[sc]}`}>
            {sc === "ok" ? "✓ Ready" : sc === "warn" ? "⚠ Approaching limit" : "✗ Over limit"}
          </span>
        </div>
        <div className="h-[3px] rounded-full bg-[#111820] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[sc]}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Prompt textarea */}
      <textarea
        readOnly
        value={prompt}
        rows={9}
        className={[
          "w-full rounded-2xl border border-[#1a2030] bg-[rgba(201,168,76,0.02)]",
          "border-l-4 border-l-[#c9a84c]",
          "font-mono text-[13px] text-[#eef2f7] leading-[1.85]",
          "px-6 py-5 resize-none focus:outline-none",
          "transition-all duration-200",
          "focus:border-[#7a6230] focus:border-l-[#c9a84c] focus:bg-[rgba(201,168,76,0.04)]",
          "focus:ring-2 focus:ring-[rgba(201,168,76,0.08)]",
        ].join(" ")}
      />

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={[
          "w-full h-[56px] rounded-2xl font-['Syne',sans-serif] font-extrabold text-[12px]",
          "tracking-[3px] uppercase transition-all duration-200 flex items-center justify-center gap-3 border-2",
          copied
            ? "bg-[rgba(46,204,113,0.12)] border-[#2ecc71] text-[#2ecc71] shadow-[0_0_20px_rgba(46,204,113,0.15)]"
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
            Copy to Clipboard
          </>
        )}
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[rgba(46,204,113,0.15)] border border-[#2ecc71]/40 shadow-[0_8px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(46,204,113,0.12)] animate-toast">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="#2ecc71" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[12px] font-['Syne',sans-serif] font-bold tracking-wide text-[#2ecc71]">
            Prompt copied!
          </span>
        </div>
      )}

    </div>
  );
}
