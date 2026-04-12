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
  const [file, setFile] = useState<File | null>(null);
  const [analysisGenre, setAnalysisGenre] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisCopied, setAnalysisCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return ALL_PROMPTS.filter((p) => {
      const matchesGenre = activeGenre === "all" || p.genre === activeGenre;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.vibe.toLowerCase().includes(search.toLowerCase());
      return matchesGenre && matchesSearch;
    });
  }, [search, activeGenre]);

  const copyVibe = (id: string, vibe: string) => {
    navigator.clipboard.writeText(vibe);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAnalyze = async () => {
    if (!file || !analysisGenre) return;
    setAnalyzing(true);
    setAnalysisResult("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("genre", analysisGenre);
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();
      setAnalysisResult(data.prompt || data.error || "No result");
    } catch (e) {
      setAnalysisResult("Analysis failed. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const copyAnalysis = () => {
    navigator.clipboard.writeText(analysisResult);
    setAnalysisCopied(true);
    setTimeout(() => setAnalysisCopied(false), 2000);
  };

  return (
    <div style={{ background: "#080b10", minHeight: "100vh", color: "#d0d8e4" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #1a2030" }}>
        <a href="/studio.html" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", textDecoration: "none", letterSpacing: 1 }}>BOOMAN LAB</a>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: "#5a6a80", background: "rgba(59,158,255,0.08)", border: "1px solid rgba(59,158,255,0.15)", borderRadius: 20, padding: "5px 14px" }}>PROMPT LIBRARY</div>
      </div>

      {/* Hero */}
      <div style={{ textAlign: "center" as const, padding: "48px 24px 32px", background: "radial-gradient(ellipse at 50% 0%, rgba(59,158,255,0.06) 0%, transparent 60%)" }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, letterSpacing: 3, color: "#fff", marginBottom: 8 }}>PROMPT LIBRARY</h1>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#5a6a80", marginBottom: 16 }}>69 proven prompts. Copy directly into Suno.</p>
        <div style={{ width: 60, height: 2, background: "linear-gradient(90deg, #3b9eff, #00d4ff)", margin: "0 auto" }} />
      </div>

      {/* Container */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px 64px" }}>
        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", background: "#0f1318", border: "1px solid #1a2030", borderRadius: 8, color: "#d0d8e4", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none" }}
          />
        </div>

        {/* Genre tabs */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto" as const, paddingBottom: 12, marginBottom: 16 }}>
          <button onClick={() => setActiveGenre("all")} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: activeGenre === "all" ? "1px solid #3b9eff" : "1px solid #1a2030", background: activeGenre === "all" ? "rgba(59,158,255,0.12)" : "#0f1318", color: activeGenre === "all" ? "#3b9eff" : "#5a6a80", fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, cursor: "pointer" }}>
            All ({ALL_PROMPTS.length})
          </button>
          {ALL_GENRES.map((g) => (
            <button key={g} onClick={() => setActiveGenre(g)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: activeGenre === g ? "1px solid #3b9eff" : "1px solid #1a2030", background: activeGenre === g ? "rgba(59,158,255,0.12)" : "#0f1318", color: activeGenre === g ? "#3b9eff" : "#5a6a80", fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, cursor: "pointer", whiteSpace: "nowrap" as const }}>
              {g.replace(/-/g, " ")} ({GenreCount(g)})
            </button>
          ))}
        </div>

        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#5a6a80", marginBottom: 16 }}>
          Showing {filtered.length} of {ALL_PROMPTS.length}
        </p>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ background: "#0f1318", border: "1px solid #1a2030", borderRadius: 10, overflow: "hidden", transition: "border-color 0.2s" }}>
              <img src={p.art} alt={p.name} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", display: "block" }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#d0d8e4", marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, color: "#5a6a80", marginBottom: 8 }}>{p.genre.replace(/-/g, " ")}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#7e8fa0", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden", marginBottom: 12 }}>{p.vibe}</div>
                <button
                  onClick={() => copyVibe(p.id, p.vibe)}
                  style={{
                    width: "100%", padding: 10, borderRadius: 6, cursor: "pointer",
                    background: copiedId === p.id ? "rgba(0,212,255,0.1)" : "rgba(59,158,255,0.1)",
                    border: copiedId === p.id ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(59,158,255,0.2)",
                    color: copiedId === p.id ? "#00d4ff" : "#3b9eff",
                    fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const,
                  }}
                >
                  {copiedId === p.id ? "COPIED \u2713" : "COPY TO SUNO"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SP1200 Analysis Section */}
        <div style={{ position: "relative" as const, textAlign: "center" as const, margin: "48px 0 32px" }}>
          <div style={{ borderTop: "1px solid #1a2030" }} />
          <span style={{ position: "absolute" as const, top: -10, left: "50%", transform: "translateX(-50%)", background: "#080b10", padding: "0 12px", fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: "#5a6a80" }}>SAMPLE ANALYSIS</span>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#5a6a80", textAlign: "center" as const, marginBottom: 24 }}>Drop any audio — get a Suno-ready prompt</p>

        {/* Drop zone */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{ background: "#0f1318", border: "2px dashed #1a2030", borderRadius: 10, padding: 32, textAlign: "center" as const, cursor: "pointer", marginBottom: 20, transition: "border-color 0.2s" }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = "#3b9eff")}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = "#1a2030")}
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#3b9eff"; }}
          onDragLeave={(e) => { e.currentTarget.style.borderColor = "#1a2030"; }}
          onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#1a2030"; const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
        >
          <input ref={fileRef} type="file" accept=".mp3,.wav,.m4a,.flac" hidden onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b9eff" strokeWidth="1.5" style={{ marginBottom: 8 }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, color: "#d0d8e4", marginBottom: 4 }}>
            {file ? file.name : "Drop .mp3 .wav .m4a .flac here"}
          </div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#5a6a80" }}>or click to upload</div>
        </div>

        {/* Genre selector for analysis */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8, marginBottom: 20 }}>
          {ALL_GENRES.map((g) => (
            <button key={g} onClick={() => setAnalysisGenre(g)} style={{ padding: "6px 14px", borderRadius: 20, border: analysisGenre === g ? "1px solid #3b9eff" : "1px solid #1a2030", background: analysisGenre === g ? "rgba(59,158,255,0.12)" : "#0f1318", color: analysisGenre === g ? "#3b9eff" : "#5a6a80", fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const, cursor: "pointer", whiteSpace: "nowrap" as const }}>
              {g.replace(/-/g, " ")}
            </button>
          ))}
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!file || !analysisGenre || analyzing}
          style={{ width: "100%", padding: 14, borderRadius: 8, border: "none", cursor: !file || !analysisGenre || analyzing ? "not-allowed" : "pointer", background: !file || !analysisGenre ? "rgba(59,158,255,0.15)" : "linear-gradient(135deg, #3b9eff, #2878cc)", color: !file || !analysisGenre ? "#2878cc" : "#fff", fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 20, opacity: analyzing ? 0.7 : 1 }}
        >
          {analyzing ? "ANALYZING..." : "ANALYZE SAMPLE"}
        </button>

        {/* Analysis result */}
        {analysisResult && (
          <div style={{ background: "#0f1318", border: "1px solid #1a2030", borderRadius: 10, padding: 20 }}>
            <pre style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#d0d8e4", lineHeight: 1.6, whiteSpace: "pre-wrap" as const, marginBottom: 16 }}>{analysisResult}</pre>
            <button
              onClick={copyAnalysis}
              style={{ width: "100%", padding: 12, borderRadius: 6, cursor: "pointer", background: analysisCopied ? "rgba(0,212,255,0.1)" : "rgba(59,158,255,0.1)", border: analysisCopied ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(59,158,255,0.2)", color: analysisCopied ? "#00d4ff" : "#3b9eff", fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" as const }}
            >
              {analysisCopied ? "COPIED \u2713" : "COPY PROMPT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
