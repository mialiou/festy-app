"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Festival, Experience, Profile } from "@/types/database";
import { formatDate, CATEGORY_EMOJI, getFestivalStatus } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import ExperienceForm from "@/components/experiences/ExperienceForm";

export default function FestivalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [festival, setFestival] = useState<Festival | null>(null);
  const [experiences, setExperiences] = useState<(Experience & { profile: Profile })[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: fest }, { data: exps }, { data: prof }] = await Promise.all([
        supabase.from("festivals").select("*").eq("id", id).single(),
        user
          ? supabase
              .from("experiences")
              .select("*, profile:profiles(*)")
              .eq("festival_id", id)
              .eq("user_id", user.id)
              .order("join_date", { ascending: false })
          : Promise.resolve({ data: [] }),
        user
          ? supabase.from("profiles").select("*").eq("id", user.id).single()
          : Promise.resolve({ data: null }),
      ]);

      setFestival(fest as Festival | null);
      setExperiences((exps as unknown as (Experience & { profile: Profile })[]) ?? []);
      setProfile(prof as Profile | null);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Festival not found
      </div>
    );
  }

  const status = getFestivalStatus(festival.start_date, festival.end_date);
  const emoji = CATEGORY_EMOJI[festival.category] ?? "🎪";

  return (
    <div>
      {/* Hero */}
      <div className="relative h-56 bg-orange-100">
        {festival.image_url ? (
          <Image
            src={festival.image_url}
            alt={festival.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">{emoji}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 bg-white/90 rounded-full p-2 shadow"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-orange-300 text-xs font-semibold uppercase tracking-wide">
            {festival.location}
          </p>
          <h1 className="text-white text-2xl font-bold leading-tight">{festival.name}</h1>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">
        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full font-medium">
            {festival.category} {emoji}
          </span>
          <span
            className={`text-sm px-3 py-1 rounded-full font-medium ${
              status === "active"
                ? "bg-green-100 text-green-700"
                : status === "upcoming"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {t(`festivals.${status}`)}
          </span>
        </div>

        {/* Dates */}
        {(festival.start_date || festival.end_date) && (
          <div className="flex gap-4 text-sm text-gray-600">
            {festival.start_date && (
              <div>
                <span className="font-semibold text-gray-400 text-xs block uppercase">
                  {t("festivals.startDate")}
                </span>
                {formatDate(festival.start_date, i18n.language)}
              </div>
            )}
            {festival.end_date && (
              <div>
                <span className="font-semibold text-gray-400 text-xs block uppercase">
                  {t("festivals.endDate")}
                </span>
                {formatDate(festival.end_date, i18n.language)}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {festival.description && (
          <p className="text-gray-600 text-sm leading-relaxed">{festival.description}</p>
        )}

        {/* Link */}
        {festival.link && (
          <a
            href={festival.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-orange-600 text-sm font-medium"
          >
            <ExternalLink size={14} />
            {festival.link}
          </a>
        )}

        {/* I'm Here button */}
        {profile && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl text-lg transition-colors"
          >
            {t("festivals.imHere")}
          </button>
        )}

        {/* Community reviews */}
        {experiences.length > 0 && (
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-3">
              Erlebnisse ({experiences.length})
            </h2>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-gray-800">
                      {exp.profile?.username ?? "Unknown"}
                    </span>
                    {exp.rating && (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: exp.rating }).map((_, i) => (
                          <Star key={i} size={12} className="fill-orange-400 text-orange-400" />
                        ))}
                      </div>
                    )}
                  </div>
                  {exp.comment && (
                    <p className="text-sm text-gray-600">{exp.comment}</p>
                  )}
                  {exp.image_url && (
                    <Image
                      src={exp.image_url}
                      alt="Experience"
                      width={300}
                      height={200}
                      className="w-full h-40 object-cover rounded-lg mt-2"
                    />
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exp.bierbrauer && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        🍺 {exp.bierbrauer}
                        {exp.beer_name && ` – ${exp.beer_name}`}
                        {exp.beer_size && ` (${exp.beer_size})`}
                        {exp.beer_price && ` €${exp.beer_price}`}
                      </span>
                    )}
                    {exp.senf && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        🌭 {exp.senf}
                      </span>
                    )}
                    {exp.fahrgeschaefte?.length > 0 && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        🎡 {exp.fahrgeschaefte.length} rides
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Experience Form Modal */}
      {showForm && profile && (
        <ExperienceForm
          festival={festival}
          userId={profile.id}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
              .from("experiences")
              .select("*, profile:profiles(*)")
              .eq("festival_id", id)
              .eq("user_id", user.id)
              .order("join_date", { ascending: false });
            if (data) setExperiences(data as (Experience & { profile: Profile })[]);
          }}
        />
      )}
    </div>
  );
}
