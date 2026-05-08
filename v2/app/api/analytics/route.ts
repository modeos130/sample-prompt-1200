import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { activeUserError, getActiveUser } from "@/lib/auth/active-user";
import { apiError } from "@/lib/api/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const activeUser = await getActiveUser(req);
  if (!activeUser.ok) return activeUserError(activeUser);

  const supabase = getServiceClient();
  if (!supabase) {
    return apiError("Server not configured.", { status: 500, code: "server_not_configured" });
  }

  // Extract country from headers (Vercel sets x-vercel-ip-country)
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;

  const { error } = await supabase.from("analytics").insert({
    user_id: activeUser.user.id,
    action: "studio_visit",
    tier: activeUser.user.tier,
    country,
  });

  if (error) {
    console.error("Analytics insert error:", error.message);
    return apiError("Unable to record analytics event.", { status: 500, code: "analytics_write_failed" });
  }

  return NextResponse.json({ ok: true });
}
