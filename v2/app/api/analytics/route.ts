import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Not configured" }, { status: 500 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const userId = typeof body.user_id === "string" ? body.user_id : null;
  const tier = typeof body.tier === "string" ? body.tier : null;

  // Extract country from headers (Vercel sets x-vercel-ip-country)
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;

  const { error } = await supabase.from("analytics").insert({
    user_id: userId,
    action: "studio_visit",
    tier,
    country,
  });

  if (error) {
    console.error("Analytics insert error:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
