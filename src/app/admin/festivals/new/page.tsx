import FestivalForm from "@/components/festivals/FestivalForm";

export default function NewFestivalPage() {
  return (
    <div>
      <div className="px-4 pt-5">
        <h1 className="text-2xl font-bold text-gray-900">New Festival</h1>
      </div>
      <FestivalForm />
    </div>
  );
}
