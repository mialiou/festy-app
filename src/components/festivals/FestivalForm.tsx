"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";
import { Festival, FestivalCategory } from "@/types/database";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import Image from "next/image";

const CATEGORIES: FestivalCategory[] = [
  "Kirchweih", "Music Event", "Folk Festival", "Art Performance",
  "Seasonal Market", "Food & Wine Tasting", "Parade & Procession",
  "Historical Reenactment", "Sports Events", "Beer Festival", "Other",
];

interface FestivalFormProps {
  festival?: Festival;
}

export default function FestivalForm({ festival }: FestivalFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState({
    name: festival?.name ?? "",
    start_date: festival?.start_date?.slice(0, 10) ?? "",
    end_date: festival?.end_date?.slice(0, 10) ?? "",
    category: (festival?.category ?? "Kirchweih") as FestivalCategory,
    location: festival?.location ?? "",
    description: festival?.description ?? "",
    link: festival?.link ?? "",
    latitude: festival?.latitude?.toString() ?? "",
    longitude: festival?.longitude?.toString() ?? "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(festival?.image_url ?? null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let image_url = festival?.image_url ?? null;
    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    const supabase = createClient();
    const payload = {
      name: form.name,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      category: form.category,
      location: form.location,
      description: form.description || null,
      link: form.link || null,
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      image_url,
      status: "upcoming" as const,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = festival
      ? await (supabase.from("festivals") as any).update(payload).eq("id", festival.id)
      : await (supabase.from("festivals") as any).insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(festival ? "Festival updated!" : "Festival created!");
      router.push("/admin/festivals");
    }
  };

  const handleDelete = async () => {
    if (!festival) return;
    if (!confirm(t("admin.confirmDelete"))) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("festivals").delete().eq("id", festival.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Festival deleted");
      router.push("/admin/festivals");
    }
  };

  const inputClass =
    "w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400 text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.name")}</label>
        <input required type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.startDate")}</label>
          <input type="date" value={form.start_date} onChange={(e) => setField("start_date", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.endDate")}</label>
          <input type="date" value={form.end_date} onChange={(e) => setField("end_date", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.category")}</label>
        <select value={form.category} onChange={(e) => setField("category", e.target.value)} className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(`categories.${c}`)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.location")}</label>
        <input required type="text" value={form.location} onChange={(e) => setField("location", e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.description")}</label>
        <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={3} className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.link")}</label>
        <input type="url" value={form.link} onChange={(e) => setField("link", e.target.value)} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.latitude")}</label>
          <input type="number" step="any" value={form.latitude} onChange={(e) => setField("latitude", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">{t("admin.longitude")}</label>
          <input type="number" step="any" value={form.longitude} onChange={(e) => setField("longitude", e.target.value)} className={inputClass} />
        </div>
      </div>

      {/* Image */}
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">{t("admin.image")}</label>
        {imagePreview && (
          <div className="mb-2 relative w-full h-40 rounded-xl overflow-hidden">
            <Image src={imagePreview} alt="Festival" fill className="object-cover" />
          </div>
        )}
        <label className="flex items-center gap-2 cursor-pointer bg-gray-100 rounded-xl px-4 py-3 text-gray-600 font-medium text-sm w-fit">
          <Camera size={16} />
          {t("experience.uploadPhoto")}
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      <div className="pt-2 space-y-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold rounded-xl transition-colors"
        >
          {saving ? t("common.loading") : t("admin.save")}
        </button>

        {festival && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors"
          >
            {deleting ? t("common.loading") : t("admin.deleteFestival")}
          </button>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="w-full py-3 border border-gray-200 text-gray-500 font-medium rounded-xl"
        >
          {t("admin.cancel")}
        </button>
      </div>
    </form>
  );
}
