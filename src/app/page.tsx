import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WaitlistForm from "@/components/landing/WaitlistForm";
import { testimonials } from "@/data/landing";
import type { Festival } from "@/types/database";

type FeaturedExperience = {
  id: string;
  image_url: string | null;
  landing_blurb: string | null;
  join_date: string;
  festival_id: string;
  festivals: { name: string } | null;
};

// Screenshots you placed in /public/screenshots/
const screenshots = [
  { src: "/screenshots/01.png", alt: "Festival list" },
  { src: "/screenshots/02.png", alt: "Festival detail" },
  { src: "/screenshots/03.png", alt: "My Fest grid" },
  { src: "/screenshots/04.png", alt: "Experience detail" },
  { src: "/screenshots/05.png", alt: "Log experience" },
];

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) =>
    d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
  return e ? `${fmt(s)} – ${fmt(e)}` : fmt(s);
}

export default async function LandingPage() {
  const supabase = await createClient();

  const { data: rawFestivals } = await supabase
    .from("festivals")
    .select("*")
    .eq("featured", true)
    .order("start_date", { ascending: true })
    .limit(6);
  const featuredFestivals = (rawFestivals ?? []) as Festival[];

  const { data: rawExperiences } = await supabase
    .from("experiences")
    .select("id, image_url, landing_blurb, join_date, festival_id, festivals(name)")
    .eq("featured", true)
    .not("image_url", "is", null)
    .limit(4);
  const featuredExperiences = (rawExperiences ?? []) as FeaturedExperience[];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="text-6xl mb-4">🍻</div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Festy</h1>
          <p className="text-xl font-medium opacity-90 mb-3">
            Deine Geschichte. Von Kärwa zu Kärwa.
          </p>
          <p className="text-base opacity-75 mb-10 max-w-sm mx-auto">
            Eine App für Franken, die ihre Bierfeste und Kirchweihbesuche tracken – und mit Freunden teilen wollen.
          </p>
          <a
            href="#waitlist"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Auf die Warteliste →
          </a>
        </div>
      </section>

      {/* ── SCREENSHOTS ── */}
      <section className="py-16 bg-orange-50 overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 mb-10 text-center">
          <h2 className="text-2xl font-bold">So sieht&apos;s aus 📱</h2>
          <p className="text-gray-500 mt-2">Festivals entdecken, Erlebnisse loggen, mit Freunden teilen.</p>
        </div>
        <div className="flex gap-4 px-6 overflow-x-auto snap-x snap-mandatory pb-4 max-w-3xl mx-auto">
          {screenshots.map((s, i) => (
            <div
              key={i}
              className="flex-none snap-center w-52 rounded-3xl overflow-hidden shadow-xl border-4 border-white"
              style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * (i % 3 + 1)}deg)` }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                width={208}
                height={450}
                className="w-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── UPCOMING FESTIVALS ── */}
      {featuredFestivals && featuredFestivals.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Demnächst 🎡</h2>
            <p className="text-gray-500 mb-8">Diese Feste kommen bald – sei dabei.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredFestivals.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow"
                >
                  {f.image_url ? (
                    <Image
                      src={f.image_url}
                      alt={f.name}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-xl object-contain flex-none bg-gray-50"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-2xl flex-none">
                      🎪
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-tight truncate">{f.name}</p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      {formatDateRange(f.start_date, f.end_date)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {f.city ?? f.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED EXPERIENCES ── */}
      {featuredExperiences && featuredExperiences.length > 0 && (
        <section className="py-16 bg-gray-50 px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">Aus unserem Tagebuch 📸</h2>
            <p className="text-gray-500 mb-8">Echte Erlebnisse von echten Festivalgängern.</p>
            <div className="grid gap-6 sm:grid-cols-2">
              {featuredExperiences.map((exp) => {
                const festName = exp.festivals?.name ?? "";
                return (
                  <div key={exp.id} className="rounded-2xl overflow-hidden shadow-sm bg-white">
                    {exp.image_url && (
                      <div className="relative w-full h-48">
                        <Image
                          src={exp.image_url}
                          alt={festName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">
                        {festName}
                      </p>
                      {exp.landing_blurb && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {exp.landing_blurb}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIAL STICKERS ── */}
      <section className="py-16 px-6 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-10 text-center">Was unsere Nutzer sagen 💬</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className={`${t.color} ${t.rotate} px-5 py-3 rounded-2xl shadow-sm text-sm font-medium text-gray-800 max-w-[220px] text-center`}
              >
                {t.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST FORM ── */}
      <section id="waitlist" className="py-20 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🎟️</div>
              <h2 className="text-2xl font-bold text-gray-900">Jetzt auf die Warteliste</h2>
              <p className="text-gray-500 mt-2">
                Festy ist aktuell auf Einladung. Trag dich ein, wir melden uns!
              </p>
            </div>
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 text-center text-xs text-gray-400 bg-gray-50">
        <p>Festy © {new Date().getFullYear()} · Deine Geschichte. Von Kärwa zu Kärwa.</p>
        <p className="mt-1">
          Bereits Mitglied?{" "}
          <Link href="/auth/login" className="text-orange-600 hover:underline">
            Einloggen
          </Link>
        </p>
      </footer>
    </div>
  );
}
