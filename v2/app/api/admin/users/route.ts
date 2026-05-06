import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { activeUserError, getActiveUser, isOwnerEmail } from "@/lib/auth/active-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIERS = ["super_user", "vip", "tier2", "tier1", "free"];

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function requireOwner(req: NextRequest) {
  const activeUser = await getActiveUser(req);
  if (!activeUser.ok) return { ok: false as const, response: activeUserError(activeUser) };
  if (!isOwnerEmail(activeUser.user.email)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Owner access required" }, { status: 403 }),
    };
  }
  return { ok: true as const, activeUser: activeUser.user };
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner.ok) return owner.response;

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,tier,display_name,active,last_seen,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load users" }, { status: 500 });
  }

  return NextResponse.json({ users: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner.ok) return owner.response;

  const supabase = getServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId : "";
  const updates: { tier?: string; active?: boolean } = {};

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  if (typeof body.tier === "string") {
    if (!TIERS.includes(body.tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    updates.tier = body.tier;
  }

  if (typeof body.active === "boolean") {
    if (userId === owner.activeUser.id && body.active === false) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 });
    }
    updates.active = body.active;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No valid updates supplied" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id,email,tier,display_name,active,last_seen,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Unable to update user" }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
