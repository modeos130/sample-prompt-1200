import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { activeUserError, getActiveUser, isOwnerEmail } from "@/lib/auth/active-user";
import { recordAdminAuditEvent } from "@/lib/admin/audit";

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

  const activeUser = await getActiveUser(req);
  if (!activeUser.ok) return activeUserError(activeUser);
  if (!isOwnerEmail(activeUser.user.email)) {
    return NextResponse.json({ error: "Owner access required" }, { status: 403 });
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
  if (userId === activeUser.user.id) {
    return NextResponse.json({ error: "Cannot revoke your own access" }, { status: 400 });
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("email,tier,active")
    .eq("id", userId)
    .maybeSingle();

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

    const audit = await recordAdminAuditEvent(supabase, {
      actor: activeUser.user,
      action: "user_revoked",
      targetUserId: userId,
      targetEmail: targetProfile?.email ?? null,
      metadata: {
        previousActive: targetProfile?.active ?? null,
        tier: targetProfile?.tier ?? null,
      },
    });
    if (!audit.ok) {
      return NextResponse.json({ error: "User revoked, but audit logging failed." }, { status: 500 });
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

    const audit = await recordAdminAuditEvent(supabase, {
      actor: activeUser.user,
      action: "user_restored",
      targetUserId: userId,
      targetEmail: targetProfile?.email ?? null,
      metadata: {
        previousActive: targetProfile?.active ?? null,
        tier: targetProfile?.tier ?? null,
      },
    });
    if (!audit.ok) {
      return NextResponse.json({ error: "User restored, but audit logging failed." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "restored", userId });
  }

  return NextResponse.json({ error: "action must be 'revoke' or 'restore'" }, { status: 400 });
}
