import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { activeUserError, getActiveUser, isOwnerEmail } from "@/lib/auth/active-user";
import { recordAdminAuditEvent, type AdminAuditAction } from "@/lib/admin/audit";
import { apiError } from "@/lib/api/errors";

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
      response: apiError("Owner access required.", { status: 403 }),
    };
  }
  return { ok: true as const, activeUser: activeUser.user };
}

export async function GET(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner.ok) return owner.response;

  const supabase = getServiceClient();
  if (!supabase) {
    return apiError("Server not configured.", { status: 500, code: "server_not_configured" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,tier,display_name,active,last_seen,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return apiError("Unable to load users.", { status: 500, code: "users_load_failed" });
  }

  return NextResponse.json({ users: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const owner = await requireOwner(req);
  if (!owner.ok) return owner.response;

  const supabase = getServiceClient();
  if (!supabase) {
    return apiError("Server not configured.", { status: 500, code: "server_not_configured" });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return apiError("Invalid request body.", { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId : "";
  const updates: { tier?: string; active?: boolean } = {};

  if (!userId) {
    return apiError("userId required.", { status: 400, code: "missing_user_id" });
  }

  if (typeof body.tier === "string") {
    if (!TIERS.includes(body.tier)) {
      return apiError("Invalid tier.", { status: 400, code: "invalid_tier" });
    }
    updates.tier = body.tier;
  }

  if (typeof body.active === "boolean") {
    if (userId === owner.activeUser.id && body.active === false) {
      return apiError("Cannot deactivate your own account.", { status: 400, code: "self_deactivate_blocked" });
    }
    updates.active = body.active;
  }

  if (!Object.keys(updates).length) {
    return apiError("No valid updates supplied.", { status: 400, code: "empty_update" });
  }

  const { data: previous, error: previousError } = await supabase
    .from("profiles")
    .select("id,email,tier,active")
    .eq("id", userId)
    .single();

  if (previousError) {
    return apiError("Unable to load user before update.", { status: 500, code: "user_load_failed" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("id,email,tier,display_name,active,last_seen,created_at")
    .single();

  if (error) {
    return apiError("Unable to update user.", { status: 500, code: "user_update_failed" });
  }

  let action: AdminAuditAction = "user_updated";
  if (updates.tier && updates.active === undefined) action = "user_tier_updated";
  if (updates.active !== undefined && updates.tier === undefined) action = "user_active_updated";

  const audit = await recordAdminAuditEvent(supabase, {
    actor: owner.activeUser,
    action,
    targetUserId: userId,
    targetEmail: data.email,
    metadata: {
      before: {
        tier: previous.tier,
        active: previous.active,
      },
      after: {
        tier: data.tier,
        active: data.active,
      },
      changedFields: Object.keys(updates),
    },
  });
  if (!audit.ok) {
    return apiError("User updated, but audit logging failed.", { status: 500, code: "audit_write_failed" });
  }

  return NextResponse.json({ user: data });
}
