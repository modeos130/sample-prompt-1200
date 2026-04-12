"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  email: string;
  tier: string;
  display_name: string | null;
  active: boolean;
  created_at: string;
}

const TIERS = ["super_user", "vip", "tier2", "tier1", "free"];
const TIER_COLORS: Record<string, string> = {
  super_user: "#ffd700",
  vip: "#ff4d6d",
  tier2: "#00e5ff",
  tier1: "#b0b0c8",
  free: "#707088",
};

export default function InviteInner() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [tier, setTier] = useState("vip");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ email: string; password: string; tier: string } | null>(null);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  const supabase = createClient();

  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoadingUsers(false);
  }, [supabase]);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: profile } = await supabase.from("profiles").select("tier").eq("id", user.id).single();
      if (!profile || profile.tier !== "super_user") { setError("Super user access required"); return; }
      setAuthorized(true);
      loadUsers();
    }
    checkAuth();
  }, [supabase, loadUsers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier, displayName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create user"); return; }
      setResult(data);
      setEmail(""); setDisplayName("");
      loadUsers();
    } catch { setError("Network error"); }
    finally { setSending(false); }
  };

  const handleRevoke = async (userId: string, currentlyActive: boolean) => {
    setRevoking(userId);
    try {
      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: currentlyActive ? "revoke" : "restore" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      loadUsers();
    } catch { setError("Network error"); }
    finally { setRevoking(null); }
  };

  const copyCredentials = () => {
    if (!result) return;
    navigator.clipboard.writeText(`BooManLab Login\nURL: https://boomanlab.com/login\nEmail: ${result.email}\nPassword: ${result.password}\nChange your password after first login.`);
  };

  if (!authorized) {
    return (
      <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: error ? "#ff4d6d" : "#707088", fontFamily: "'DM Sans',sans-serif" }}>{error || "Checking access..."}</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "14px 18px", background: "#111118", border: "1px solid #2a2a3a", borderRadius: 10, color: "#f0f0f8", fontFamily: "'DM Sans',sans-serif", fontSize: 15, outline: "none" };
  const labelStyle: React.CSSProperties = { display: "block", fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#b0b0c8", marginBottom: 6 };

  return (
    <div style={{ background: "#0a0a0f", minHeight: "100vh", color: "#f0f0f8" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap'); input:focus, select:focus { border-color: #ff4d6d !important; box-shadow: 0 0 0 3px rgba(255,77,109,0.15) !important; }`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2a2a3a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/studio.html" style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, color: "#fff", textDecoration: "none" }}>BOOMAN <span style={{ background: "linear-gradient(135deg, #ff4d6d, #ff9a3c)", WebkitBackgroundClip: "text", color: "transparent" }}>LAB</span></a>
          <a href="/admin/users" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#b0b0c8", textDecoration: "none", padding: "8px 20px", border: "1px solid #2a2a3a", borderRadius: 20 }}>USERS</a>
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "#ffd700", background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 20, padding: "5px 14px" }}>INVITE</div>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 16px" }}>
        {/* Invite Form */}
        <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 14, padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: 2, marginBottom: 4 }}>Invite User</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: "#707088", marginBottom: 24 }}>Create an account and get credentials to share privately.</p>

          <form onSubmit={handleInvite}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="producer@email.com" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Display Name (optional)</label>
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={inputStyle} placeholder="DJ Name" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Tier</label>
              <select value={tier} onChange={(e) => setTier(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {TIERS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ").toUpperCase()}</option>)}
              </select>
            </div>

            {error && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#ff4d6d", marginBottom: 16 }}>{error}</p>}

            <button type="submit" disabled={sending} style={{ width: "100%", padding: 16, borderRadius: 10, border: "none", cursor: sending ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #ff4d6d, #c0392b)", color: "#fff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", opacity: sending ? 0.6 : 1 }}>
              {sending ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Credentials Result */}
        {result && (
          <div style={{ background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 14, padding: 28, marginBottom: 24 }}>
            <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#00e5ff", marginBottom: 16 }}>Account Created</h3>
            <div style={{ background: "#0a0a0f", borderRadius: 10, padding: 20, fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 2, marginBottom: 16 }}>
              <div><span style={{ color: "#707088" }}>URL:</span> <span style={{ color: "#f0f0f8" }}>https://boomanlab.com/login</span></div>
              <div><span style={{ color: "#707088" }}>Email:</span> <span style={{ color: "#f0f0f8" }}>{result.email}</span></div>
              <div><span style={{ color: "#707088" }}>Password:</span> <span style={{ color: "#00e5ff", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: 1 }}>{result.password}</span></div>
              <div><span style={{ color: "#707088" }}>Tier:</span> <span style={{ color: TIER_COLORS[result.tier] || "#b0b0c8" }}>{result.tier.replace(/_/g, " ").toUpperCase()}</span></div>
            </div>
            <button onClick={copyCredentials} style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid rgba(0,229,255,0.3)", background: "rgba(0,229,255,0.08)", color: "#00e5ff", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" }}>
              Copy Login Info to Clipboard
            </button>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#707088", marginTop: 10, textAlign: "center" }}>
              Text or DM these credentials to the user. They should change their password after first login.
            </p>
          </div>
        )}

        {/* User List with Revoke */}
        <div style={{ background: "#111118", border: "1px solid #2a2a3a", borderRadius: 14, padding: 28 }}>
          <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: 2, marginBottom: 20 }}>
            All Users ({users.length})
          </h2>

          {loadingUsers ? (
            <p style={{ color: "#707088" }}>Loading...</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {users.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: u.active ? "#0a0a0f" : "rgba(255,77,109,0.04)", border: u.active ? "1px solid #1a1a24" : "1px solid rgba(255,77,109,0.15)", borderRadius: 10, opacity: u.active ? 1 : 0.7 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: u.active ? "#f0f0f8" : "#707088", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.display_name ? `${u.display_name} — ` : ""}{u.email}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: TIER_COLORS[u.tier] || "#707088" }}>{u.tier.replace(/_/g, " ")}</span>
                      {!u.active && <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#ff4d6d", background: "rgba(255,77,109,0.1)", padding: "2px 8px", borderRadius: 10 }}>REVOKED</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevoke(u.id, u.active)}
                    disabled={revoking === u.id}
                    style={{
                      flexShrink: 0, marginLeft: 12, padding: "8px 16px", borderRadius: 8, cursor: revoking === u.id ? "not-allowed" : "pointer",
                      border: u.active ? "1px solid rgba(255,77,109,0.3)" : "1px solid rgba(0,229,255,0.3)",
                      background: u.active ? "rgba(255,77,109,0.08)" : "rgba(0,229,255,0.08)",
                      color: u.active ? "#ff4d6d" : "#00e5ff",
                      fontFamily: "'Space Grotesk',sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase",
                      opacity: revoking === u.id ? 0.5 : 1,
                    }}
                  >
                    {revoking === u.id ? "..." : u.active ? "Revoke" : "Restore"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
