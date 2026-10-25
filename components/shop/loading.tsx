export default function ShopLoading() {
  return (
    <main
      dir="rtl"
      className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      aria-label="در حال بارگذاری فروشگاه"
      aria-busy="true"
    >
      <div className="mb-8">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-3 h-4 w-64 max-w-full animate-pulse rounded bg-gray-100" />
      </div>

      <section className="mb-8">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />

        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="h-12 w-36 shrink-0 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-gray-100 p-5">
        <div className="mb-5 h-6 w-36 animate-pulse rounded bg-gray-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-12 animate-pulse rounded-xl bg-gray-100"
            />
          ))}
        </div>
      </section>

      <div className="mb-5 h-6 w-32 animate-pulse rounded bg-gray-200" />

      <section
        aria-label="در حال بارگذاری محصولات"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-gray-200"
          >
            <div className="aspect-square animate-pulse bg-gray-100" />

            <div className="space-y-3 p-4">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
