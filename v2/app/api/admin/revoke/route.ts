import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { activeUserError, getActiveUser, isOwnerEmail } from "@/lib/auth/active-user";
import { recordAdminAuditEvent } from "@/lib/admin/audit";
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
  const supabase = getServiceClient();
  if (!supabase) {
    return apiError("Server not configured.", { status: 500, code: "server_not_configured" });
  }

  const activeUser = await getActiveUser(req);
  if (!activeUser.ok) return activeUserError(activeUser);
  if (!isOwnerEmail(activeUser.user.email)) {
    return apiError("Owner access required.", { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body.", { status: 400 });
  }

  const userId = body.userId as string;
  const action = body.action as string; // "revoke" or "restore"

  if (!userId) {
    return apiError("userId required.", { status: 400, code: "missing_user_id" });
  }

  // Prevent revoking your own access
  if (userId === activeUser.user.id) {
    return apiError("Cannot revoke your own access.", { status: 400, code: "self_revoke_blocked" });
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
      return apiError("Unable to update user profile.", { status: 500, code: "profile_update_failed" });
    }

    // Ban the user in Supabase Auth (prevents login)
    const { error: banErr } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "876000h", // ~100 years
    });
    if (banErr) {
      return apiError("Unable to revoke Supabase Auth access.", { status: 500, code: "auth_revoke_failed" });
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
      return apiError("User revoked, but audit logging failed.", { status: 500, code: "audit_write_failed" });
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
      return apiError("Unable to update user profile.", { status: 500, code: "profile_update_failed" });
    }

    // Unban the user
    const { error: unbanErr } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: "none",
    });
    if (unbanErr) {
      return apiError("Unable to restore Supabase Auth access.", { status: 500, code: "auth_restore_failed" });
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
      return apiError("User restored, but audit logging failed.", { status: 500, code: "audit_write_failed" });
    }

    return NextResponse.json({ ok: true, action: "restored", userId });
  }

  return apiError("action must be 'revoke' or 'restore'.", { status: 400, code: "invalid_admin_action" });
}
