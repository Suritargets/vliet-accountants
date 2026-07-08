export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-7 w-40 rounded bg-gray-100 animate-pulse mb-2" />
        <div className="h-4 w-72 max-w-full rounded bg-gray-100 animate-pulse" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-gray-100 animate-pulse" />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded h-12" />
        ))}
      </div>
    </div>
  );
}
