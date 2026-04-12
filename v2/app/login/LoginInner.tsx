"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Redirect to studio on success
    window.location.href = "/studio.html";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#080b10" }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ fontFamily: "'Syne', sans-serif", color: "#ffffff" }}
          >
            BooManLab
          </h1>
          <p style={{ color: "#5a6a80", fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>
            Sample Prompt 1200 — 130 MODE
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-xl p-8"
          style={{
            background: "#0f1318",
            border: "1px solid #1a2030",
          }}
        >
          {error && (
            <div
              className="rounded-lg px-4 py-3 mb-6 text-sm"
              style={{
                background: "rgba(224,86,86,0.1)",
                border: "1px solid rgba(224,86,86,0.2)",
                color: "#e05656",
              }}
            >
              {error}
            </div>
          )}

          <div className="mb-5">
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#5a6a80", fontFamily: "'Syne', sans-serif" }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "#141a22",
                border: "1px solid #1a2030",
                color: "#e0e8f0",
                fontFamily: "'DM Mono', monospace",
              }}
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-8">
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "#5a6a80", fontFamily: "'Syne', sans-serif" }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "#141a22",
                border: "1px solid #1a2030",
                color: "#e0e8f0",
                fontFamily: "'DM Mono', monospace",
              }}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-sm uppercase tracking-widest transition-all"
            style={{
              background: loading ? "#1a3060" : "#3b9eff",
              color: loading ? "#5a8abf" : "#ffffff",
              fontFamily: "'Syne', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p
          className="text-center mt-6 text-xs"
          style={{ color: "#3d4d5c", fontFamily: "'DM Mono', monospace" }}
        >
          Invite only — no signup
        </p>
      </div>
    </div>
  );
}
