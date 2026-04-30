"use client";

import { useState, useRef, useMemo } from "react";
import { ALL_PROMPTS, ALL_GENRES } from "@/lib/prompts";

function GenreCount(genre: string) {
  return ALL_PROMPTS.filter((p) => p.genre === genre).length;
}

export default function PromptsPage() {
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [copyFailedId, setCopyFailedId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const [analysisCopyFailed, setAnalysisCopyFailed] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return ALL_PROMPTS.filter((p) => {
      const matchesGenre = activeGenre === "all" || p.genre === activeGenre;
      const q = search.toLowerCase();
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.vibe.toLowerCase().includes(q);
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

  // CRITICAL: Copy from data array, NOT from DOM
  const copyVibe = async (id: string) => {
    const prompt = ALL_PROMPTS.find((p) => p.id === id);
    if (!prompt) return;
    setSelectedPromptId(id);
    const copied = await copyText(prompt.vibe);
    setCopyFailedId(copied ? null : id);
    if (copied) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const [uploadProgress, setUploadProgress] = useState("");

  // Genre-free DNA analysis via Gemini File API (no size limit)
  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true); setAnalysisResult(""); setUploadProgress("Uploading to Gemini...");
    try {
      // Step 1: Upload file to Gemini File API via our proxy
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const uploadRes = await fetch("/api/upload-audio", { method: "POST", body: uploadForm });
      if (!uploadRes.ok) {
        const errData = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
        setAnalysisResult(errData.error || "Failed to upload audio.");
        return;
      }
      const { fileUri, mimeType } = await uploadRes.json();

      // Step 2: Send only the URI to analyze (lightweight JSON, no file body)
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
    } catch { setAnalysisResult("Analysis failed. Check your connection and try again."); }
    finally { setAnalyzing(false); setUploadProgress(""); }
  };

  const copyAnalysis = async () => {
    const copied = await copyText(analysisResult);
    setAnalysisCopyFailed(!copied);
    if (copied) {
      setAnalysisCopied(true);
      setTimeout(() => setAnalysisCopied(false), 2000);
    }
  };

  const tabStyle = (active: boolean) => ({
    flexShrink: 0 as const, padding: "7px 16px", borderRadius: 20, cursor: "pointer" as const,
    border: active ? "1px solid #ff4d6d" : "1px solid #2a2a3a",
    background: active ? "rgba(255,77,109,0.15)" : "#111118",
    color: active ? "#ff4d6d" : "#b0b0c8",
    fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1,
    textTransform: "uppercase" as const, whiteSpace: "nowrap" as const,
  });

  const navPillStyle = { fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: "#b0b0c8", textDecoration: "none", padding: "8px 20px", border: "1px solid #2a2a3a", borderRadius: 20, transition: "all 0.2s" };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#f0f0f8" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input:focus { border-color: #ff4d6d !important; box-shadow: 0 0 0 3px rgba(255,77,109,0.15) !important; } .prompt-card:hover { border-color: #3a3a4a !important; box-shadow: 0 8px 32px rgba(255,77,109,0.15) !important; transform: translateY(-2px); } .nav-pill:hover { border-color: #ff4d6d !important; color: #ff4d6d !important; }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/studio.html" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", textDecoration: "none", letterSpacing: 1 }}>BOOMAN <span style={{ background: "linear-gradient(135deg, #ff4d6d, #ff9a3c)", WebkitBackgroundClip: "text", color: "transparent" }}>LAB</span></a>
          <a href="/studio.html" className="nav-pill" style={navPillStyle}>&larr; STUDIO</a>
          <a href="/account" className="nav-pill" style={navPillStyle}>ACCOUNT</a>
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#ffd700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 20, padding: "5px 14px" }}>PROMPT LIBRARY</div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px", background: "radial-gradient(ellipse at 30% 50%, rgba(255,77,109,0.12), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(255,154,60,0.08), transparent 60%), #0a0a0f" }}>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 36, letterSpacing: 4, marginBottom: 10, background: "linear-gradient(135deg, #ff4d6d, #ff9a3c)", WebkitBackgroundClip: "text", color: "transparent" }}>PROMPT LIBRARY</h1>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 17, color: "#b0b0c8", marginBottom: 16 }}>{ALL_PROMPTS.length} proven prompts. Copy directly into Suno.</p>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, #ff4d6d, #ff9a3c)", margin: "0 auto" }} />
      </div>

      {/* Container */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 16px 64px" }}>
        {/* Search */}
        <input type="text" placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "14px 18px", background: "#111118", border: "1px solid #2a2a3a", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans',sans-serif", fontSize: 15, outline: "none", marginBottom: 16 }} />

        {/* Genre tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 16 }}>
          <button onClick={() => setActiveGenre("all")} style={tabStyle(activeGenre === "all")}>All ({ALL_PROMPTS.length})</button>
          {ALL_GENRES.map((g) => <button key={g} onClick={() => setActiveGenre(g)} style={tabStyle(activeGenre === g)}>{g.replace(/-/g, " ")} ({GenreCount(g)})</button>)}
        </div>

        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#707088", marginBottom: 16 }}>Showing {filtered.length} of {ALL_PROMPTS.length}</p>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {filtered.map((p) => (
            <div key={p.id} className="prompt-card" style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, overflow: "hidden", transition: "all 0.2s" }}>
              <img src={p.art} alt={p.name} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: "#f0f0f8", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#707088", marginBottom: 10 }}>{p.genre.replace(/-/g, " ")}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#b0b0c8", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden", marginBottom: 14 }}>{p.vibe}</div>
                <button onClick={() => copyVibe(p.id)} style={{
                  width: "100%", padding: 11, borderRadius: 8, cursor: "pointer",
                  background: copiedId === p.id ? "rgba(0,229,255,0.12)" : selectedPromptId === p.id ? "rgba(255,154,60,0.12)" : "linear-gradient(135deg, rgba(255,77,109,0.15), rgba(255,154,60,0.1))",
                  border: copiedId === p.id ? "1px solid rgba(0,229,255,0.3)" : selectedPromptId === p.id ? "1px solid rgba(255,154,60,0.35)" : "1px solid rgba(255,77,109,0.25)",
                  color: copiedId === p.id ? "#00e5ff" : selectedPromptId === p.id ? "#ff9a3c" : "#ff4d6d",
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                  transition: "all 0.2s",
                }}>
                  {copiedId === p.id ? "COPIED \u2713" : selectedPromptId === p.id ? "PROMPT READY" : "COPY TO SUNO"}
                </button>
                {selectedPromptId === p.id && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", color: copyFailedId === p.id ? "#ff9a3c" : "#00e5ff", marginBottom: 7 }}>
                      {copyFailedId === p.id ? "Suno prompt ready" : "Copied Suno prompt"}
                    </div>
                    <textarea
                      readOnly
                      value={p.vibe}
                      onFocus={(e) => e.currentTarget.select()}
                      style={{ width: "100%", minHeight: 150, resize: "vertical", background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: 8, padding: 12, color: "#f0f0f8", fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.55, outline: "none" }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SP1200 Analysis Section — Genre-free DNA analysis */}
        <div style={{ marginTop: 56, background: "#111118", border: "1px solid #2a2a3a", borderRadius: 14, padding: "32px 28px", boxShadow: "0 0 40px rgba(255,77,109,0.05)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ width: 40, height: 2, background: "linear-gradient(90deg, #ff4d6d, #ff9a3c)", margin: "0 auto 14px" }} />
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: 3, background: "linear-gradient(135deg, #ff4d6d, #ff9a3c)", WebkitBackgroundClip: "text", color: "transparent" }}>SAMPLE ANALYSIS</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#b0b0c8", marginTop: 8 }}>Drop any audio — get a Suno-ready prompt from its sonic DNA</p>
          </div>

          {/* Drop zone */}
          <div onClick={() => fileRef.current?.click()}
            style={{ border: "2px dashed #2a2a3a", borderRadius: 12, padding: 36, textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: "rgba(255,77,109,0.02)" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#ff4d6d"; e.currentTarget.style.background = "rgba(255,77,109,0.05)"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#2a2a3a"; e.currentTarget.style.background = "rgba(255,77,109,0.02)"; }}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#ff4d6d"; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = "#2a2a3a"; }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#2a2a3a"; const f = e.dataTransfer.files[0]; if (f) setFile(f); }}>
            <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a,.flac" hidden onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff4d6d" strokeWidth="1.5" style={{ marginBottom: 10 }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, color: "#f0f0f8", marginBottom: 4 }}>{file ? `${file.name} (${(file.size/1048576).toFixed(1)} MB)` : "Drop .mp3 .wav .m4a .flac here"}</div>
            <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#707088" }}>{file ? "Click to change file" : "or click to upload — max 4 MB, MP3 recommended"}</div>
          </div>

          {/* Upload info */}
          <div style={{ marginTop: 16, padding: "14px 18px", background: "rgba(255,154,60,0.06)", border: "1px solid rgba(255,154,60,0.15)", borderRadius: 10 }}>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#b0b0c8", lineHeight: 1.6, margin: 0 }}>
              <span style={{ color: "#ff9a3c", fontWeight: 600 }}>How it works:</span>{" "}
              Your audio is uploaded securely to Google&apos;s AI servers for sonic DNA analysis.
              Max file size is 4 MB. MP3 files work best — a 3-minute track at 128kbps is about 3 MB.
              WAV files are much larger; convert to MP3 first. Only 30-60 seconds of audio is needed
              for accurate analysis — trim longer tracks for best results.
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#707088", marginTop: 8 }}>
              Supported formats: .mp3 .wav .m4a .flac
            </p>
          </div>

          {/* Analyze button — enabled as soon as file is dropped, no genre needed */}
          <button onClick={handleAnalyze} disabled={!file || analyzing}
            style={{ width: "100%", padding: 16, borderRadius: 10, border: "none", marginTop: 20, cursor: !file || analyzing ? "not-allowed" : "pointer", background: !file ? "rgba(255,77,109,0.2)" : "linear-gradient(135deg, #ff4d6d, #c0392b)", color: !file ? "#7a3040" : "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: analyzing ? 0.7 : 1 }}>
            {analyzing ? (uploadProgress || "PROCESSING...") : "ANALYZE SAMPLE"}
          </button>

          {/* Analysis result */}
          {analysisResult && (
            <div style={{ marginTop: 20, background: "#0a0a0f", border: "1px solid #2a2a3a", borderRadius: 10, padding: 20 }}>
              <pre style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#f0f0f8", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 16 }}>{analysisResult}</pre>
              <button onClick={copyAnalysis} style={{ width: "100%", padding: 12, borderRadius: 8, cursor: "pointer", background: analysisCopied ? "rgba(0,229,255,0.12)" : analysisCopyFailed ? "rgba(255,154,60,0.12)" : "linear-gradient(135deg, rgba(255,77,109,0.15), rgba(255,154,60,0.1))", border: analysisCopied ? "1px solid rgba(0,229,255,0.3)" : analysisCopyFailed ? "1px solid rgba(255,154,60,0.35)" : "1px solid rgba(255,77,109,0.25)", color: analysisCopied ? "#00e5ff" : analysisCopyFailed ? "#ff9a3c" : "#ff4d6d", fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                {analysisCopied ? "COPIED \u2713" : analysisCopyFailed ? "PROMPT READY" : "COPY TO SUNO"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
