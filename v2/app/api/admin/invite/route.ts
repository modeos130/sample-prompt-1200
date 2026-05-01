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

function generatePassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$%&";
  let pw = "";
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  pw += special[Math.floor(Math.random() * special.length)];
  return pw;
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

  const email = (body.email as string || "").trim().toLowerCase();
  const tier = (body.tier as string || "vip");
  const displayName = (body.displayName as string || "").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!TIERS.includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const password = generatePassword();

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName || email.split("@")[0], tier },
  });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const userId = authData.user.id;

  // Create profile record
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    tier,
    display_name: displayName || null,
    active: true,
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Return credentials (shown to admin only, never logged)
  return NextResponse.json({
    email,
    password,
    tier,
    userId,
    displayName: displayName || null,
  });
}
