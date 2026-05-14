"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/i18n";
import { useTranslation } from "react-i18next";

export default function OnboardingPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const subAdminEmail = process.env.NEXT_PUBLIC_SUB_ADMIN_EMAIL;
    const role =
      user.email === adminEmail
        ? "admin"
        : user.email === subAdminEmail
        ? "sub_admin"
        : "user";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("profiles") as any).upsert({
      id: user.id,
      email: user.email ?? "",
      username: username.trim(),
      role: role as "admin" | "sub_admin" | "user",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍻</div>
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.completeProfile")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.username")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("auth.usernamePlaceholder")}
              required
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors"
          >
            {loading ? t("common.loading") : t("auth.continue")}
          </button>
        </form>
      </div>
    </div>
  );
}
