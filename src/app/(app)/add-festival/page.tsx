"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import { useTranslation } from "react-i18next";

export default function AddFestivalPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      const profile = data as Profile | null;
      setProfile(profile);
      setLoading(false);

      if (profile?.role === "admin" || profile?.role === "sub_admin") {
        router.replace("/admin/festivals/new");
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  // Regular users: show suggestion note
  return (
    <div className="px-4 pt-6 text-center">
      <div className="text-5xl mb-4">🎪</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("admin.newFestival")}</h1>
      <p className="text-gray-500 text-sm mb-6">
        Want to add a festival? Send us a suggestion and we&apos;ll review it.
      </p>
      <a
        href="mailto:mialiou@gmail.com?subject=Festival Suggestion"
        className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold"
      >
        {t("info.submitFestival")}
      </a>
    </div>
  );
}
