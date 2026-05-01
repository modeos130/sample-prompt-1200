"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_PROMPTS, ALL_GENRES, type Prompt } from "@/lib/prompts";

type Mode = "library" | "analysis";

function genreLabel(genre: string) {
  return genre.replace(/-/g, " ");
}

function genreCount(genre: string) {
  return ALL_PROMPTS.filter((p) => p.genre === genre).length;
}

const QUICK_GENRES = [
  "all",
  "dark-underground",
  "cinematic-dark",
  "vocal-chop",
  "italian-film",
  "vietnamese-soul",
  "boom-bap",
];

export default function PromptsPage() {
  const [mode, setMode] = useState<Mode>("library");
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyFailedId, setCopyFailedId] = useState<string | null>(null);
  const [drawerPromptId, setDrawerPromptId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const [analysisCopyFailed, setAnalysisCopyFailed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (window.location.hash === "#analysis") {
      setMode("analysis");
    }
  }, []);

  const selectedPrompt = useMemo(
    () => ALL_PROMPTS.find((p) => p.id === drawerPromptId) ?? null,
    [drawerPromptId]
  );

  const filtered = useMemo(() => {
    return ALL_PROMPTS.filter((p) => {
      const matchesGenre = activeGenre === "all" || p.genre === activeGenre;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.genre.toLowerCase().includes(q) ||
        p.vibe.toLowerCase().includes(q);
      return matchesGenre && matchesSearch;
    });
  }, [search, activeGenre]);

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to the textarea fallback below.
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const copyPrompt = async (prompt: Prompt) => {
    setDrawerPromptId(prompt.id);
    const copied = await copyText(prompt.vibe);
    setCopyFailedId(copied ? null : prompt.id);
    if (copied) {
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setAnalysisResult("");
    setUploadProgress("Uploading to Gemini...");
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const uploadRes = await fetch("/api/upload-audio", {
        method: "POST",
        body: uploadForm,
      });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
        setAnalysisResult(errData.error || "Failed to upload audio.");
        return;
      }
      const { fileUri, mimeType } = await uploadRes.json();

      setUploadProgress("Analyzing sonic DNA...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUri, mimeType }),
      });
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({ error: "Analysis failed" }));
        setAnalysisResult(errData.error || "Analysis failed.");
        return;
      }
      const data = await analyzeRes.json();
      setAnalysisResult(data.prompt || data.generatedPrompt || data.error || "No result");
    } catch {
      setAnalysisResult("Analysis failed. Check your connection and try again.");
    } finally {
      setAnalyzing(false);
      setUploadProgress("");
    }
  };

  const copyAnalysis = async () => {
    const copied = await copyText(analysisResult);
    setAnalysisCopyFailed(!copied);
    if (copied) {
      setAnalysisCopied(true);
      setTimeout(() => setAnalysisCopied(false), 2000);
    }
  };

  const chooseMode = (nextMode: Mode) => {
    setMode(nextMode);
    const nextUrl = nextMode === "analysis" ? "#analysis" : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  };

  return (
    <div className="prompt-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .prompt-page {
          --bg: #080a0f;
          --panel: #101117;
          --panel-2: #15161f;
          --line: #282a36;
          --text: #f1f2f6;
          --muted: #9ca0b4;
          --dim: #666b82;
          --red: #ff4d6d;
          --orange: #ff9a3c;
          --gold: #d7b56d;
          --cyan: #54d4e8;
          min-height: 100vh;
          background:
            linear-gradient(180deg, rgba(255,77,109,0.04), transparent 280px),
            var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
        }

        .prompt-page * {
          box-sizing: border-box;
        }

        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 24px;
          border-bottom: 1px solid var(--line);
          background: rgba(8,10,15,0.88);
          backdrop-filter: blur(16px);
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .brand {
          flex-shrink: 0;
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1;
          text-decoration: none;
        }

        .brand span {
          color: var(--red);
        }

        .nav-pill,
        .mode-button,
        .genre-chip,
        .card-button,
        .drawer-button,
        .analyze-button {
          font-family: 'Syne', sans-serif;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .nav-pill {
          color: var(--muted);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
          transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
        }

        .nav-pill:hover {
          color: var(--text);
          border-color: rgba(255,77,109,0.55);
          background: rgba(255,77,109,0.08);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(215,181,109,0.32);
          border-radius: 999px;
          padding: 6px 12px;
          color: var(--gold);
          background: rgba(215,181,109,0.08);
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--line);
          background:
            linear-gradient(90deg, rgba(255,77,109,0.16), rgba(255,154,60,0.05), transparent 70%),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 7px),
            #0b0c12;
        }

        .hero-inner {
          max-width: 1180px;
          margin: 0 auto;
          padding: 52px 24px 34px;
        }

        .hero-kicker {
          color: var(--gold);
          font-family: 'Syne', sans-serif;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .hero-title {
          max-width: 780px;
          margin: 0;
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 64px;
          font-weight: 800;
          letter-spacing: 0;
          line-height: 0.9;
          text-transform: uppercase;
        }

        .hero-title span {
          color: var(--red);
        }

        .hero-copy {
          max-width: 620px;
          margin: 16px 0 0;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.6;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 22px;
        }

        .meta-badge {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 8px 12px;
          color: var(--muted);
          background: rgba(255,255,255,0.035);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
        }

        .meta-badge strong {
          color: var(--text);
        }

        .shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 22px 24px 72px;
        }

        .mode-switch {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          max-width: 700px;
          padding: 6px;
          border: 1px solid var(--line);
          border-radius: 10px;
          background: rgba(16,17,23,0.86);
        }

        .mode-button {
          min-height: 42px;
          border: 0;
          border-radius: 7px;
          color: var(--muted);
          background: transparent;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          text-decoration: none;
          transition: color 150ms ease, background 150ms ease, transform 150ms ease;
        }

        .mode-button:hover {
          color: var(--text);
          background: rgba(255,255,255,0.045);
        }

        .mode-link {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mode-button.active {
          color: #0a0a0f;
          background: linear-gradient(135deg, var(--red), var(--orange));
        }

        .filter-panel {
          position: sticky;
          top: 57px;
          z-index: 10;
          margin-top: 18px;
          padding: 14px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: rgba(10,11,17,0.92);
          backdrop-filter: blur(16px);
        }

        .filter-row {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) 250px;
          gap: 10px;
        }

        .search-input,
        .genre-select {
          width: 100%;
          min-height: 44px;
          border: 1px solid var(--line);
          border-radius: 8px;
          outline: none;
          color: var(--text);
          background: #0b0c12;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
        }

        .search-input {
          padding: 0 14px;
        }

        .genre-select {
          padding: 0 12px;
          text-transform: uppercase;
        }

        .search-input:focus,
        .genre-select:focus,
        .prompt-textarea:focus {
          border-color: rgba(255,77,109,0.75);
          box-shadow: 0 0 0 3px rgba(255,77,109,0.14);
        }

        .quick-genres {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .genre-chip {
          flex: 0 0 auto;
          min-height: 32px;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 0 12px;
          color: var(--muted);
          background: #11121a;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .genre-chip.active {
          color: var(--red);
          border-color: rgba(255,77,109,0.56);
          background: rgba(255,77,109,0.12);
        }

        .results-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin: 18px 0 14px;
          color: var(--dim);
          font-size: 13px;
        }

        .prompt-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          align-items: stretch;
        }

        .prompt-card {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: var(--panel);
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }

        .prompt-card:hover {
          border-color: rgba(255,77,109,0.36);
          box-shadow: 0 18px 44px rgba(0,0,0,0.32);
          transform: translateY(-2px);
        }

        .art-wrap {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #0a0b10;
        }

        .art-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .card-body {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 14px;
        }

        .prompt-name {
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1.15;
          margin-bottom: 5px;
        }

        .prompt-genre {
          color: var(--gold);
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .prompt-excerpt {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          flex: 1;
          overflow: hidden;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 14px;
        }

        .card-actions {
          display: grid;
          grid-template-columns: 1fr 0.8fr;
          gap: 8px;
        }

        .card-button,
        .drawer-button,
        .analyze-button {
          min-height: 40px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
          transition: transform 150ms ease, border-color 150ms ease, background 150ms ease;
        }

        .card-button.primary,
        .drawer-button.primary,
        .analyze-button {
          color: var(--red);
          border: 1px solid rgba(255,77,109,0.3);
          background: linear-gradient(135deg, rgba(255,77,109,0.18), rgba(255,154,60,0.1));
        }

        .card-button.primary.copied,
        .drawer-button.primary.copied {
          color: var(--cyan);
          border-color: rgba(84,212,232,0.45);
          background: rgba(84,212,232,0.11);
        }

        .card-button.secondary,
        .drawer-button.secondary {
          color: var(--muted);
          border: 1px solid var(--line);
          background: #0b0c12;
        }

        .card-button:hover,
        .drawer-button:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.22);
        }

        .analysis-panel {
          margin-top: 18px;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--panel);
          overflow: hidden;
        }

        .analysis-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 22px;
          border-bottom: 1px solid var(--line);
          background: linear-gradient(90deg, rgba(255,77,109,0.1), rgba(215,181,109,0.04));
        }

        .analysis-title {
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0;
          margin: 0 0 8px;
          text-transform: uppercase;
        }

        .analysis-copy {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .analysis-body {
          padding: 22px;
        }

        .drop-zone {
          border: 1px dashed rgba(255,77,109,0.38);
          border-radius: 10px;
          padding: 34px 20px;
          text-align: center;
          cursor: pointer;
          background: rgba(255,77,109,0.035);
          transition: border-color 150ms ease, background 150ms ease;
        }

        .drop-zone:hover,
        .drop-zone.dragging {
          border-color: var(--red);
          background: rgba(255,77,109,0.07);
        }

        .drop-title {
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 6px;
          text-transform: uppercase;
        }

        .drop-meta,
        .upload-note {
          color: var(--dim);
          font-size: 13px;
          line-height: 1.6;
        }

        .upload-note {
          margin-top: 14px;
          border: 1px solid rgba(215,181,109,0.18);
          border-radius: 10px;
          padding: 14px 16px;
          background: rgba(215,181,109,0.05);
        }

        .analyze-button {
          width: 100%;
          margin-top: 18px;
          border: 0;
          min-height: 50px;
          color: #0a0a0f;
          background: linear-gradient(135deg, var(--red), var(--orange));
        }

        .analyze-button:disabled {
          color: rgba(255,255,255,0.35);
          cursor: not-allowed;
          background: rgba(255,77,109,0.16);
        }

        .analysis-result {
          margin-top: 18px;
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 18px;
          background: #0b0c12;
        }

        .analysis-result pre {
          white-space: pre-wrap;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.7;
          margin: 0 0 14px;
        }

        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
          display: flex;
          justify-content: flex-end;
          background: rgba(0,0,0,0.58);
          backdrop-filter: blur(8px);
        }

        .prompt-drawer {
          width: min(520px, 100%);
          height: 100%;
          overflow-y: auto;
          border-left: 1px solid var(--line);
          background: #0c0d13;
          box-shadow: -28px 0 70px rgba(0,0,0,0.45);
        }

        .drawer-header {
          position: sticky;
          top: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 18px;
          border-bottom: 1px solid var(--line);
          background: rgba(12,13,19,0.94);
          backdrop-filter: blur(14px);
        }

        .drawer-kicker {
          color: var(--gold);
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .drawer-title {
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 24px;
          font-weight: 800;
          line-height: 1.05;
          margin: 2px 0 0;
        }

        .close-button {
          flex: 0 0 auto;
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 9px 12px;
          color: var(--muted);
          background: #11121a;
          cursor: pointer;
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .drawer-body {
          padding: 18px;
        }

        .drawer-art {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: #0a0b10;
        }

        .drawer-art img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .prompt-textarea {
          width: 100%;
          min-height: 260px;
          margin-top: 14px;
          resize: vertical;
          border: 1px solid var(--line);
          border-radius: 8px;
          outline: none;
          padding: 14px;
          color: var(--text);
          background: #080a0f;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          line-height: 1.7;
        }

        .drawer-actions {
          display: grid;
          grid-template-columns: 1fr 0.7fr;
          gap: 10px;
          margin-top: 12px;
        }

        .drawer-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 10px;
          color: var(--dim);
          font-size: 12px;
        }

        @media (max-width: 760px) {
          .topbar {
            align-items: flex-start;
            flex-direction: column;
            padding: 14px 16px;
          }

          .topbar-left {
            width: 100%;
            flex-wrap: wrap;
          }

          .status-pill {
            display: none;
          }

          .hero-inner {
            padding: 38px 16px 28px;
          }

          .hero-title {
            font-size: 42px;
          }

          .hero-copy {
            font-size: 15px;
          }

          .shell {
            padding: 18px 16px 54px;
          }

          .mode-switch {
            max-width: none;
          }

          .filter-panel {
            position: static;
          }

          .filter-row,
          .analysis-head {
            grid-template-columns: 1fr;
          }

          .prompt-grid {
            grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
            gap: 12px;
          }

          .card-body {
            padding: 12px;
          }

          .card-actions,
          .drawer-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="topbar-left">
          <a href="/studio.html" className="brand">
            BOOMAN <span>LAB</span>
          </a>
          <a href="/admin/invite" className="nav-pill">
            Invite
          </a>
          <a href="/account" className="nav-pill">
            Account
          </a>
        </div>
        <div className="status-pill">Prompt Library</div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-kicker">Sample Prompt 1200</div>
          <h1 className="hero-title">
            Prompt <span>Library</span>
          </h1>
          <p className="hero-copy">
            {ALL_PROMPTS.length} source-record prompts built for sample-based music:
            obscure scenes, precise instruments, modal color, and loopable forms.
          </p>
          <div className="hero-meta">
            <div className="meta-badge">
              <strong>{ALL_PROMPTS.length}</strong> prompts
            </div>
            <div className="meta-badge">
              <strong>{ALL_GENRES.length}</strong> genres
            </div>
            <div className="meta-badge">
              <strong>1000</strong> char max
            </div>
            <div className="meta-badge">
              <strong>No</strong> real names
            </div>
          </div>
        </div>
      </section>

      <main className="shell">
        <div className="mode-switch" role="tablist" aria-label="Prompt tools">
          <a href="/studio.html" className="mode-button mode-link" role="tab">
            Studio
          </a>
          <button
            className={`mode-button ${mode === "library" ? "active" : ""}`}
            onClick={() => chooseMode("library")}
            type="button"
            role="tab"
            aria-selected={mode === "library"}
          >
            Library
          </button>
          <button
            className={`mode-button ${mode === "analysis" ? "active" : ""}`}
            onClick={() => chooseMode("analysis")}
            type="button"
            role="tab"
            aria-selected={mode === "analysis"}
          >
            Sample Analysis
          </button>
        </div>

        {mode === "library" ? (
          <>
            <section className="filter-panel" aria-label="Prompt filters">
              <div className="filter-row">
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search by sound, instrument, region, or mood..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="genre-select"
                  value={activeGenre}
                  onChange={(e) => setActiveGenre(e.target.value)}
                  aria-label="Filter by genre"
                >
                  <option value="all">All genres ({ALL_PROMPTS.length})</option>
                  {ALL_GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genreLabel(genre)} ({genreCount(genre)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="quick-genres" aria-label="Quick genres">
                {QUICK_GENRES.map((genre) => {
                  const active = activeGenre === genre;
                  const count = genre === "all" ? ALL_PROMPTS.length : genreCount(genre);
                  return (
                    <button
                      key={genre}
                      className={`genre-chip ${active ? "active" : ""}`}
                      onClick={() => setActiveGenre(genre)}
                      type="button"
                    >
                      {genre === "all" ? "All" : genreLabel(genre)} ({count})
                    </button>
                  );
                })}
              </div>
            </section>

            <div className="results-line">
              <span>
                Showing {filtered.length} of {ALL_PROMPTS.length}
              </span>
              <span>{activeGenre === "all" ? "All genres" : genreLabel(activeGenre)}</span>
            </div>

            <section className="prompt-grid" aria-label="Prompt cards">
              {filtered.map((prompt) => (
                <article className="prompt-card" key={prompt.id}>
                  <div className="art-wrap">
                    <img src={prompt.art} alt={prompt.name} />
                  </div>
                  <div className="card-body">
                    <h2 className="prompt-name">{prompt.name}</h2>
                    <div className="prompt-genre">{genreLabel(prompt.genre)}</div>
                    <p className="prompt-excerpt">{prompt.vibe}</p>
                    <div className="card-actions">
                      <button
                        className={`card-button primary ${copiedId === prompt.id ? "copied" : ""}`}
                        onClick={() => copyPrompt(prompt)}
                        type="button"
                      >
                        {copiedId === prompt.id ? "Copied" : copyFailedId === prompt.id ? "Ready" : "Copy To Suno"}
                      </button>
                      <button
                        className="card-button secondary"
                        onClick={() => setDrawerPromptId(prompt.id)}
                        type="button"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : (
          <section className="analysis-panel" aria-label="Sample analysis">
            <div className="analysis-head">
              <div>
                <h2 className="analysis-title">Sample Analysis</h2>
                <p className="analysis-copy">
                  Drop an audio file and generate a Suno-ready prompt from its sonic DNA.
                </p>
              </div>
              <div className="meta-badge">
                <strong>MP3</strong> recommended
              </div>
            </div>

            <div className="analysis-body">
              <div
                className="drop-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("dragging");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("dragging");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("dragging");
                  const droppedFile = e.dataTransfer.files[0];
                  if (droppedFile) setFile(droppedFile);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.flac"
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) setFile(e.target.files[0]);
                  }}
                />
                <div className="drop-title">
                  {file ? `${file.name} (${(file.size / 1048576).toFixed(1)} MB)` : "Drop audio here"}
                </div>
                <div className="drop-meta">
                  {file ? "Click to change file" : ".mp3 .wav .m4a .flac, max 4 MB"}
                </div>
              </div>

              <div className="upload-note">
                MP3 files work best. A trimmed 30-60 second section is usually enough for accurate analysis.
              </div>

              <button
                className="analyze-button"
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                type="button"
              >
                {analyzing ? uploadProgress || "Processing..." : "Analyze Sample"}
              </button>

              {analysisResult && (
                <div className="analysis-result">
                  <pre>{analysisResult}</pre>
                  <button
                    onClick={copyAnalysis}
                    className={`drawer-button primary ${analysisCopied ? "copied" : ""}`}
                    type="button"
                  >
                    {analysisCopied ? "Copied" : analysisCopyFailed ? "Prompt Ready" : "Copy To Suno"}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {selectedPrompt && (
        <div
          className="drawer-backdrop"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawerPromptId(null);
          }}
        >
          <aside className="prompt-drawer" aria-label={`${selectedPrompt.name} full prompt`}>
            <div className="drawer-header">
              <div>
                <div className="drawer-kicker">{genreLabel(selectedPrompt.genre)}</div>
                <h2 className="drawer-title">{selectedPrompt.name}</h2>
              </div>
              <button className="close-button" onClick={() => setDrawerPromptId(null)} type="button">
                Close
              </button>
            </div>
            <div className="drawer-body">
              <div className="drawer-art">
                <img src={selectedPrompt.art} alt={selectedPrompt.name} />
              </div>
              <textarea
                className="prompt-textarea"
                readOnly
                value={selectedPrompt.vibe}
                onFocus={(e) => e.currentTarget.select()}
              />
              <div className="drawer-actions">
                <button
                  className={`drawer-button primary ${copiedId === selectedPrompt.id ? "copied" : ""}`}
                  onClick={() => copyPrompt(selectedPrompt)}
                  type="button"
                >
                  {copiedId === selectedPrompt.id ? "Copied" : copyFailedId === selectedPrompt.id ? "Prompt Ready" : "Copy To Suno"}
                </button>
                <button
                  className="drawer-button secondary"
                  onClick={() => setDrawerPromptId(null)}
                  type="button"
                >
                  Done
                </button>
              </div>
              <div className="drawer-meta">
                <span>{selectedPrompt.vibe.length}/1000 characters</span>
                <span>{selectedPrompt.id}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
