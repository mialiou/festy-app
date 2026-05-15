import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/festivals";
  const origin = new URL(request.url).origin;

  const errorRedirect = NextResponse.redirect(
    `${origin}/auth/login?error=auth_failed`
  );

  if (!code) return errorRedirect;

  // Collect cookies to forward — they must be set explicitly on the
  // redirect response, not via next/headers (which doesn't attach to redirects).
  const pendingCookies: Array<{
    name: string;
    value: string;
    options: Record<string, unknown>;
  }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          pendingCookies.push(...cookiesToSet);
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return errorRedirect;

  // Check if profile is complete
  let destination = `${origin}${next}`;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const typedProfile = profile as { username: string } | null;
    if (!typedProfile?.username) {
      destination = `${origin}/auth/onboarding`;
    }
  }

  // Build the redirect and attach session cookies
  const response = NextResponse.redirect(destination);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(
      name,
      value,
      options as Parameters<typeof response.cookies.set>[2]
    );
  });
  return response;
}
