export default function ShopLoading() {
  return (
    <main dir="rtl" className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-label="در حال بارگذاری فروشگاه" aria-busy="true">
      <div className="mb-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-gray-100" />
      </div>
      <div className="mb-8 h-12 animate-pulse rounded-xl bg-gray-100" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-black p-4">
          <div className="mb-5 h-5 w-24 animate-pulse rounded bg-gray-200" />
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="mb-3 h-9 animate-pulse rounded-lg bg-gray-100" />)}
        </aside>
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-black">
              <div className="aspect-square animate-pulse bg-gray-100" />
              <div className="space-y-3 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
