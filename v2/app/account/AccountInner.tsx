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
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setEmail(user.email || "");
      setMemberSince(new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));

      const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
      setTier(profile?.tier || "free");
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleUpdatePassword = async () => {
    setPwMsg("");
    setPwErr(false);
    if (newPw !== confirmPw) {
      setPwMsg("Passwords do not match");
      setPwErr(true);
      return;
    }
    if (newPw.length < 6) {
      setPwMsg("Password must be at least 6 characters");
      setPwErr(true);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) {
      setPwMsg(error.message);
      setPwErr(true);
    } else {
      setPwMsg("Password updated");
      setPwErr(false);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    }
  };

  if (loading) {
    return (
      <div style={{ background: "#080b10", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#5a6a80", fontFamily: "'DM Sans',sans-serif" }}>Loading...</p>
      </div>
    );
  }

  const inputStyle = { width: "100%", padding: "12px 16px", background: "#141a22", border: "1px solid #1a2030", borderRadius: 8, color: "#d0d8e4", fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: "none", marginBottom: 12 };
  const labelStyle = { fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 600 as const, letterSpacing: 2, textTransform: "uppercase" as const, color: "#5a6a80", marginBottom: 6, display: "block" as const };

  return (
    <div style={{ background: "#080b10", minHeight: "100vh", color: "#d0d8e4" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #1a2030" }}>
        <a href="/studio.html" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#fff", textDecoration: "none", letterSpacing: 1 }}>BOOMAN LAB</a>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: "#5a6a80", background: "rgba(59,158,255,0.08)", border: "1px solid rgba(59,158,255,0.15)", borderRadius: 20, padding: "5px 14px" }}>ACCOUNT</div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 16px" }}>
        {/* User info card */}
        <div style={{ background: "#0f1318", border: "1px solid #1a2030", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <span style={labelStyle}>Email</span>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: "#d0d8e4" }}>{email}</span>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <span style={labelStyle}>Tier</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, background: "#3b9eff", color: "#fff", padding: "4px 12px", borderRadius: 20 }}>{tier.replace(/_/g, " ")}</span>
            </div>
          </div>
          <div>
            <span style={labelStyle}>Member Since</span>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#7e8fa0" }}>{memberSince}</span>
          </div>
        </div>

        {/* Change password card */}
        <div style={{ background: "#0f1318", border: "1px solid #1a2030", borderRadius: 10, padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" as const, color: "#5a6a80", marginBottom: 20 }}>CHANGE PASSWORD</h3>

          <label style={labelStyle}>Current Password</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>New Password</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} style={inputStyle} />

          <label style={labelStyle}>Confirm New Password</label>
          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={inputStyle} />

          {pwMsg && (
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: pwErr ? "#e05656" : "#00d4ff", marginBottom: 12 }}>
              {pwErr ? "\u2717 " : "\u2713 "}{pwMsg}
            </p>
          )}

          <button
            onClick={handleUpdatePassword}
            style={{ width: "100%", padding: 14, borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #3b9eff, #2878cc)", color: "#fff", fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const }}
          >
            UPDATE PASSWORD
          </button>
        </div>

        <a href="/studio.html" style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600, color: "#5a6a80", textDecoration: "none" }}>&larr; STUDIO</a>
      </div>
    </div>
  );
}
