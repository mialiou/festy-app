"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AlignJustify, Plus, Image, Users, Info } from "lucide-react";

const navItems = [
  { href: "/festivals", labelKey: "nav.festivals", Icon: AlignJustify },
  { href: "/add-festival", labelKey: "nav.addFestival", Icon: Plus },
  { href: "/my-fest", labelKey: "nav.myFest", Icon: Image },
  { href: "/freunde", labelKey: "nav.freunde", Icon: Users },
  { href: "/info", labelKey: "nav.info", Icon: Info },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, labelKey, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-colors ${
                isActive ? "text-orange-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] leading-none font-medium">
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
