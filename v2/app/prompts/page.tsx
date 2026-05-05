"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { ALL_PROMPTS, ALL_GENRES, type Prompt } from "@/lib/prompts";

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
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyFailedId, setCopyFailedId] = useState<string | null>(null);

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
    const copied = await copyText(prompt.vibe);
    setCopyFailedId(copied ? null : prompt.id);
    if (copied) {
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
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

        .hero::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(110deg, transparent 0 30%, rgba(255,255,255,0.05) 46%, transparent 64% 100%);
          transform: translateX(-38%);
          animation: heroSweep 13s ease-in-out infinite;
        }

        .hero-inner {
          position: relative;
          z-index: 1;
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

        .feature-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
        }

        .feature-link {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          padding: 0 12px;
          color: var(--muted);
          background: rgba(255,255,255,0.035);
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0;
          text-decoration: none;
          text-transform: uppercase;
          transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
        }

        .feature-link:hover {
          color: var(--text);
          border-color: rgba(255,77,109,0.45);
        }

        .feature-link.active {
          color: #0a0a0f;
          border-color: transparent;
          background: linear-gradient(135deg, var(--red), var(--orange));
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
          animation: cardRise 360ms ease backwards;
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }

        .prompt-card:hover {
          border-color: rgba(255,77,109,0.36);
          box-shadow: 0 18px 44px rgba(0,0,0,0.32);
          transform: translateY(-2px);
        }

        .art-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: #0a0b10;
        }

        .art-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 220ms ease, filter 220ms ease;
        }

        .art-wrap::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 0 42%, rgba(255,255,255,0.14) 50%, transparent 58% 100%);
          opacity: 0;
          transform: translateX(-35%);
          transition: opacity 180ms ease, transform 260ms ease;
        }

        .prompt-card:hover .art-wrap img {
          filter: saturate(1.08) contrast(1.04);
          transform: scale(1.025);
        }

        .prompt-card:hover .art-wrap::after {
          opacity: 1;
          transform: translateX(35%);
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
          grid-template-columns: 1fr;
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

        .prompt-card:nth-child(2n) { animation-delay: 35ms; }
        .prompt-card:nth-child(3n) { animation-delay: 70ms; }
        .prompt-card:nth-child(5n) { animation-delay: 105ms; }

        @keyframes heroSweep {
          0%, 46% { transform: translateX(-42%); opacity: 0; }
          56% { opacity: 1; }
          100% { transform: translateX(42%); opacity: 0; }
        }

        @keyframes cardRise {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero::before,
          .prompt-card {
            animation: none;
          }

          .prompt-card,
          .prompt-card:hover,
          .prompt-card:hover .art-wrap img,
          .art-wrap::after,
          .prompt-card:hover .art-wrap::after {
            transform: none;
            transition: none;
          }
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
          <a href="/home" className="brand">
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
            Source-record prompts built for sample-based music: obscure scenes, precise
            instruments, modal color, and loopable forms.
          </p>
          <div className="feature-nav" aria-label="Tool navigation">
            <a className="feature-link" href="/studio.html">
              Sound Studio
            </a>
            <a className="feature-link active" href="/prompts">
              Prompt Library
            </a>
            <a className="feature-link" href="/analyze">
              Sample Analysis
            </a>
            <a className="feature-link" href="/create.html">
              Create Your Own
            </a>
          </div>
        </div>
      </section>

      <main className="shell">
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
                    {copiedId === prompt.id ? "Copied" : copyFailedId === prompt.id ? "Copy Failed" : "Copy Prompt"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
