"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  email: string;
  tier: string;
  display_name: string | null;
  active: boolean;
  last_seen: string | null;
  created_at: string;
}

const TIERS = ["super_user", "vip", "tier2", "tier1", "free"] as const;

const TIER_COLORS: Record<string, string> = {
  super_user: "#3b9eff",
  vip: "#c9a84c",
  tier2: "#34c97a",
  tier1: "#7e8fa0",
  free: "#5a6a80",
};

export default function AdminUsersInner() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentTier, setCurrentTier] = useState<string | null>(null);

  const supabase = createClient();

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchErr) {
      setError(fetchErr.message);
    } else {
      setProfiles(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("tier")
        .eq("id", user.id)
        .single();

      if (!profile || profile.tier !== "super_user") {
        setError("Access denied — super_user only");
        setLoading(false);
        return;
      }

      setCurrentTier(profile.tier);
      loadUsers();
    }
    checkAccess();
  }, [supabase, loadUsers]);

  const toggleActive = async (profile: Profile) => {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ active: !profile.active })
      .eq("id", profile.id);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    loadUsers();
  };

  const updateTier = async (profile: Profile, newTier: string) => {
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ tier: newTier })
      .eq("id", profile.id);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    loadUsers();
  };

  if (error && !currentTier) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080b10" }}
      >
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "#0f1318", border: "1px solid #1a2030" }}
        >
          <p style={{ color: "#e05656", fontFamily: "'Syne', sans-serif" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: "#080b10" }}>
      <div className="mb-8">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif", color: "#ffffff" }}
        >
          User Management
        </h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "#5a6a80", fontFamily: "'DM Mono', monospace" }}
        >
          BooManLab — {profiles.length} users
        </p>
      </div>

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

      {loading ? (
        <p style={{ color: "#5a6a80" }}>Loading...</p>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#0f1318", border: "1px solid #1a2030" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #1a2030",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  <th
                    className="text-left px-5 py-3 text-xs uppercase tracking-widest"
                    style={{ color: "#5a6a80" }}
                  >
                    Email
                  </th>
                  <th
                    className="text-left px-5 py-3 text-xs uppercase tracking-widest"
                    style={{ color: "#5a6a80" }}
                  >
                    Tier
                  </th>
                  <th
                    className="text-left px-5 py-3 text-xs uppercase tracking-widest"
                    style={{ color: "#5a6a80" }}
                  >
                    Active
                  </th>
                  <th
                    className="text-left px-5 py-3 text-xs uppercase tracking-widest"
                    style={{ color: "#5a6a80" }}
                  >
                    Last Seen
                  </th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #111820" }}>
                    <td
                      className="px-5 py-3"
                      style={{
                        color: "#d0d8e4",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {p.email}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={p.tier}
                        onChange={(e) => updateTier(p, e.target.value)}
                        className="rounded px-2 py-1 text-xs font-semibold uppercase outline-none cursor-pointer"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: TIER_COLORS[p.tier] || "#7e8fa0",
                          border: `1px solid ${TIER_COLORS[p.tier] || "#1a2030"}33`,
                          fontFamily: "'Syne', sans-serif",
                        }}
                      >
                        {TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(p)}
                        className="rounded-full w-10 h-5 relative transition-colors"
                        style={{
                          background: p.active
                            ? "rgba(52,201,122,0.3)"
                            : "rgba(90,106,128,0.2)",
                        }}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                          style={{
                            background: p.active ? "#34c97a" : "#5a6a80",
                            left: p.active ? "22px" : "2px",
                          }}
                        />
                      </button>
                    </td>
                    <td
                      className="px-5 py-3 text-xs"
                      style={{
                        color: "#5a6a80",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {p.last_seen
                        ? new Date(p.last_seen).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
