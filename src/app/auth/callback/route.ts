import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/festivals";
  const origin = new URL(request.url).origin;

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

  let authError: string | null = null;

  if (code) {
    // PKCE flow — code must match code_verifier cookie from same browser session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) authError = error.message;
  } else if (token_hash && type) {
    // OTP / token-hash flow — works cross-browser, no verifier needed
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "magiclink" | "email" | "signup" | "invite" | "recovery",
    });
    if (error) authError = error.message;
  } else {
    authError = "no_code_or_token";
  }

  if (authError) {
    const url = new URL(`${origin}/auth/login`);
    url.searchParams.set("error", "auth_failed");
    url.searchParams.set("details", authError);
    return NextResponse.redirect(url);
  }

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
