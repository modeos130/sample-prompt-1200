"use client";

import { useRef, useState } from "react";
import type { Genre } from "./GenreSelector";

interface Props {
  genre: Genre;
  onResult: (analysis: string, prompt: string) => void;
  onStatusChange: (status: "idle" | "pass1" | "pass2" | "done" | "error", msg?: string) => void;
}

const GENRE_LABELS: Record<Genre, string> = {
  "boom-bap": "Boom Bap Hip Hop",
  house: "House Music",
  trap: "Trap Music",
};

function fileSizeStr(n: number): string {
  return n >= 1_048_576 ? `${(n / 1_048_576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export default function AudioUploader({ genre, onResult, onStatusChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [running, setRunning] = useState(false);

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

      // stream-style: single fetch call that does both passes server-side
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

  return (
    <div className="w-full">
      {/* mode badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[9px] font-mono font-medium tracking-[3px] uppercase text-[#3d4d5c]">
          Mode
        </span>
        <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-[#c9a84c] text-[#c9a84c] bg-[rgba(201,168,76,0.06)]">
          {GENRE_LABELS[genre]}
        </span>
      </div>

      {/* drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "rounded-[14px] border border-dashed p-8 flex flex-col items-center justify-center gap-3",
          "cursor-pointer transition-all duration-200 select-none",
          dragging
            ? "border-[#c9a84c] bg-[rgba(201,168,76,0.06)]"
            : "border-[#28333f] bg-[#141820] hover:border-[#364452]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp3,.wav"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div className="w-10 h-10 rounded-full border border-[#28333f] flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a6230" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-[12px] font-mono text-[#7e8fa0]">
            Drop a sample here or{" "}
            <span className="text-[#c9a84c] underline underline-offset-2">browse</span>
          </p>
          <p className="text-[10px] font-mono text-[#3d4d5c] mt-1">MP3 or WAV · Max 15 MB</p>
        </div>
      </div>

      {/* file chip */}
      {file && (
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[#1a1f28] border border-[#28333f]">
          <span className="text-[7px] text-[#c9a84c]">●</span>
          <span className="text-[11px] font-mono text-[#d8e2ec] max-w-[200px] truncate">{file.name}</span>
          <span className="text-[10px] font-mono text-[#3d4d5c]">{fileSizeStr(file.size)}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); }}
            className="text-[#3d4d5c] hover:text-[#7e8fa0] ml-1 text-xs leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {/* analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!file || running}
        className={[
          "mt-4 w-full h-[50px] rounded-[10px] font-['Syne',sans-serif] font-bold text-[12px]",
          "tracking-[2px] uppercase transition-all duration-200",
          file && !running
            ? "bg-[#c9a84c] text-[#0a0c0e] hover:bg-[#d4b05a] hover:shadow-[0_6px_28px_rgba(201,168,76,0.22)] hover:-translate-y-px active:translate-y-0"
            : "bg-[#1a1f28] text-[#3d4d5c] cursor-not-allowed",
        ].join(" ")}
      >
        {running ? "Analyzing..." : "Analyze Sample → Generate Prompt"}
      </button>
    </div>
  );
}
