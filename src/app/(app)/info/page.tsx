"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import i18n from "@/i18n";

const VERSION_HISTORY = [
  {
    version: "V2.0",
    date: "14.05.2026",
    emoji: "🚀",
    changes: [
      "Rebuilt from scratch: Moved from Glide to a custom web app built with Claude Code",
      "New stack: Next.js 16, Supabase, Cloudinary — faster, more reliable, fully owned",
      "PWA: Install on your home screen on iOS and Android",
      "Bilingual: Full English/German support",
      "Admin panel: Festival management for admins and sub-admins",
    ],
  },
  {
    version: "V1.2",
    date: "29.06.2025",
    emoji: "📱",
    changes: [
      "Festival Filtering: Filter festivals by status and other criteria",
      "Community Tab: View other users' festival experiences, ratings, and photos",
      "Attraction Tracking: Record specific rides and food stands",
    ],
  },
  {
    version: "V1.1",
    date: "24.06.2025",
    emoji: "📱",
    changes: [
      "Community Reviews: View all user reviews and ratings on festival detail pages",
      "Feedback System: Bug reporting and feature request forms",
      "Project Website: Dedicated website for project updates",
    ],
  },
  {
    version: "V1.0",
    date: "20.06.2025",
    emoji: "📱",
    changes: [
      "Festival Directory: Complete list of festivals with dates and details",
      "Personal Experience Logging: Add your own festival experiences with photos",
      "Personal Dashboard: View your festival history and memories",
    ],
  },
];

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 bg-white text-left"
      >
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 bg-white border-t border-gray-100 text-sm text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}

export default function InfoPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("info.title")}</h1>

      <div className="space-y-3">
        {/* Language */}
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">{t("info.language")}</p>
          <div className="flex gap-2">
            {["de", "en"].map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  i18n.language === lang
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {lang === "en" ? "🇬🇧 English" : "🇩🇪 Deutsch"}
              </button>
            ))}
          </div>
        </div>

        {/* How to install */}
        <AccordionSection title={t("info.howToInstall")}>
          <ol className="mt-2 space-y-2 list-decimal list-inside">
            <li>{t("info.installStep1")}</li>
            <li>{t("info.installStep2")}</li>
            <li>{t("info.installStep3")}</li>
            <li>{t("info.installStep4")}</li>
          </ol>
        </AccordionSection>

        {/* Wish list */}
        <AccordionSection title={t("info.wishlist")}>
          <p className="mt-2 mb-3 text-gray-500">{t("info.wishlistDesc")}</p>
          <div className="space-y-2">
            {[
              { label: t("info.reportBug"), href: "https://docs.google.com/forms/d/e/1FAIpQLScyxq1QhpzJFG-8_-jOQvBdgNKTculL08olTjk0Ydurf81N1Q/viewform?usp=header", emoji: "🐛" },
              { label: t("info.ideas"), href: "https://docs.google.com/forms/d/e/1FAIpQLSecnIhLBnBOKdit9VJqJCoZ35NDRyrW8-vZpp2ZjEE2DRBA6Q/viewform?usp=header", emoji: "💡" },
              { label: t("info.submitFestival"), href: "https://docs.google.com/forms/d/e/1FAIpQLSdtpK367_kVkFrkGmKAnBAcG2zFGqOGPIyTWWB_TIMwQ1kAEQ/viewform?usp=header", emoji: "🎪" },
            ].map(({ label, href, emoji }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 py-2 text-orange-600 font-medium border-b border-gray-100 last:border-0"
              >
                <span>{emoji}</span>
                {label}
              </a>
            ))}
          </div>
        </AccordionSection>

        {/* Version History */}
        <AccordionSection title={t("info.versionHistory")}>
          <div className="mt-2 space-y-4">
            {VERSION_HISTORY.map((v) => (
              <div key={v.version}>
                <p className="font-semibold text-gray-800">
                  {v.emoji} {v.version} – 📅 {v.date}
                </p>
                <ul className="mt-1 space-y-1 list-disc list-inside text-gray-500">
                  {v.changes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </AccordionSection>

        {/* Data Privacy */}
        <AccordionSection title={t("info.dataPrivacy")}>
          <div className="mt-2 whitespace-pre-line text-gray-600 leading-relaxed">
            {t("info.dataPrivacyText")}
          </div>
        </AccordionSection>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-8 w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        <LogOut size={16} />
        {t("auth.logout")}
      </button>
    </div>
  );
}
