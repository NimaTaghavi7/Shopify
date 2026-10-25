"use client";

import type { ProductFilters as ProductFiltersType } from "@/types/shop";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  onReset: () => void;
}

export default function ProductFilters({
  filters,
  onChange,
  onReset,
}: ProductFiltersProps) {
  function updateFilter<K extends keyof ProductFiltersType>(
    key: K,
    value: ProductFiltersType[K],
  ) {
    onChange({
      ...filters,
      [key]: value,
    });
  }

  return (
    <section
      aria-label="جستجو و فیلتر محصولات"
      className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-black">جستجو و فیلتر</h2>

        <button
          type="button"
          onClick={onReset}
          className="text-sm text-gray-500 transition hover:text-black"
        >
          پاک کردن فیلترها
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <label
            htmlFor="product-search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            جستجوی محصول
          </label>

          <input
            id="product-search"
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="نام محصول را وارد کنید..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="min-price"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            حداقل قیمت (تومان)
          </label>

          <input
            id="min-price"
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) => updateFilter("minPrice", event.target.value)}
            placeholder="مثلاً 100000"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="max-price"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            حداکثر قیمت (تومان)
          </label>

          <input
            id="max-price"
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value)}
            placeholder="مثلاً 1000000"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black"
          />
        </div>

        <div>
          <label
            htmlFor="product-sort"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            مرتب‌سازی
          </label>

          <select
            id="product-sort"
            value={filters.sort}
            onChange={(event) =>
              updateFilter(
                "sort",
                event.target.value as ProductFiltersType["sort"],
              )
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-black"
          >
            <option value="newest">جدیدترین</option>
            <option value="price">ارزان‌ترین</option>
            <option value="-price">گران‌ترین</option>
          </select>
        </div>
      </div>
    </section>
  );
}
