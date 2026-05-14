"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "@/i18n";
import { useTranslation } from "react-i18next";

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

    const supabase = createClient();
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
