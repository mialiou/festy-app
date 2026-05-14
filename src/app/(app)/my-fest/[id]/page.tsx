"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Experience, Festival, Profile } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Star, Pencil } from "lucide-react";

type ExperienceDetail = Experience & { festival: Festival; profile: Profile };

export default function MyFestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [exp, setExp] = useState<ExperienceDetail | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("experiences")
        .select("*, festival:festivals(*), profile:profiles(*)")
        .eq("id", id)
        .single(),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: { user } }]) => {
      const exp = data as unknown as ExperienceDetail;
      setExp(exp);
      setIsOwner(!!user && exp?.user_id === user.id);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  if (!exp) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Not found
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Back button */}
      <div className="px-4 pt-6 pb-2">
        <button onClick={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={20} className="text-orange-600" />
        </button>
      </div>

      <div className="px-4 space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">{exp.festival?.name}</h1>

        <Row icon="📅" label={t("experience.date")} value={formatDate(exp.join_date, i18n.language)} />
        <Row icon="🍺" label={t("experience.bierbrauer")} value={exp.bierbrauer} />
        <Row icon="🍺" label={t("experience.beerName")} value={exp.beer_name} />
        <Row icon="🍺" label={t("experience.beerSize")} value={exp.beer_size} />
        <Row icon="🍺" label={t("experience.beerPrice")} value={exp.beer_price != null ? `€${exp.beer_price}` : null} />
        <Row icon="🥩" label={t("experience.bratwurstPrice")} value={exp.bratwurst_price != null ? `€${exp.bratwurst_price}` : null} />
        <Row icon="🤌" label={t("experience.senf")} value={exp.senf || null} />
        <Row icon="🍦" label={t("experience.iceCreamPrice")} value={exp.ice_cream_price != null ? `€${exp.ice_cream_price}` : null} />

        {/* Rating as stars */}
        <div className="flex items-center gap-2 text-sm">
          <span>⭐</span>
          <span className="font-medium text-gray-700">{t("experience.rating")}</span>
          <div className="flex gap-0.5 ml-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < (exp.rating ?? 0) ? "fill-orange-400 text-orange-400" : "fill-gray-200 text-gray-200"}
              />
            ))}
          </div>
        </div>

        <Row icon="📝" label={t("experience.comment")} value={exp.comment} />

        {/* Fahrgeschäfte */}
        {(exp.fahrgeschaefte?.length ?? 0) > 0 && (
          <div className="flex gap-2 text-sm">
            <span className="flex-shrink-0">🎡</span>
            <div>
              <span className="font-medium text-gray-700">{t("experience.fahrgeschaefte")}:</span>
              <p className="text-gray-600 mt-0.5">{exp.fahrgeschaefte.join(", ")}</p>
            </div>
          </div>
        )}

        {/* Photo */}
        {exp.image_url && (
          <div className="pt-2">
            <Image
              src={exp.image_url}
              alt={exp.festival?.name ?? ""}
              width={600}
              height={400}
              className="w-full rounded-2xl object-cover"
            />
          </div>
        )}
      </div>

      {/* Edit button — only for the experience owner */}
      {isOwner && (
        <div className="fixed bottom-20 left-4 right-4 z-10">
          <Link
            href={`/my-fest/${id}/edit`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-orange-600 text-white font-bold rounded-2xl text-base"
          >
            <Pencil size={16} />
            {t("common.edit")}
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex gap-2 text-sm text-gray-700">
      <span className="flex-shrink-0">{icon}</span>
      <span>
        <span className="font-medium">{label}:</span>
        {value ? ` ${value}` : ""}
      </span>
    </div>
  );
}
