"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import { Festival } from "@/types/database";
import { formatDate, CATEGORY_EMOJI, getFestivalStatus } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FestivalCardProps {
  festival: Festival;
  isAdmin?: boolean;
  onEdit?: (festival: Festival) => void;
  onDelete?: (festival: Festival) => void;
}

const statusColors = {
  active: "bg-green-100 text-green-700",
  upcoming: "bg-blue-100 text-blue-700",
  ended: "bg-gray-100 text-gray-500",
};

export default function FestivalCard({
  festival,
  isAdmin,
  onEdit,
  onDelete,
}: FestivalCardProps) {
  const { t, i18n } = useTranslation();
  const status = getFestivalStatus(festival.start_date, festival.end_date);
  const emoji = CATEGORY_EMOJI[festival.category] ?? "🎪";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0">
        {festival.image_url ? (
          <Image
            src={festival.image_url}
            alt={festival.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {emoji}
          </div>
        )}
      </div>

      <Link href={`/festivals/${festival.id}`} className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">
          {festival.location}
        </p>
        <p className="font-bold text-gray-900 text-base leading-tight">
          {festival.name}
        </p>
        <p className="text-sm text-gray-400">
          {festival.category} {emoji}
        </p>
        {(festival.start_date || festival.end_date) && (
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDate(festival.start_date, i18n.language)}
            {festival.end_date &&
              festival.end_date !== festival.start_date &&
              ` – ${formatDate(festival.end_date, i18n.language)}`}
          </p>
        )}
      </Link>

      {isAdmin && onEdit && onDelete ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(festival);
          }}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal size={18} />
        </button>
      ) : (
        <div className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status]}`}>
          {t(`festivals.${status}`)}
        </div>
      )}
    </div>
  );
}
