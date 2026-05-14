"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";
import { Festival } from "@/types/database";
import { FAHRGESCHAEFTE_OPTIONS, BEER_SIZES } from "@/lib/utils";
import toast from "react-hot-toast";
import { X, Star, Camera } from "lucide-react";

interface ExperienceFormProps {
  festival: Festival;
  userId: string;
  onClose: () => void;
  onSaved?: () => void;
}

export default function ExperienceForm({
  festival,
  userId,
  onClose,
  onSaved,
}: ExperienceFormProps) {
  const { t } = useTranslation();
  const nowLocal = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };
  const [form, setForm] = useState({
    join_date: nowLocal(),
    bierbrauer: "",
    beer_name: "",
    beer_size: "" as "0.3L" | "0.5L" | "1L" | "",
    beer_price: "",
    bratwurst_price: "",
    rating: 0,
    comment: "",
    senf: "",
    ice_cream_price: "",
    fahrgeschaefte: [] as string[],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const setField = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleFahrt = (val: string) => {
    setForm((prev) => ({
      ...prev,
      fahrgeschaefte: prev.fahrgeschaefte.includes(val)
        ? prev.fahrgeschaefte.filter((f) => f !== val)
        : [...prev.fahrgeschaefte, val],
    }));
  };

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

    let image_url: string | null = null;
    if (imageFile) {
      image_url = await uploadImage(imageFile);
    }

    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("experiences") as any).insert({
      festival_id: festival.id,
      user_id: userId,
      join_date: new Date(form.join_date).toISOString(),
      bierbrauer: form.bierbrauer || null,
      beer_name: form.beer_name || null,
      beer_size: (form.beer_size || null) as "0.3L" | "0.5L" | "1L" | null,
      beer_price: form.beer_price ? parseFloat(form.beer_price) : null,
      bratwurst_price: form.bratwurst_price ? parseFloat(form.bratwurst_price) : null,
      rating: form.rating || null,
      comment: form.comment || null,
      senf: form.senf || null,
      ice_cream_price: form.ice_cream_price ? parseFloat(form.ice_cream_price) : null,
      fahrgeschaefte: form.fahrgeschaefte,
      image_url,
    });

    setSaving(false);
    if (error) {
      toast.error(t("experience.error"));
    } else {
      toast.success(t("experience.saved"));
      onSaved?.();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end">
      <div className="bg-white w-full max-h-[95vh] rounded-t-3xl flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 flex items-center justify-between mb-5 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{t("experience.title")}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="px-5 overflow-y-auto flex-1">
          <form id="experience-form" onSubmit={handleSubmit} className="space-y-4 pb-4">
            {/* Festival */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.festival")}
              </label>
              <div className="bg-gray-100 rounded-xl px-4 py-3 text-gray-700">{festival.name}</div>
            </div>

            {/* Date */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.date")}
              </label>
              <input
                type="datetime-local"
                value={form.join_date}
                onChange={(e) => setField("join_date", e.target.value)}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Bierbrauer */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.bierbrauer")}
              </label>
              <input
                type="text"
                value={form.bierbrauer}
                onChange={(e) => setField("bierbrauer", e.target.value)}
                placeholder={t("experience.bierbrauerPlaceholder")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Beer Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.beerName")}
              </label>
              <input
                type="text"
                value={form.beer_name}
                onChange={(e) => setField("beer_name", e.target.value)}
                placeholder={t("experience.beerNamePlaceholder")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Beer Size */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {t("experience.beerSize")}
              </label>
              <div className="flex gap-2">
                {BEER_SIZES.map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => setField("beer_size", form.beer_size === size ? "" : size)}
                    className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
                      form.beer_size === size
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Beer Price */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.beerPrice")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={form.beer_price}
                  onChange={(e) => setField("beer_price", e.target.value)}
                  placeholder="e.g. 4.50"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 pr-8 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>

            {/* Bratwurst Price */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.bratwurstPrice")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={form.bratwurst_price}
                  onChange={(e) => setField("bratwurst_price", e.target.value)}
                  placeholder="e.g. 3.00"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 pr-8 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>

            {/* Senf Marke */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.senf")}
              </label>
              <input
                type="text"
                value={form.senf}
                onChange={(e) => setField("senf", e.target.value)}
                placeholder={t("experience.senfPlaceholder")}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* Ice Cream Price */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.iceCreamPrice")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={form.ice_cream_price}
                  onChange={(e) => setField("ice_cream_price", e.target.value)}
                  placeholder="e.g. 2.50"
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 pr-8 text-gray-700 outline-none focus:ring-2 focus:ring-orange-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                {t("experience.rating")}
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setField("rating", form.rating === star ? 0 : star)}
                    className="p-0.5"
                  >
                    <Star
                      size={26}
                      className={
                        star <= form.rating
                          ? "fill-orange-400 text-orange-400"
                          : "text-gray-300"
                      }
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment / My Note */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">
                {t("experience.comment")}
              </label>
              <textarea
                value={form.comment}
                onChange={(e) => setField("comment", e.target.value)}
                placeholder={t("experience.commentPlaceholder")}
                rows={3}
                className="w-full bg-gray-100 rounded-xl px-4 py-3 text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            {/* Photos */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {t("experience.photo")}
              </label>
              <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 rounded-xl py-4 text-orange-600 font-medium text-sm cursor-pointer hover:bg-orange-50 transition-colors">
                <Camera size={18} />
                {t("experience.uploadPhoto")}
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {imagePreview && (
                <div className="mt-2 relative w-32 h-32">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Fahrgeschäfte & Spielbuden */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {t("experience.fahrgeschaefte")}
              </label>
              <div className="flex flex-wrap gap-2">
                {FAHRGESCHAEFTE_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleFahrt(value)}
                    className={`py-3 px-4 rounded-full border text-sm font-medium transition-colors ${
                      form.fahrgeschaefte.includes(value)
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* Sticky submit */}
        <div className="px-5 py-4 shrink-0 border-t border-gray-100 bg-white">
          <button
            type="submit"
            form="experience-form"
            disabled={saving}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-bold rounded-xl transition-colors text-base"
          >
            {saving ? t("experience.saving") : t("experience.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
