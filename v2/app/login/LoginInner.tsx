"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function initialLoginError() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("error") === "invite-required"
    ? "An active invitation is required. Contact the Booman Lab admin for access."
    : "";
}

export default function LoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialLoginError);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }

    const userId = data.user?.id;
    if (!userId) {
      await supabase.auth.signOut();
      setError("Unable to verify this account.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("active")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile?.active) {
      await supabase.auth.signOut();
      setError("An active invitation is required. Contact the Booman Lab admin for access.");
      setLoading(false);
      return;
    }

    window.location.href = "/home";
  };

  const inputStyle = { width: "100%", padding: "14px 18px", background: "#111118", border: "1px solid #2a2a3a", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans',sans-serif", fontSize: 15, outline: "none" };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap'); input:focus { border-color: #ff4d6d !important; box-shadow: 0 0 0 3px rgba(255,77,109,0.15) !important; }`}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 36, letterSpacing: 3, marginBottom: 8 }}>
            <span style={{ color: "#fff" }}>BOOMAN</span>{" "}
            <span style={{ background: "linear-gradient(135deg, #ff4d6d, #ff9a3c)", WebkitBackgroundClip: "text", color: "transparent" }}>LAB</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#b0b0c8" }}>AI Music Production Studio</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 14, padding: 32 }}>
          {error && (
            <div style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.2)", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#ff4d6d" }}>{error}</div>
          )}

          <label htmlFor="login-email" style={{ display: "block", fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#b0b0c8", marginBottom: 8 }}>Email</label>
          <input id="login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ ...inputStyle, marginBottom: 20 }} placeholder="you@example.com" />

          <label htmlFor="login-password" style={{ display: "block", fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#b0b0c8", marginBottom: 8 }}>Password</label>
          <input id="login-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 28 }} placeholder="Enter password" />

          <button type="submit" disabled={loading} style={{ width: "100%", padding: 16, borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "#4a2030" : "linear-gradient(135deg, #ff4d6d, #c0392b)", color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: loading ? 0.6 : 1 }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#8e90a8" }}>Invite only — no signup</p>
      </div>
    </div>
  );
}
