"use client";

import { useState } from "react";
import Image from "next/image";
import GenreSelector, { type Genre } from "@/components/GenreSelector";
import AudioUploader from "@/components/AudioUploader";
import AnalysisOutput from "@/components/AnalysisOutput";
import PromptOutput from "@/components/PromptOutput";
import SunoSettings from "@/components/SunoSettings";

type AppState = "idle" | "pass1" | "pass2" | "done" | "error";

const STATUS_MAP: Record<AppState, { dot: string; text: string }> = {
  idle:  { dot: "bg-[#2a3545]",                              text: "Ready — select a mode to begin"       },
  pass1: { dot: "bg-[#2ecc71] animate-pulse-slow",           text: "Pass 1 · Analyzing audio…"            },
  pass2: { dot: "bg-[#2ecc71] animate-pulse-slow",           text: "Pass 2 · Building prompt…"            },
  done:  { dot: "bg-[#2ecc71]",                              text: "Complete — prompt ready to copy"      },
  error: { dot: "bg-[#e05656]",                              text: "Error — see details below"            },
};

export default function Home() {
  const [genre, setGenre]                     = useState<Genre | null>(null);
  const [appState, setAppState]               = useState<AppState>("idle");
  const [statusMsg, setStatusMsg]             = useState("");
  const [analysis, setAnalysis]               = useState("");
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
    setAnalysis("");
    setGeneratedPrompt("");
    setAppState("idle");
    setStatusMsg("");
  }

  function handleReset() {
    setGenre(null);
    setAnalysis("");
    setGeneratedPrompt("");
    setAppState("idle");
    setStatusMsg("");
  }

  function handleRetry() {
    setAppState("idle");
    setStatusMsg("");
  }

  const { dot, text } = STATUS_MAP[appState];
  const displayText =
    statusMsg && (appState === "pass1" || appState === "pass2" || appState === "error")
      ? statusMsg
      : text;

  return (
    <div className="min-h-screen bg-[#080a0c] flex flex-col">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-20 border-b border-[#111820] bg-[#080a0c]/96 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[62px] flex items-center justify-between gap-4">

          {/* Logo + wordmark */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-[#c9a84c]/30 shadow-[0_0_18px_rgba(201,168,76,0.18)]">
              <Image
                src="/logo.png"
                alt="130 MODE"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Syne',sans-serif] font-extrabold text-[18px] leading-none text-[#eef2f7] tracking-tight">
                Sample Prompt <span className="text-[#c9a84c]">1200</span>
              </span>
              <span className="text-[9px] font-mono text-[#2a3545] tracking-[2px] hidden sm:inline">V2</span>
            </div>
          </div>

          {/* Status pill — always visible on sm+ */}
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0d1118] border border-[#1a2030]">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <span className="text-[9.5px] font-mono text-[#4a5a70] max-w-[200px] lg:max-w-[280px] truncate">{displayText}</span>
          </div>

          {/* Platform pills — right */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[8px] font-mono tracking-[1.5px] uppercase text-[#2a3545] mr-1">Works with</span>
            {["Suno", "Udio", "Sampla"].map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-full bg-[#0d1118] border border-[#1a2030] text-[8.5px] font-mono text-[#4a5a70]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA — slightly different bg creates centering anchor ── */}
      <div className="flex-1 bg-[#0a0d12]">
        <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-14">

          {/* ── HERO ── */}
          <div className="mb-16 animate-fade-in">
            <p className="text-[9px] font-mono font-medium tracking-[5px] uppercase text-[#c9a84c] mb-4">
              130 MODE · AI Sample Analysis
            </p>
            <h1 className="font-['Syne',sans-serif] font-extrabold text-[48px] sm:text-[56px] leading-[0.92] tracking-[-2.5px] text-[#eef2f7] mb-6">
              Drop a sample.<br />
              <span className="text-[#c9a84c]">Get the prompt.</span>
            </h1>
            <p className="text-[13px] font-mono text-[#4a5a70] max-w-[540px] leading-[1.8]">
              Era-locked genre analysis via Gemini. Outputs a ready-to-paste prompt for Suno,
              Udio, and Sampla.ai — no artist names, no drums, pure sonic DNA.
            </p>
          </div>

          {/* ── STEP 1: SELECT MODE ── */}
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-[22px] h-[22px] rounded-full bg-[#c9a84c] flex items-center justify-center flex-shrink-0">
                <span className="font-['Syne',sans-serif] font-extrabold text-[10px] text-[#080a0c] leading-none">1</span>
              </span>
              <span className="text-[9px] font-mono tracking-[4px] uppercase text-[#3d4d5c]">Select Mode</span>
            </div>
            <GenreSelector selected={genre} onSelect={handleGenreSelect} />
          </section>

          {/* ── STEP 2: UPLOAD — always rendered, disabled when no genre ── */}
          <section className="mb-16">
            <div className="h-px bg-gradient-to-r from-transparent via-[#1a2030] to-transparent mb-12" />
            <div className="flex items-center gap-3 mb-6">
              <span className={[
                "w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300",
                genre ? "bg-[#c9a84c]" : "bg-[#141c28]",
              ].join(" ")}>
                <span className={[
                  "font-['Syne',sans-serif] font-extrabold text-[10px] leading-none transition-colors duration-300",
                  genre ? "text-[#080a0c]" : "text-[#2a3545]",
                ].join(" ")}>2</span>
              </span>
              <span className="text-[9px] font-mono tracking-[4px] uppercase text-[#3d4d5c]">Upload Sample</span>
            </div>
            <AudioUploader
              genre={genre ?? "boom-bap"}
              disabled={!genre}
              onResult={handleResult}
              onStatusChange={handleStatusChange}
            />
          </section>

          {/* ── ERROR DETAIL ── */}
          {appState === "error" && statusMsg && (
            <div className="animate-slide-down mb-16 rounded-2xl bg-[rgba(224,86,86,0.10)] border border-[#e05656]/30 border-l-4 border-l-[#e05656] px-6 py-5">
              <p className="text-[8.5px] font-mono tracking-[3px] uppercase text-[#e05656] mb-2">Error Details</p>
              <p className="text-[12px] font-mono text-[rgba(224,86,86,0.8)] leading-relaxed mb-4">{statusMsg}</p>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 font-['Syne',sans-serif] font-bold text-[9px] tracking-[2.5px] uppercase px-4 py-2 rounded-xl bg-[rgba(224,86,86,0.12)] border border-[#e05656]/40 text-[#e05656] hover:bg-[rgba(224,86,86,0.2)] transition-colors duration-150"
                >
                  ↺ Try Again
                </button>
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 font-['Syne',sans-serif] font-bold text-[9px] tracking-[2.5px] uppercase px-4 py-2 rounded-xl text-[#3d4d5c] hover:text-[#4a5a70] transition-colors duration-150"
                >
                  Clear & Start Over
                </button>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {analysis && (
            <section className="animate-slide-down">
              <div className="h-px bg-gradient-to-r from-transparent via-[#1a2030] to-transparent mb-12" />

              <div className="flex items-center gap-3 mb-8">
                <span className="w-[22px] h-[22px] rounded-full bg-[#2ecc71] flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#080a0c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-[9px] font-mono tracking-[4px] uppercase text-[#3d4d5c]">Analysis Complete</span>
              </div>

              {/* Two-column on lg+, single on smaller */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div>
                  <p className="text-[8px] font-mono tracking-[3.5px] uppercase text-[#2a3545] mb-3">Sample Analysis</p>
                  <AnalysisOutput raw={analysis} />
                </div>
                <div>
                  <p className="text-[8px] font-mono tracking-[3.5px] uppercase text-[#2a3545] mb-3">Generated Prompt</p>
                  {generatedPrompt ? (
                    <PromptOutput prompt={generatedPrompt} />
                  ) : (
                    <div className="rounded-2xl bg-[rgba(224,86,86,0.06)] border border-[#e05656]/30 px-5 py-5 text-[12px] font-mono text-[#e05656]">
                      Prompt not generated — please try again.
                    </div>
                  )}
                </div>
              </div>

              {/* Suno Settings — full-width below results grid */}
            <div className="mt-8">
              <p className="text-[8px] font-mono tracking-[3.5px] uppercase text-[#2a3545] mb-3">Suno Parameters</p>
              <SunoSettings analysis={analysis} genre={genre!} />
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-[#1a2030] to-transparent mt-16 mb-7" />
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2.5 font-['Syne',sans-serif] font-bold text-[10px] tracking-[3px] uppercase text-[#2a3545] hover:text-[#c9a84c] transition-colors duration-200"
              >
                <span className="text-[16px] leading-none">↺</span>
                New Analysis
              </button>
            </section>
          )}

        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#0d1118] bg-[#080a0c]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between text-[8.5px] font-mono text-[#2a3545] tracking-[1px]">
          <span className="font-['Syne',sans-serif] font-bold">Sample Prompt 1200 V2</span>
          <span>130 MODE · Booman Systems · 2026</span>
        </div>
      </footer>

    </div>
  );
}
