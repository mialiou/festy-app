"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handle() {
      const supabase = createClient();
      const code = searchParams.get("code");
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      let authError: string | null = null;

      if (code) {
        // PKCE flow (same-browser login)
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) authError = error.message;
      } else if (token_hash && type) {
        // Token-hash flow
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as "magiclink" | "email" | "signup" | "invite" | "recovery",
        });
        if (error) authError = error.message;
      } else {
        // Implicit flow: Supabase puts tokens in the URL hash (#access_token=...).
        // createBrowserClient detects and sets the session automatically.
        // Just check if we have a session now.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          authError = "no_code_or_token";
        }
      }

      if (authError) {
        router.replace(
          `/auth/login?error=auth_failed&details=${encodeURIComponent(authError)}`
        );
        return;
      }

      // Check if profile is complete
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        if (!(profile as { username: string } | null)?.username) {
          router.replace("/auth/onboarding");
        } else {
          router.replace("/festivals");
        }
      } else {
        router.replace("/auth/login?error=auth_failed&details=no_user");
      }
    }

    handle();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
      <div className="text-5xl mb-4">🍻</div>
      <p className="text-gray-500 text-sm">Einloggen…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-orange-50">
          <div className="text-5xl">🍻</div>
        </div>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
