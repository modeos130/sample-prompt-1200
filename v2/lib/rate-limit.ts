import { createClient } from "@supabase/supabase-js";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInHours?: number;
  error?: string;
}

interface ConsumeRateLimitOptions {
  scope: string;
  subjectId: string;
  limit: number;
  windowMs: number;
  bypass?: boolean;
  bypassRemaining?: number;
}

interface ConsumeRateLimitRow {
  allowed: boolean;
  remaining: number;
  reset_at: string;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function hoursUntil(resetAt: string) {
  const resetTime = new Date(resetAt).getTime();
  if (!Number.isFinite(resetTime)) return 1;
  return Math.max(1, Math.ceil((resetTime - Date.now()) / 3_600_000));
}

export async function consumeRateLimit({
  scope,
  subjectId,
  limit,
  windowMs,
  bypass = false,
  bypassRemaining = 9999,
}: ConsumeRateLimitOptions): Promise<RateLimitResult> {
  if (bypass) {
    return { allowed: true, remaining: bypassRemaining };
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return {
      allowed: false,
      remaining: 0,
      error: "Rate limit service is not configured.",
    };
  }

  const { data, error } = await supabase
    .rpc("consume_rate_limit", {
      p_scope: scope,
      p_subject_id: subjectId,
      p_limit: limit,
      p_window_ms: windowMs,
    })
    .single();

  if (error) {
    console.error("[rate-limit]", error.message);
    return {
      allowed: false,
      remaining: 0,
      error: "Rate limit service is unavailable.",
    };
  }

  const row = data as ConsumeRateLimitRow | null;
  if (!row) {
    return {
      allowed: false,
      remaining: 0,
      error: "Rate limit service returned no result.",
    };
  }

  return {
    allowed: row.allowed,
    remaining: row.remaining,
    resetInHours: row.allowed ? undefined : hoursUntil(row.reset_at),
  };
}
