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
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Verify caller is super_user
  const { createServerClient } = await import("@supabase/ssr");
  const callerClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user: caller } } = await callerClient.auth.getUser();
  if (!caller) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("tier")
    .eq("id", caller.id)
    .single();
  if (!callerProfile || callerProfile.tier !== "super_user") {
    return NextResponse.json({ error: "Super user access required" }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userId = body.userId as string;
  const action = body.action as string; // "revoke" or "restore"

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Prevent revoking your own access
  if (userId === caller.id) {
    return NextResponse.json({ error: "Cannot revoke your own access" }, { status: 400 });
  }

  if (action === "revoke") {
    // Disable in profiles
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ active: false })
      .eq("id", userId);
    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // Ban the user in Supabase Auth (prevents login)
    const { error: banErr } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "876000h", // ~100 years
    });
    if (banErr) {
      return NextResponse.json({ error: banErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "revoked", userId });
  }

  if (action === "restore") {
    // Re-enable in profiles
    const { error: profileErr } = await supabase
      .from("profiles")
      .update({ active: true })
      .eq("id", userId);
    if (profileErr) {
      return NextResponse.json({ error: profileErr.message }, { status: 500 });
    }

    // Unban the user
    const { error: unbanErr } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });
    if (unbanErr) {
      return NextResponse.json({ error: unbanErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "restored", userId });
  }

  return NextResponse.json({ error: "action must be 'revoke' or 'restore'" }, { status: 400 });
}
