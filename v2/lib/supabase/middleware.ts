import { createServerClient } from "@supabase/ssr";
import { isOwnerEmail } from "@/lib/auth/active-user";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — no auth required
  const isPublicPath =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/vibe-to-prompt.html" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/acceptable-use" ||
    pathname === "/copyright" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  // If Supabase isn't configured, redirect everything to /login except public paths
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isPublicPath) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && !isPublicPath) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile?.active) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "invite-required");
      return NextResponse.redirect(loginUrl);
    }

    if (pathname.startsWith("/admin") && !isOwnerEmail(user.email)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return supabaseResponse;
}
