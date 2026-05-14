import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string | null, locale = "en"): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === "de" ? "de-DE" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getFestivalStatus(
  startDate: string | null,
  endDate: string | null
): "active" | "upcoming" | "ended" {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (end && now > end) return "ended";
  if (start && now < start) return "upcoming";
  return "active";
}

export function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const CATEGORY_EMOJI: Record<string, string> = {
  "Kirchweih": "🏘️",
  "Music Event": "🎵",
  "Folk Festival": "👨‍👩‍👧‍👦",
  "Art Performance": "🎭",
  "Seasonal Market": "🛍️",
  "Food & Wine Tasting": "🍷",
  "Parade & Procession": "🎉",
  "Historical Reenactment": "⚔️",
  "Sports Events": "🏃",
  "Beer Festival": "🍺",
  "Other": "🎪",
};

export const FAHRGESCHAEFTE_OPTIONS = [
  { value: "Karussell", label: "🎠 Karussell" },
  { value: "Autoscooter", label: "🚗 Autoscooter" },
  { value: "Riesenrad", label: "🎡 Riesenrad" },
  { value: "Achterbahn", label: "🎢 Achterbahn" },
  { value: "Kettenkarussell", label: "⛓️ Kettenkarussell" },
  { value: "Break Dancer", label: "🚁 Break Dancer" },
  { value: "Geisterbahn", label: "👻 Geisterbahn" },
  { value: "Schießbude", label: "🎯 Schießbude" },
  { value: "Losbude", label: "🎲 Losbude" },
  { value: "Wurfbude", label: "🎪 Wurfbude" },
  { value: "Backfisch", label: "🐟 Backfisch" },
];

export const BEER_SIZES = ["0.3L", "0.5L", "1L"] as const;
