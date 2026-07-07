export default function Loading() {
  return (
    <>
      <section className="bg-navy text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-6 w-24 rounded-full bg-white/10 animate-pulse mb-4" />
          <div className="h-10 w-72 rounded bg-white/10 animate-pulse mb-4" />
          <div className="h-6 w-96 max-w-full rounded bg-white/10 animate-pulse" />
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 rounded-xl h-64"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
