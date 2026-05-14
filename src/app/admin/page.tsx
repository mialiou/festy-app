import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid gap-3">
        <Link
          href="/admin/festivals"
          className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
        >
          <span className="text-3xl">🎪</span>
          <div>
            <p className="font-bold text-gray-900">Manage Festivals</p>
            <p className="text-sm text-gray-500">Add, edit, or delete festivals</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
