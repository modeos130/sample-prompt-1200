"use client";

import { useRef, useState } from "react";
import type { Genre } from "./GenreSelector";

interface Props {
  genre: Genre;
  onResult: (analysis: string, prompt: string) => void;
  onStatusChange: (status: "idle" | "pass1" | "pass2" | "done" | "error", msg?: string) => void;
}

const GENRE_LABELS: Record<Genre, string> = {
  "boom-bap": "Boom Bap",
  house: "House",
  trap: "Trap",
};

function fileSizeStr(n: number): string {
  return n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export default function AudioUploader({ genre, onResult, onStatusChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile]       = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning]  = useState(false);

  function handleFile(f: File) {
    setFile(f);
    onStatusChange("idle");
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === "audio/mpeg" || f.type === "audio/wav")) handleFile(f);
  }

  async function handleAnalyze() {
    if (!file || running) return;
    setRunning(true);

    try {
      onStatusChange("pass1", "Pass 1 of 2 — Reading and analyzing audio...");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("genre", genre);

      onStatusChange("pass2", "Pass 2 of 2 — Building prompt from analysis...");
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      onResult(data.analysis, data.generatedPrompt);
      onStatusChange("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      onStatusChange("error", msg);
    } finally {
      setRunning(false);
    }
  }

  const dropZoneClass = [
    "rounded-2xl border-2 border-dashed py-20 flex flex-col items-center justify-center gap-5",
    "transition-all duration-200 select-none",
    running ? "cursor-not-allowed opacity-75" : "cursor-pointer",
    dragging
      ? "border-[#c9a84c] bg-[rgba(201,168,76,0.05)] shadow-[0_0_80px_rgba(201,168,76,0.1)] border-pulse"
      : file
      ? "border-[rgba(201,168,76,0.35)] bg-[#0d1118] hover:border-[rgba(201,168,76,0.55)]"
      : "border-[#141c28] bg-[#0d1118] hover:border-[#1e2838] hover:bg-[#0f1420]",
  ].join(" ");

  return (
    <div className="w-full space-y-4">

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !running && inputRef.current?.click()}
        className={dropZoneClass}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {/* Upload icon / spinner */}
        <div
          className={[
            "w-20 h-20 rounded-2xl border flex items-center justify-center transition-all duration-200",
            dragging
              ? "border-[#c9a84c] bg-[rgba(201,168,76,0.12)]"
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
              stroke={dragging ? "#c9a84c" : "#3d4d5c"}
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
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)]">
              <span className="w-2 h-2 rounded-full bg-[#c9a84c] flex-shrink-0" />
              <span className="text-[13px] font-mono text-[#eef2f7] max-w-[280px] truncate">{file.name}</span>
              <span className="text-[11px] font-mono text-[#4a5a70] flex-shrink-0">{fileSizeStr(file.size)}</span>
              {!running && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
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
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[15px] font-mono text-[#8a9bb0]">
              Drop your sample here
            </p>
            <p className="text-[11px] font-mono text-[#2a3545]">
              or <span className="text-[#c9a84c]">browse files</span> &nbsp;·&nbsp; MP3 or WAV &nbsp;·&nbsp; Max 15 MB
            </p>
          </div>
        )}

        {/* Mode badge */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono tracking-[2px] uppercase text-[#2a3545]">Mode</span>
          <span className="text-[9px] font-mono px-3 py-1 rounded-full border border-[rgba(201,168,76,0.3)] text-[#c9a84c] bg-[rgba(201,168,76,0.06)] tracking-[0.5px]">
            {GENRE_LABELS[genre]}
          </span>
        </div>
      </div>

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || running}
        className={[
          "w-full h-[58px] rounded-2xl font-['Syne',sans-serif] font-extrabold text-[13px]",
          "tracking-[3px] uppercase transition-all duration-200 flex items-center justify-center gap-3",
          file && !running
            ? [
                "bg-[#c9a84c] text-[#080a0c]",
                "hover:bg-[#dab85e] hover:-translate-y-0.5",
                "hover:shadow-[0_16px_50px_rgba(201,168,76,0.35)]",
                "active:translate-y-0 active:shadow-none",
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
