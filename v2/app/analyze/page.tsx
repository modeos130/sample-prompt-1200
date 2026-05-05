"use client";

import { useRef, useState } from "react";

const ACCEPTED_AUDIO = ".mp3,.wav,.m4a,.flac,.aac,.ogg";

function formatFile(file: File) {
  return `${file.name} (${(file.size / 1048576).toFixed(1)} MB)`;
}

export default function AnalyzePage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const [analysisCopyFailed, setAnalysisCopyFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // Fall through to textarea fallback.
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

  const chooseFile = (nextFile?: File) => {
    if (!nextFile) return;
    setFile(nextFile);
    setAnalysisResult("");
    setAnalysisCopied(false);
    setAnalysisCopyFailed(false);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setAnalysisResult("");
    setAnalysisCopied(false);
    setAnalysisCopyFailed(false);
    setUploadProgress("Uploading audio...");

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
      setAnalysisResult(data.prompt || data.generatedPrompt || data.error || "No result returned.");
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

  return (
    <div className="analysis-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .analysis-page {
          --bg: #080a0f;
          --panel: #101117;
          --panel2: #15161f;
          --line: #282a36;
          --text: #f1f2f6;
          --muted: #9ca0b4;
          --dim: #666b82;
          --red: #ff4d6d;
          --orange: #ff9a3c;
          --gold: #d7b56d;
          --cyan: #54d4e8;
          min-height: 100vh;
          color: var(--text);
          background:
            linear-gradient(180deg, rgba(84,212,232,0.055), transparent 300px),
            var(--bg);
          font-family: 'DM Sans', sans-serif;
        }

        .analysis-page * {
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

        .brand,
        .nav-pill,
        .status-pill,
        .hero-kicker,
        .feature-link,
        .analysis-title,
        .drop-title,
        .action-button,
        .detail-label {
          font-family: 'Syne', sans-serif;
          letter-spacing: 0;
          text-transform: uppercase;
        }

        .brand {
          flex-shrink: 0;
          color: var(--text);
          font-size: 18px;
          font-weight: 800;
          line-height: 1;
          text-decoration: none;
        }

        .brand span {
          color: var(--cyan);
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
          border-color: rgba(84,212,232,0.55);
          background: rgba(84,212,232,0.08);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(84,212,232,0.32);
          border-radius: 999px;
          padding: 6px 12px;
          color: var(--cyan);
          background: rgba(84,212,232,0.08);
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .hero {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--line);
          background:
            linear-gradient(90deg, rgba(84,212,232,0.15), rgba(215,181,109,0.06), transparent 70%),
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
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .hero-title {
          max-width: 780px;
          margin: 0;
          color: var(--text);
          font-family: 'Syne', sans-serif;
          font-size: 64px;
          font-weight: 800;
          line-height: 0.9;
          text-transform: uppercase;
        }

        .hero-title span {
          color: var(--cyan);
        }

        .hero-copy {
          max-width: 620px;
          margin: 16px 0 0;
          color: var(--muted);
          font-size: 17px;
          line-height: 1.6;
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
          font-size: 10px;
          font-weight: 800;
          text-decoration: none;
          transition: border-color 150ms ease, color 150ms ease, background 150ms ease;
        }

        .feature-link:hover {
          color: var(--text);
          border-color: rgba(84,212,232,0.48);
        }

        .feature-link.active {
          color: #0a0a0f;
          border-color: transparent;
          background: linear-gradient(135deg, var(--cyan), var(--gold));
        }

        .shell {
          max-width: 1180px;
          margin: 0 auto;
          padding: 24px 24px 72px;
        }

        .analysis-panel {
          border: 1px solid var(--line);
          border-radius: 12px;
          background: var(--panel);
          overflow: hidden;
          animation: panelRise 420ms ease;
        }

        .analysis-head {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 22px;
          border-bottom: 1px solid var(--line);
          background: linear-gradient(90deg, rgba(84,212,232,0.1), rgba(215,181,109,0.04));
        }

        .analysis-title {
          color: var(--text);
          font-size: 24px;
          font-weight: 800;
          line-height: 1;
          margin: 0 0 8px;
        }

        .analysis-copy {
          max-width: 720px;
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
        }

        .detail-pill {
          border: 1px solid rgba(215,181,109,0.28);
          border-radius: 999px;
          padding: 8px 12px;
          color: var(--gold);
          background: rgba(215,181,109,0.07);
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .analysis-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 18px;
          padding: 22px;
        }

        .input-panel,
        .guide-panel,
        .analysis-result {
          border: 1px solid var(--line);
          border-radius: 10px;
          background: #0b0c12;
        }

        .input-panel {
          padding: 18px;
        }

        .drop-zone {
          position: relative;
          overflow: hidden;
          border: 1px dashed rgba(84,212,232,0.44);
          border-radius: 10px;
          padding: 38px 20px;
          text-align: center;
          cursor: pointer;
          background: rgba(84,212,232,0.035);
          transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
        }

        .drop-zone::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(115deg, transparent 0 42%, rgba(84,212,232,0.12) 50%, transparent 58% 100%);
          opacity: 0;
          transform: translateX(-35%);
          transition: opacity 180ms ease, transform 280ms ease;
        }

        .drop-zone:hover,
        .drop-zone.dragging {
          border-color: var(--cyan);
          background: rgba(84,212,232,0.08);
          transform: translateY(-1px);
        }

        .drop-zone:hover::before,
        .drop-zone.dragging::before {
          opacity: 1;
          transform: translateX(35%);
        }

        .drop-title {
          color: var(--text);
          font-size: 15px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .drop-meta {
          color: var(--dim);
          font-size: 13px;
          line-height: 1.6;
        }

        .upload-note {
          margin-top: 14px;
          border: 1px solid rgba(215,181,109,0.18);
          border-radius: 10px;
          padding: 14px 16px;
          color: var(--muted);
          background: rgba(215,181,109,0.05);
          font-size: 13px;
          line-height: 1.6;
        }

        .action-button {
          width: 100%;
          min-height: 50px;
          margin-top: 18px;
          border: 0;
          border-radius: 8px;
          color: #0a0a0f;
          background: linear-gradient(135deg, var(--cyan), var(--gold));
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          transition: transform 150ms ease, opacity 150ms ease;
        }

        .action-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .action-button:disabled {
          opacity: 0.38;
          cursor: not-allowed;
        }

        .action-button.secondary {
          margin-top: 14px;
          color: var(--cyan);
          border: 1px solid rgba(84,212,232,0.35);
          background: rgba(84,212,232,0.1);
        }

        .action-button.secondary.copied {
          color: #0a0a0f;
          border-color: transparent;
          background: linear-gradient(135deg, var(--cyan), var(--gold));
        }

        .guide-panel {
          padding: 18px;
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .guide-panel:hover {
          transform: translateY(-2px);
          border-color: rgba(215,181,109,0.25);
          background: rgba(14,15,22,0.96);
        }

        .detail-label {
          color: var(--gold);
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .guide-panel p,
        .guide-panel li {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .guide-panel p {
          margin: 0 0 14px;
        }

        .guide-panel ul {
          margin: 0;
          padding-left: 18px;
        }

        .analysis-result {
          grid-column: 1 / -1;
          padding: 18px;
        }

        .analysis-result pre {
          white-space: pre-wrap;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          line-height: 1.7;
          margin: 0;
        }

        .result-meta {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 12px;
          color: var(--dim);
          font-size: 12px;
        }

        @keyframes heroSweep {
          0%, 46% { transform: translateX(-42%); opacity: 0; }
          56% { opacity: 1; }
          100% { transform: translateX(42%); opacity: 0; }
        }

        @keyframes panelRise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero::before,
          .analysis-panel {
            animation: none;
          }

          .drop-zone,
          .drop-zone:hover,
          .drop-zone.dragging,
          .drop-zone::before,
          .drop-zone:hover::before,
          .drop-zone.dragging::before,
          .guide-panel,
          .guide-panel:hover {
            transform: none;
            transition: none;
          }
        }

        @media (max-width: 850px) {
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

          .hero-inner,
          .shell {
            padding-left: 16px;
            padding-right: 16px;
          }

          .hero-inner {
            padding-top: 38px;
            padding-bottom: 28px;
          }

          .hero-title {
            font-size: 42px;
          }

          .hero-copy {
            font-size: 15px;
          }

          .analysis-head,
          .analysis-body {
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
        <div className="status-pill">Sample Analysis</div>
      </header>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-kicker">Sample Prompt 1200</div>
          <h1 className="hero-title">
            Sample <span>Analysis</span>
          </h1>
          <p className="hero-copy">
            Upload a reference and convert its sonic fingerprint into a one-paragraph prompt for
            your preferred AI music tool.
          </p>
          <div className="feature-nav" aria-label="Tool navigation">
            <a className="feature-link" href="/studio.html">
              Sound Studio
            </a>
            <a className="feature-link" href="/prompts">
              Prompt Library
            </a>
            <a className="feature-link active" href="/analyze">
              Sample Analysis
            </a>
            <a className="feature-link" href="/create.html">
              Create Your Own
            </a>
          </div>
        </div>
      </section>

      <main className="shell">
        <section className="analysis-panel" aria-label="Sample analysis">
          <div className="analysis-head">
            <div>
              <h2 className="analysis-title">Build Prompt DNA From Audio</h2>
              <p className="analysis-copy">
                The analyzer listens for era, place, instrumentation, modal color, texture, and
                sample-ready mood, then returns a compact prompt built for copy/paste.
              </p>
            </div>
            <div className="detail-pill">Audio Upload</div>
          </div>

          <div className="analysis-body">
            <section className="input-panel">
              <div
                className={`drop-zone ${dragging ? "dragging" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => fileRef.current?.click()}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    fileRef.current?.click();
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  chooseFile(event.dataTransfer.files[0]);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept={ACCEPTED_AUDIO}
                  hidden
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />
                <div className="drop-title">{file ? formatFile(file) : "Drop Audio Here"}</div>
                <div className="drop-meta">
                  {file ? "Click to change file" : "MP3, WAV, M4A, FLAC, AAC, or OGG"}
                </div>
              </div>

              <div className="upload-note">
                Trimmed clips usually work best. Use a section with the core mood, instruments,
                and recording texture you want translated.
              </div>

              <button
                className="action-button"
                onClick={handleAnalyze}
                disabled={!file || analyzing}
                type="button"
                aria-live="polite"
              >
                {analyzing ? uploadProgress || "Processing..." : "Analyze Sample"}
              </button>
            </section>

            <aside className="guide-panel">
              <div className="detail-label">Output Rules</div>
              <p>
                The result is a single paragraph under 1000 characters with no real names and no
                rhythm descriptions.
              </p>
              <ul>
                <li>Era and geographic specificity</li>
                <li>Precise instrument language</li>
                <li>Minor or modal emotional color</li>
                <li>Scarcity framing and loopable intent</li>
              </ul>
            </aside>

            {analysisResult && (
              <section className="analysis-result" aria-label="Generated prompt">
                <pre>{analysisResult}</pre>
                <button
                  onClick={copyAnalysis}
                  className={`action-button secondary ${analysisCopied ? "copied" : ""}`}
                  type="button"
                >
                  {analysisCopied ? "Copied" : analysisCopyFailed ? "Copy Failed" : "Copy Prompt"}
                </button>
                <div className="result-meta">
                  <span>{analysisResult.length}/1000 characters</span>
                  <span>Generated prompt</span>
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
