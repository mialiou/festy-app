"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Search, MoreHorizontal, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Experience, Festival, Profile } from "@/types/database";
import { CATEGORY_EMOJI } from "@/lib/utils";

type ExperienceWithFestival = Experience & { festival: Festival };

export default function MyFestPage() {
  const { t } = useTranslation();
  const [experiences, setExperiences] = useState<ExperienceWithFestival[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;

      const [{ data: prof }, { data: exps }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase
          .from("experiences")
          .select("*, festival:festivals(*)")
          .eq("user_id", user.id)
          .order("join_date", { ascending: false }),
      ]);

      setProfile(prof);
      setExperiences((exps as ExperienceWithFestival[]) ?? []);
      setLoading(false);
    });
  }, []);

  const filtered = experiences.filter(
    (e) =>
      !search ||
      e.festival?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.festival?.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-900">{t("myFest.title")}</h1>
        <Link
          href="/"
          className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          {t("myFest.add")}
        </Link>
      </div>

      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 mb-5">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("myFest.search")}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          {t("myFest.noExperiences")}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((exp) => {
            const emoji = CATEGORY_EMOJI[exp.festival?.category ?? ""] ?? "🎪";
            return (
              <Link
                key={exp.id}
                href={`/my-fest/${exp.id}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:opacity-80"
              >
                <div className="aspect-square bg-orange-50 relative">
                  {exp.image_url ? (
                    <Image
                      src={exp.image_url}
                      alt={exp.festival?.name ?? ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {emoji}
                    </div>
                  )}
                  <button
                    onClick={(e) => e.preventDefault()}
                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                  >
                    <MoreHorizontal size={14} className="text-gray-500" />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                    {exp.festival?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{profile?.username}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{formatDate(exp.join_date, "de")}</p>
                  {exp.rating && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: exp.rating }).map((_, i) => (
                        <Star key={i} size={10} className="fill-orange-400 text-orange-400" />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
