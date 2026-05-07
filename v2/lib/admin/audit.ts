import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActiveUser } from "@/lib/auth/active-user";

export type AdminAuditAction =
  | "invite_created"
  | "user_revoked"
  | "user_restored"
  | "user_tier_updated"
  | "user_active_updated"
  | "user_updated";

interface AdminAuditEvent {
  actor: ActiveUser;
  action: AdminAuditAction;
  targetUserId?: string | null;
  targetEmail?: string | null;
  metadata?: Record<string, unknown>;
}

export async function recordAdminAuditEvent(
  supabase: SupabaseClient,
  event: AdminAuditEvent
) {
  const { error } = await supabase.from("admin_audit_events").insert({
    actor_user_id: event.actor.id,
    actor_email: event.actor.email,
    target_user_id: event.targetUserId ?? null,
    target_email: event.targetEmail ?? null,
    action: event.action,
    metadata: event.metadata ?? {},
  });

  if (error) {
    console.error("Unable to record admin audit event", {
      action: event.action,
      actorUserId: event.actor.id,
      targetUserId: event.targetUserId ?? null,
      code: error.code,
    });
    return { ok: false as const };
  }

  return { ok: true as const };
}
