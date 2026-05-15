"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import "@/i18n";
import { useTranslation } from "react-i18next";

function AuthErrorBanner() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");
  const authDetails = searchParams.get("details");

  if (!authError) return null;

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 break-all">
      <p className="font-semibold mb-1">⚠️ Login fehlgeschlagen</p>
      {authDetails && <p className="opacity-75">{authDetails}</p>}
      {(authDetails?.includes("code_verifier") || authDetails?.includes("pkce")) && (
        <p className="mt-1 text-red-600 font-medium">
          Bitte öffne den Magic Link im selben Browser, wo du dich eingeloggt hast.
        </p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Use plain supabase-js (not @supabase/ssr) so we can set flowType: 'implicit'.
    // @supabase/ssr hardcodes PKCE, which breaks cross-browser magic links.
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { flowType: "implicit" } }
    );
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍻</div>
          <h1 className="text-3xl font-bold text-gray-900">{t("auth.loginTitle")}</h1>
          <p className="text-gray-500 mt-2 text-sm">{t("auth.loginSubtitle")}</p>
        </div>

        <Suspense fallback={null}>
          <AuthErrorBanner />
        </Suspense>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? t("auth.sending") : t("auth.sendLink")}
            </button>
          </form>
        ) : (
          <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
            <div className="text-4xl mb-3">📬</div>
            <h2 className="font-bold text-gray-900 text-lg mb-2">{t("auth.checkEmail")}</h2>
            <p className="text-gray-500 text-sm">
              {t("auth.checkEmailDesc", { email })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
