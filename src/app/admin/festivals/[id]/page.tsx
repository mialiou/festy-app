import { createClient } from "@/lib/supabase/server";
import FestivalForm from "@/components/festivals/FestivalForm";
import { notFound } from "next/navigation";
import type { Festival } from "@/types/database";

export default async function EditFestivalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("festivals")
    .select("*")
    .eq("id", id)
    .single();

  const festival = data as Festival | null;
  if (!festival) return notFound();

  return (
    <div>
      <div className="px-4 pt-5">
        <h1 className="text-2xl font-bold text-gray-900">Edit Festival</h1>
        <p className="text-gray-500 text-sm">{festival.name}</p>
      </div>
      <FestivalForm festival={festival} />
    </div>
  );
}
