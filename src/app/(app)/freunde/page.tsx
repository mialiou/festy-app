"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Search, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Experience, Festival, Profile } from "@/types/database";
import { formatDate, CATEGORY_EMOJI } from "@/lib/utils";

type FeedItem = Experience & { festival: Festival; profile: Profile };

export default function FreundePage() {
  const { t, i18n } = useTranslation();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [myFestivalIds, setMyFestivalIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const [{ data: allExps }, { data: myExps }] = await Promise.all([
        supabase
          .from("experiences")
          .select("*, festival:festivals(*), profile:profiles(*)")
          .order("join_date", { ascending: false })
          .limit(100),
        user
          ? supabase
              .from("experiences")
              .select("festival_id")
              .eq("user_id", user.id)
          : Promise.resolve({ data: [] }),
      ]);

      setFeed((allExps as unknown as FeedItem[]) ?? []);
      setMyFestivalIds(
        new Set((myExps ?? []).map((e) => (e as { festival_id: string }).festival_id))
      );
      setLoading(false);
    });
  }, []);

  const filtered = feed.filter(
    (item) =>
      !search ||
      item.festival?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.profile?.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 pt-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("freunde.title")}</h1>

      <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 mb-5">
        <Search size={16} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("freunde.search")}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          {t("freunde.noFeed")}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const emoji = CATEGORY_EMOJI[item.festival?.category ?? ""] ?? "🎪";
            const alsoVisited = myFestivalIds.has(item.festival_id);

            return (
              <Link
                key={item.id}
                href={`/my-fest/${item.id}`}
                className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-3 active:opacity-80"
              >
                {/* Square thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.festival?.name ?? ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{emoji}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                    {item.festival?.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.profile?.username} · {formatDate(item.join_date, i18n.language)}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    {item.rating ? (
                      <div className="flex gap-0.5">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} size={10} className="fill-orange-400 text-orange-400" />
                        ))}
                      </div>
                    ) : <span />}
                    {alsoVisited && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                        {t("freunde.alsoVisited")}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
