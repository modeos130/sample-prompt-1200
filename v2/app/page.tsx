"use client";

import { useState } from "react";
import Image from "next/image";
import GenreSelector, { type Genre } from "@/components/GenreSelector";
import AudioUploader from "@/components/AudioUploader";
import AnalysisOutput from "@/components/AnalysisOutput";
import PromptOutput from "@/components/PromptOutput";
import SunoSettings from "@/components/SunoSettings";

type AppState = "idle" | "pass1" | "pass2" | "done" | "error";
type ResultTab = "prompt" | "analysis" | "suno";

const STATUS_MAP: Record<AppState, { dot: string; text: string }> = {
  idle:  { dot: "bg-[#2a3545]",                    text: "Ready — select a mode to begin"  },
  pass1: { dot: "bg-[#2ecc71] animate-pulse-slow", text: "Pass 1 · Analyzing audio…"       },
  pass2: { dot: "bg-[#2ecc71] animate-pulse-slow", text: "Pass 2 · Building prompt…"       },
  done:  { dot: "bg-[#2ecc71]",                    text: "Complete — prompt ready to copy" },
  error: { dot: "bg-[#e05656]",                    text: "Error — see details below"       },
};

const TAB_LABELS: Record<ResultTab, string> = {
  prompt:   "Generated Prompt",
  analysis: "Sample Analysis",
  suno:     "Suno Settings",
};

export default function Home() {
  const [genre, setGenre]                     = useState<Genre | null>(null);
  const [appState, setAppState]               = useState<AppState>("idle");
  const [statusMsg, setStatusMsg]             = useState("");
  const [analysis, setAnalysis]               = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [activeTab, setActiveTab]             = useState<ResultTab>("prompt");

  function handleStatusChange(status: AppState, msg?: string) {
    setAppState(status);
    if (msg) setStatusMsg(msg);
  }

  function handleResult(a: string, p: string) {
    setAnalysis(a);
    setGeneratedPrompt(p);
    setActiveTab("prompt");
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

  const hasResults = !!analysis;

  return (
    <div className="min-h-screen bg-[#080a0c] flex flex-col">

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-20 border-b border-[#111820] bg-[#080a0c]/96 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-[62px] flex items-center justify-between gap-4">

          {/* Logo + wordmark */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 border border-[#c9a84c]/30 shadow-[0_0_18px_rgba(201,168,76,0.18)]">
              <Image src="/logo.png" alt="130 MODE" width={36} height={36} className="w-full h-full object-cover" priority />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Syne',sans-serif] font-extrabold text-[18px] leading-none text-[#eef2f7] tracking-tight">
                Sample Prompt <span className="text-[#c9a84c]">1200</span>
              </span>
              <span className="text-[9px] font-mono text-[#2a3545] tracking-[2px] hidden sm:inline">V2</span>
            </div>
          </div>

          {/* Status pill */}
          <div className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0d1118] border border-[#1a2030]">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            <span className="text-[9.5px] font-mono text-[#4a5a70] max-w-[200px] lg:max-w-[280px] truncate">{displayText}</span>
          </div>

          {/* Platform pills */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[8px] font-mono tracking-[1.5px] uppercase text-[#2a3545] mr-1">Works with</span>
            {["Suno", "Udio", "Sampla"].map((p) => (
              <span key={p} className="px-2.5 py-1 rounded-full bg-[#0d1118] border border-[#1a2030] text-[8.5px] font-mono text-[#4a5a70]">
                {p}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 bg-[#0a0d12]">
        <main className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

          {/* ── HERO — only before genre is selected ── */}
          {!genre && (
            <div className="mb-10 animate-fade-in">
              <p className="text-[9px] font-mono font-medium tracking-[5px] uppercase text-[#c9a84c] mb-4">
                130 MODE · AI Sample Analysis
              </p>
              <h1 className="font-['Syne',sans-serif] font-extrabold text-[48px] sm:text-[56px] leading-[0.92] tracking-[-2.5px] text-[#eef2f7] mb-5">
                Drop a sample.<br />
                <span className="text-[#c9a84c]">Get the prompt.</span>
              </h1>
              <p className="text-[13px] font-mono text-[#4a5a70] max-w-[540px] leading-[1.8]">
                Era-locked genre analysis via Gemini. Outputs a ready-to-paste prompt for Suno,
                Udio, and Sampla.ai — no artist names, no drums, pure sonic DNA.
              </p>
            </div>
          )}

          {/* ── PRE-SELECTION: full-width genre cards ── */}
          {!genre && (
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-[22px] h-[22px] rounded-full bg-[#c9a84c] flex items-center justify-center flex-shrink-0">
                  <span className="font-['Syne',sans-serif] font-extrabold text-[10px] text-[#080a0c] leading-none">1</span>
                </span>
                <span className="text-[9px] font-mono tracking-[4px] uppercase text-[#3d4d5c]">Select Mode</span>
              </div>
              <GenreSelector selected={null} onSelect={handleGenreSelect} compact={false} />
            </section>
          )}

          {/* ── POST-SELECTION: 2-col layout ── */}
          {genre && (
            <div className="lg:grid lg:grid-cols-[400px_1fr] lg:gap-8 lg:items-start animate-fade-in">

              {/* ── LEFT: Input controls ── */}
              <div className="space-y-5">

                {/* Step 1: compact genre switcher */}
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-[22px] h-[22px] rounded-full bg-[#c9a84c] flex items-center justify-center flex-shrink-0">
                      <span className="font-['Syne',sans-serif] font-extrabold text-[10px] text-[#080a0c] leading-none">1</span>
                    </span>
                    <span className="text-[9px] font-mono tracking-[4px] uppercase text-[#3d4d5c]">Select Mode</span>
                  </div>
                  <GenreSelector selected={genre} onSelect={handleGenreSelect} compact />
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-[#1a2030] to-transparent" />

                {/* Step 2: uploader */}
                <section>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-[22px] h-[22px] rounded-full bg-[#c9a84c] flex items-center justify-center flex-shrink-0">
                      <span className="font-['Syne',sans-serif] font-extrabold text-[10px] text-[#080a0c] leading-none">2</span>
                    </span>
                    <span className="text-[9px] font-mono tracking-[4px] uppercase text-[#3d4d5c]">Upload Sample</span>
                  </div>
                  <AudioUploader
                    genre={genre}
                    disabled={false}
                    onResult={handleResult}
                    onStatusChange={handleStatusChange}
                  />
                </section>

                {/* Error block */}
                {appState === "error" && statusMsg && (
                  <div className="animate-slide-down rounded-2xl bg-[rgba(224,86,86,0.10)] border border-[#e05656]/30 border-l-4 border-l-[#e05656] px-5 py-4">
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

                {/* New Analysis — shown below uploader once results are in */}
                {hasResults && (
                  <div className="pt-1">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#1a2030] to-transparent mb-4" />
                    <button
                      onClick={handleReset}
                      className="inline-flex items-center gap-2.5 font-['Syne',sans-serif] font-bold text-[10px] tracking-[3px] uppercase text-[#2a3545] hover:text-[#c9a84c] transition-colors duration-200"
                    >
                      <span className="text-[16px] leading-none">↺</span>
                      New Analysis
                    </button>
                  </div>
                )}
              </div>

              {/* ── RIGHT: Results panel ── */}
              <div className="mt-8 lg:mt-0 lg:sticky lg:top-[78px]">
                {hasResults ? (
                  <div className="animate-slide-down">

                    {/* Tab bar */}
                    <div className="flex items-center border-b border-[#111820] mb-5">
                      {(["prompt", "analysis", "suno"] as ResultTab[]).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={[
                            "px-4 py-2.5 text-[9px] font-mono tracking-[2px] uppercase transition-all duration-150 border-b-2 -mb-px",
                            activeTab === tab
                              ? "border-[#c9a84c] text-[#c9a84c]"
                              : "border-transparent text-[#3d4d5c] hover:text-[#4a5a70]",
                          ].join(" ")}
                        >
                          {TAB_LABELS[tab]}
                        </button>
                      ))}
                    </div>

                    {/* Tab content — scrollable on desktop */}
                    <div className="lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-1">
                      {activeTab === "prompt" && (
                        <div className="animate-fade-in">
                          {generatedPrompt ? (
                            <PromptOutput prompt={generatedPrompt} />
                          ) : (
                            <div className="rounded-2xl bg-[rgba(224,86,86,0.06)] border border-[#e05656]/30 px-5 py-5 text-[12px] font-mono text-[#e05656]">
                              Prompt not generated — please try again.
                            </div>
                          )}
                        </div>
                      )}
                      {activeTab === "analysis" && (
                        <div className="animate-fade-in">
                          <AnalysisOutput raw={analysis} />
                        </div>
                      )}
                      {activeTab === "suno" && (
                        <div className="animate-fade-in">
                          <SunoSettings analysis={analysis} genre={genre} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Waiting placeholder — desktop only */
                  <div className="hidden lg:flex flex-col items-center justify-center min-h-[340px] rounded-2xl border border-dashed border-[#141c28] text-center px-8">
                    <div className="w-12 h-12 rounded-2xl border border-[#1a2030] flex items-center justify-center mb-4">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a3545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    </div>
                    <p className="font-['Syne',sans-serif] font-bold text-[11px] tracking-[2px] uppercase text-[#1e2838] mb-1.5">Results</p>
                    <p className="text-[10px] font-mono text-[#1a2535]">Upload and analyze a sample<br />to see output here</p>
                  </div>
                )}
              </div>

            </div>
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
