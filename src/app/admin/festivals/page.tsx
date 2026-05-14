"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";
import { Festival } from "@/types/database";
import FestivalCard from "@/components/festivals/FestivalCard";

export default function AdminFestivalsPage() {
  const { t } = useTranslation();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("festivals")
      .select("*")
      .order("start_date", { ascending: true });
    setFestivals(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.festivals")}</h1>
        <Link
          href="/admin/festivals/new"
          className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
        >
          {t("admin.newFestival")}
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">{t("common.loading")}</div>
      ) : (
        <div>
          {festivals.map((f) => (
            <FestivalCard
              key={f.id}
              festival={f}
              isAdmin
              onEdit={(fest) => setEditingFestival(fest)}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}

      {editingFestival && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="px-4 pb-2 flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900">{t("admin.editFestival")}</h2>
              <button
                onClick={() => setEditingFestival(null)}
                className="text-gray-400 text-sm"
              >
                {t("common.close")}
              </button>
            </div>
            {/* We redirect to the edit page for simplicity */}
            <div className="px-4 pb-4">
              <Link
                href={`/admin/festivals/${editingFestival.id}`}
                className="block w-full py-3 bg-orange-600 text-white text-center font-semibold rounded-xl"
              >
                {t("common.edit")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
