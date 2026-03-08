"use client";

import { useState } from "react";
import GenreSelector, { type Genre } from "@/components/GenreSelector";
import AudioUploader from "@/components/AudioUploader";
import AnalysisOutput from "@/components/AnalysisOutput";
import PromptOutput from "@/components/PromptOutput";

type AppState = "idle" | "pass1" | "pass2" | "done" | "error";

const STATUS_MAP: Record<AppState, { dot: string; text: string }> = {
  idle:  { dot: "bg-[#3d4d5c]",   text: "Ready — select a mode and drop a sample" },
  pass1: { dot: "bg-[#34c97a] animate-pulse-slow", text: "Pass 1 of 2 — Reading and analyzing audio..." },
  pass2: { dot: "bg-[#34c97a] animate-pulse-slow", text: "Pass 2 of 2 — Building prompt from analysis..." },
  done:  { dot: "bg-[#34c97a]",   text: "Analysis complete — prompt ready to copy" },
  error: { dot: "bg-[#e05656]",   text: "Error — see details below" },
};

export default function Home() {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [appState, setAppState] = useState<AppState>("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  function handleStatusChange(status: AppState, msg?: string) {
    setAppState(status);
    if (msg) setStatusMsg(msg);
  }

  function handleResult(a: string, p: string) {
    setAnalysis(a);
    setGeneratedPrompt(p);
  }

  function handleGenreSelect(g: Genre) {
    setGenre(g);
    // reset results when switching genre
    setAnalysis("");
    setGeneratedPrompt("");
    setAppState("idle");
  }

  function handleReset() {
    setGenre(null);
    setAnalysis("");
    setGeneratedPrompt("");
    setAppState("idle");
    setStatusMsg("");
  }

  const { dot, text } = STATUS_MAP[appState];
  const displayText =
    statusMsg && (appState === "pass1" || appState === "pass2" || appState === "error")
      ? statusMsg
      : text;

  return (
    <main className="min-h-screen bg-[#0d0f11] flex flex-col items-center">
      <div className="w-full max-w-[760px] px-4 sm:px-7 py-10 pb-24">

        {/* ── HEADER ── */}
        <header className="mb-9 pb-7 border-b border-[#1e2530]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-mono font-medium tracking-[3.5px] uppercase text-[#c9a84c] mb-2">
                130 MODE · Booman Systems
              </p>
              <h1 className="font-['Syne',sans-serif] font-extrabold text-[32px] tracking-tight leading-none text-[#d8e2ec] mb-2.5">
                Sample Prompt <span className="text-[#c9a84c]">1200</span>{" "}
                <span className="text-[18px] text-[#7a6230]">V2</span>
              </h1>
              <p className="text-[11px] font-mono text-[#7e8fa0] leading-[1.5]">
                AI-powered sample analysis for producers.<br />
                Select your genre — drop any audio — get a ready-to-paste prompt.
              </p>
            </div>
            {/* badge */}
            <div className="flex-shrink-0 w-[58px] h-[58px] rounded-full border border-[#7a6230] bg-gradient-to-br from-[#1a1f28] to-[#141820] shadow-[0_0_0_4px_rgba(201,168,76,0.06)] flex flex-col items-center justify-center">
              <span className="font-['Syne',sans-serif] font-extrabold text-[18px] text-[#c9a84c] leading-none">130</span>
              <span className="text-[7px] font-mono font-medium text-[#7a6230] tracking-[1.5px] uppercase mt-0.5">MODE</span>
            </div>
          </div>
          {/* platform pills */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[9px] font-mono text-[#3d4d5c] tracking-[1.5px] uppercase mr-1">Works with</span>
            {["Suno", "Udio", "Sampla.ai"].map((p) => (
              <span key={p} className="inline-flex items-center bg-[#1a1f28] border border-[#28333f] rounded-full px-2.5 py-0.5 text-[9px] font-mono font-medium text-[#7e8fa0] tracking-[0.5px] uppercase">
                {p}
              </span>
            ))}
          </div>
        </header>

        {/* ── STATUS BAR ── */}
        <div className="flex items-center gap-2.5 bg-[#141820] border border-[#1e2530] rounded-[10px] px-4 py-3 mb-5 font-mono text-[10.5px] text-[#7e8fa0] tracking-[0.4px]">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
          <span>{displayText}</span>
        </div>

        {/* ── GENRE SELECTOR ── */}
        <section className="mb-6">
          <GenreSelector selected={genre} onSelect={handleGenreSelect} />
        </section>

        {/* ── UPLOAD — slides in after genre selection ── */}
        {genre && (
          <section className="animate-slide-down mb-6">
            <div className="h-px bg-[#1e2530] mb-6" />
            <AudioUploader
              genre={genre}
              onResult={handleResult}
              onStatusChange={handleStatusChange}
            />
          </section>
        )}

        {/* ── ERROR DETAIL ── */}
        {appState === "error" && statusMsg && (
          <div className="animate-slide-down mb-6 bg-[rgba(224,86,86,0.08)] border border-[#e05656] rounded-[10px] px-4 py-3.5">
            <p className="text-[9px] font-mono font-medium tracking-[2px] uppercase text-[#e05656] mb-1.5">Error Details</p>
            <p className="text-[11px] font-mono text-[#e05656] leading-relaxed">{statusMsg}</p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {analysis && (
          <section className="animate-slide-down">
            <div className="h-px bg-[#1e2530] my-7" />

            {/* analysis */}
            <div className="mb-2">
              <div className="flex items-center gap-3 mb-3.5">
                <span className="font-['Syne',sans-serif] font-bold text-[9px] tracking-[3px] uppercase text-[#7e8fa0]">
                  Sample Analysis
                </span>
                <div className="flex-1 h-px bg-[#1e2530]" />
              </div>
              <AnalysisOutput raw={analysis} />
            </div>

            <div className="h-5" />

            {/* prompt */}
            <div>
              <div className="flex items-center gap-3 mb-3.5">
                <span className="font-['Syne',sans-serif] font-bold text-[9px] tracking-[3px] uppercase text-[#7e8fa0]">
                  Generated Prompt
                </span>
                <div className="flex-1 h-px bg-[#1e2530]" />
              </div>
              {generatedPrompt ? (
                <PromptOutput prompt={generatedPrompt} />
              ) : (
                <div className="bg-[rgba(224,86,86,0.08)] border border-[#e05656] rounded-[10px] px-4 py-3.5 text-[11px] font-mono text-[#e05656]">
                  Prompt not generated — try again.
                </div>
              )}
            </div>

            {/* reset */}
            <div className="h-px bg-[#1e2530] mt-7 mb-5" />
            <button
              onClick={handleReset}
              className="font-['Syne',sans-serif] font-bold text-[11px] tracking-[2px] uppercase text-[#7e8fa0] hover:text-[#c9a84c] transition-colors duration-150"
            >
              ↺ New Analysis
            </button>
          </section>
        )}

        {/* ── FOOTER ── */}
        <footer className="mt-12 pt-6 border-t border-[#1e2530] flex items-center justify-between text-[9.5px] font-mono text-[#3d4d5c] tracking-[0.8px]">
          <span className="font-['Syne',sans-serif] font-bold">Sample Prompt 1200 V2</span>
          <span>130 MODE · Booman Systems · 2026</span>
        </footer>

      </div>
    </main>
  );
}
