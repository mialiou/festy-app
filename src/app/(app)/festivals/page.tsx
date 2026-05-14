"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Festival } from "@/types/database";
import { getFestivalStatus, getDistanceKm } from "@/lib/utils";
import FestivalCard from "@/components/festivals/FestivalCard";

const STATUS_ORDER = { active: 0, upcoming: 1, ended: 2 };

export default function FestivalsPage() {
  const { t } = useTranslation();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [cities, setCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sortByDistance, setSortByDistance] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("festivals")
      .select("*")
      .order("start_date", { ascending: true })
      .then(({ data }) => {
        if (data) {
          const festivals = data as import("@/types/database").Festival[];
          setFestivals(festivals);
          const uniqueCities = [...new Set(festivals.map((f) => f.city ?? f.location))].filter(Boolean).sort();
          setCities(uniqueCities as string[]);
        }
        setLoading(false);
      });
  }, []);

  const handleNearestFirst = useCallback(() => {
    if (sortByDistance) {
      setSortByDistance(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setSortByDistance(true);
      },
      () => alert("Location access denied")
    );
  }, [sortByDistance]);

  const filtered = festivals
    .filter((f) => {
      const matchSearch =
        !search ||
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.location.toLowerCase().includes(search.toLowerCase());
      const matchCity = cityFilter === "all" || (f.city ?? f.location) === cityFilter;
      return matchSearch && matchCity;
    })
    .sort((a, b) => {
      if (sortByDistance && userLocation && a.latitude && b.latitude) {
        const da = getDistanceKm(userLocation.lat, userLocation.lon, a.latitude!, a.longitude!);
        const db = getDistanceKm(userLocation.lat, userLocation.lon, b.latitude!, b.longitude!);
        return da - db;
      }
      const sa = STATUS_ORDER[getFestivalStatus(a.start_date, a.end_date)];
      const sb = STATUS_ORDER[getFestivalStatus(b.start_date, b.end_date)];
      if (sa !== sb) return sa - sb;
      return (a.start_date ?? "").localeCompare(b.start_date ?? "");
    });

  return (
    <div className="px-4 pt-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">{t("festivals.title")}</h1>
      </div>

      {/* Search + filter row */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("festivals.search")}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border transition-colors relative ${
            cityFilter !== "all" || sortByDistance
              ? "bg-orange-100 border-orange-300 text-orange-600"
              : "bg-gray-100 border-transparent text-gray-500"
          }`}
        >
          <SlidersHorizontal size={18} />
          {(cityFilter !== "all" || sortByDistance) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 bg-orange-50 rounded-xl p-3 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">
              {t("festivals.filterByCity")}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCityFilter("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  cityFilter === "all"
                    ? "bg-orange-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {t("festivals.allCities")}
              </button>
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    cityFilter === city
                      ? "bg-orange-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleNearestFirst}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg w-full transition-colors ${
              sortByDistance
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            <MapPin size={14} />
            {t("festivals.nearestFirst")}
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">{t("common.loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">{t("festivals.noResults")}</div>
      ) : (
        <div>
          {filtered.map((festival) => (
            <FestivalCard key={festival.id} festival={festival} />
          ))}
        </div>
      )}
    </div>
  );
}
