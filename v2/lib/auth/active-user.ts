import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api/errors";

export interface ActiveUser {
  id: string;
  email: string;
  tier: string;
}

export type ActiveUserResult =
  | { ok: true; user: ActiveUser }
  | { ok: false; status: 401 | 403 | 500; error: string };

export function ownerEmail() {
  return (process.env.ADMIN_OWNER_EMAIL || "admin@modeos.app").trim().toLowerCase();
}

export function isOwnerEmail(email: string | null | undefined) {
  return (email || "").trim().toLowerCase() === ownerEmail();
}

export async function getActiveUser(req: NextRequest): Promise<ActiveUserResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { ok: false, status: 500, error: "Auth is not configured." };
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "Authentication required." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.active) {
    return { ok: false, status: 403, error: "An active invitation is required." };
  }

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email || "",
      tier: profile.tier || "free",
    },
  };
}

export function activeUserError(result: Exclude<ActiveUserResult, { ok: true }>) {
  return apiError(result.error, { status: result.status });
}
