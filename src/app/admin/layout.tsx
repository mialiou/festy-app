export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍻</span>
            <span className="font-bold text-gray-900">Festy Admin</span>
          </div>
          <a href="/" className="text-sm text-orange-600 font-medium">← App</a>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
