"use client";

import { useRef, useState } from "react";
import type { Genre } from "./GenreSelector";

interface Props {
  genre: Genre;
  disabled?: boolean;
  onResult: (analysis: string, prompt: string) => void;
  onStatusChange: (status: "idle" | "pass1" | "pass2" | "done" | "error", msg?: string) => void;
}

const GENRE_LABELS: Record<Genre, string> = {
  "boom-bap": "Boom Bap",
  house: "House",
  trap: "Trap",
  "baltimore-club": "Baltimore Club",
};

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB — Vercel's multipart body limit is 4.5 MB

function fileSizeStr(n: number): string {
  return n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export default function AudioUploader({ genre, disabled, onResult, onStatusChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const passTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [file, setFile]           = useState<File | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [running, setRunning]     = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [analysisPass, setAnalysisPass] = useState<1 | 2>(1);

  function handleFile(f: File) {
    if (f.size > MAX_FILE_BYTES) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 3500);
      return;
    }
    setSizeError(false);
    setFile(f);
    onStatusChange("idle");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("audio/")) handleFile(f);
  }

  async function handleAnalyze() {
    if (!file || running || disabled) return;
    setRunning(true);
    setAnalysisPass(1);
    onStatusChange("pass1", "Pass 1 of 2 — Reading and analyzing audio...");

    // Transition to pass 2 visually after ~6s (server-side timing estimate)
    passTimerRef.current = setTimeout(() => {
      setAnalysisPass(2);
      onStatusChange("pass2", "Pass 2 of 2 — Building prompt from analysis...");
    }, 6000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("genre", genre);

      const res = await fetch("/api/analyze", { method: "POST", body: formData });

      const text = await res.text();
      let data: { analysis?: string; generatedPrompt?: string; error?: string } = {};
      try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 200) || `HTTP ${res.status}`); }

      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

      onResult(data.analysis ?? "", data.generatedPrompt ?? "");
      onStatusChange("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      onStatusChange("error", msg);
    } finally {
      if (passTimerRef.current) clearTimeout(passTimerRef.current);
      setRunning(false);
    }
  }

  const isInteractive = !disabled && !running;

  const dropZoneClass = [
    "relative rounded-2xl border-2 border-dashed py-16 flex flex-col items-center justify-center gap-5",
    "transition-all duration-200 select-none",
    disabled
      ? "cursor-not-allowed border-[#141c28] bg-[#0a0d12] opacity-60"
      : running
      ? "cursor-not-allowed opacity-75 border-[rgba(201,168,76,0.4)] bg-[#0d1118]"
      : dragging
      ? "border-[#c9a84c] bg-[rgba(201,168,76,0.07)] shadow-[0_0_80px_rgba(201,168,76,0.12)] border-pulse cursor-copy"
      : file
      ? "border-[rgba(201,168,76,0.4)] bg-[#0d1118] hover:border-[rgba(201,168,76,0.6)] cursor-pointer"
      : "border-[#141c28] bg-[#0d1118] hover:border-[#1e2838] hover:bg-[#0f1420] cursor-pointer",
  ].join(" ");

  return (
    <div className="w-full space-y-4">

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => isInteractive && inputRef.current?.click()}
        className={dropZoneClass}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav,.ogg,.flac,.aac,.m4a,.aiff"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {/* Disabled overlay */}
        {disabled && (
          <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 z-10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2a3545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <p className="text-[11px] font-mono text-[#2a3545]">Select a mode above to unlock</p>
          </div>
        )}

        {/* Upload icon / spinner */}
        <div
          className={[
            "w-20 h-20 rounded-2xl border flex items-center justify-center transition-all duration-200",
            dragging
              ? "border-[#c9a84c] bg-[rgba(201,168,76,0.14)]"
              : running
              ? "border-[rgba(201,168,76,0.4)] bg-[#111820]"
              : "border-[#1a2030] bg-[#111820]",
          ].join(" ")}
        >
          {running ? (
            <div className="w-8 h-8 border-[3px] border-[#c9a84c] border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={dragging ? "#c9a84c" : disabled ? "#1e2838" : "#3d4d5c"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </div>

        {/* Text content */}
        {!disabled && (
          file ? (
            <div className="flex flex-col items-center gap-2">
              <div className={[
                "inline-flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-200",
                sizeError
                  ? "bg-[rgba(224,86,86,0.1)] border-[rgba(224,86,86,0.35)]"
                  : "bg-[rgba(201,168,76,0.08)] border-[rgba(201,168,76,0.25)]",
              ].join(" ")}>
                <span className="w-2 h-2 rounded-full bg-[#c9a84c] flex-shrink-0" />
                <span className="text-[13px] font-mono text-[#eef2f7] max-w-[260px] truncate">{file.name}</span>
                <span className="text-[11px] font-mono text-[#4a5a70] flex-shrink-0">{fileSizeStr(file.size)}</span>
                {!running && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setSizeError(false); }}
                    className="text-[#2a3545] hover:text-[#e05656] transition-colors duration-150 text-sm leading-none ml-0.5"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p className="text-[10px] font-mono text-[#2a3545]">
                {running ? "Analyzing your sample…" : "Click to swap file"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center px-6">
              <p className="font-['Syne',sans-serif] font-semibold text-[17px] text-[#c8d5e2] leading-snug">
                Drop your sample here
              </p>
              <p className="text-[11px] font-mono text-[#3d4d5c]">
                or <span className="text-[#c9a84c]">browse files</span> &nbsp;·&nbsp; MP3, WAV, FLAC, AAC &nbsp;·&nbsp; Max 4 MB
              </p>
            </div>
          )
        )}

        {/* Size error */}
        {sizeError && (
          <p className="text-[11px] font-mono text-[#e05656] animate-fade-in">
            File too large — max 4 MB
          </p>
        )}

        {/* Mode badge */}
        {!disabled && (
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-mono tracking-[2px] uppercase text-[#2a3545]">Mode</span>
            <span className="text-[9px] font-mono px-3 py-1 rounded-full border border-[rgba(201,168,76,0.3)] text-[#c9a84c] bg-[rgba(201,168,76,0.06)] tracking-[0.5px]">
              {GENRE_LABELS[genre]}
            </span>
          </div>
        )}
      </div>

      {/* 2-pass progress bar — shown during analysis */}
      {running && (
        <div className="animate-fade-in space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full border transition-all duration-500 ${
                analysisPass >= 1
                  ? "text-[#c9a84c] border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)]"
                  : "text-[#2a3545] border-[#141c28]"
              }`}>Pass 1 · Audio</span>
              <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full border transition-all duration-500 ${
                analysisPass >= 2
                  ? "text-[#c9a84c] border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.08)]"
                  : "text-[#2a3545] border-[#141c28]"
              }`}>Pass 2 · Prompt</span>
            </div>
            <span className="text-[9px] font-mono text-[#2a3545]">Usually 8–12 seconds</span>
          </div>
          <div className="h-[3px] rounded-full bg-[#111820] overflow-hidden">
            <div className="h-full rounded-full bg-[#c9a84c] shimmer" style={{ width: analysisPass === 1 ? "45%" : "90%" }} />
          </div>
        </div>
      )}

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || running || disabled}
        className={[
          "w-full h-[58px] rounded-2xl font-['Syne',sans-serif] font-extrabold text-[13px]",
          "tracking-[3px] uppercase transition-all duration-200 flex items-center justify-center gap-3",
          file && !running && !disabled
            ? [
                "bg-[#c9a84c] text-[#080a0c]",
                "hover:bg-[#dab85e] hover:scale-[1.015]",
                "hover:shadow-[0_16px_50px_rgba(201,168,76,0.35)]",
                "active:scale-100 active:shadow-none",
              ].join(" ")
            : "bg-[#0d1118] text-[#1e2838] border-2 border-[#141c28] cursor-not-allowed",
        ].join(" ")}
      >
        {running ? (
          <>
            <span className="w-4 h-4 border-[2.5px] border-[#080a0c] border-t-transparent rounded-full animate-spin" />
            Analyzing…
          </>
        ) : (
          "Analyze Sample → Generate Prompt"
        )}
      </button>

    </div>
  );
}
