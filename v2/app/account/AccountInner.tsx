"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AccountInner() {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("");
  const [memberSince, setMemberSince] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setEmail(user.email || "");
      setMemberSince(new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
      const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
      setTier(profile?.tier || "free");
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleUpdatePassword = async () => {
    setPwMsg(""); setPwErr(false);
    if (!currentPw) { setPwMsg("Current password is required"); setPwErr(true); return; }
    if (newPw !== confirmPw) { setPwMsg("Passwords do not match"); setPwErr(true); return; }
    if (newPw.length < 6) { setPwMsg("Password must be at least 6 characters"); setPwErr(true); return; }
    const { error: confirmError } = await supabase.auth.signInWithPassword({ email, password: currentPw });
    if (confirmError) { setPwMsg("Current password is incorrect"); setPwErr(true); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwMsg(error.message); setPwErr(true); }
    else { setPwMsg("Password updated"); setPwErr(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
  };

  if (loading) return <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#707088", fontFamily: "'DM Sans',sans-serif" }}>Loading...</p></div>;

  const inputStyle = { width: "100%", padding: "14px 18px", background: "#111118", border: "1px solid #2a2a3a", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans',sans-serif", fontSize: 15, outline: "none", marginBottom: 14 };
  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#b0b0c8", marginBottom: 6 };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#f0f0f8" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap'); input:focus { border-color: #ff4d6d !important; box-shadow: 0 0 0 3px rgba(255,77,109,0.15) !important; }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2a2a3a" }}>
        <a href="/home" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", textDecoration: "none", letterSpacing: 1 }}>BOOMAN <span style={{ background: "linear-gradient(135deg, #ff4d6d, #ff9a3c)", WebkitBackgroundClip: "text", color: "transparent" }}>LAB</span></a>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#b0b0c8", background: "rgba(255,77,109,0.08)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: 20, padding: "5px 14px" }}>ACCOUNT</div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>Email</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#f0f0f8" }}>{email}</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={labelStyle}>Tier</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", background: "linear-gradient(135deg, #ffd700, #ff9a3c)", color: "#0a0a0f", padding: "5px 14px", borderRadius: 20 }}>{tier.replace(/_/g, " ")}</span>
          </div>
          <div>
            <span style={labelStyle}>Member Since</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#b0b0c8" }}>{memberSince}</span>
          </div>
        </div>

        <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#b0b0c8", marginBottom: 20 }}>CHANGE PASSWORD</h3>
          <label style={labelStyle}>Current Password</label>
          <input type="password" autoComplete="current-password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} style={inputStyle} />
          <label style={labelStyle}>New Password</label>
          <input type="password" autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={inputStyle} />
          <label style={labelStyle}>Confirm New Password</label>
          <input type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={inputStyle} />
          {pwMsg && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: pwErr ? "#ff4d6d" : "#00e5ff", marginBottom: 12 }}>{pwErr ? "\u2717 " : "\u2713 "}{pwMsg}</p>}
          <button onClick={handleUpdatePassword} style={{ width: "100%", padding: 16, borderRadius: 10, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #ff4d6d, #c0392b)", color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>UPDATE PASSWORD</button>
        </div>

        <a href="/home" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: "#b0b0c8", textDecoration: "none" }}>&larr; BOOMAN LAB</a>
      </div>
    </div>
  );
}
