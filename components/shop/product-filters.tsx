"use client";

import type { ProductFilters as ProductFiltersType } from "@/types/shop";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  onReset: () => void;
}

export default function ProductFilters({ filters, onChange, onReset }: ProductFiltersProps) {
  function updateFilter<K extends keyof ProductFiltersType>(key: K, value: ProductFiltersType[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section aria-label="فیلتر محصولات" className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-black">فیلترها</h2>
        <button type="button" onClick={onReset} className="text-xs text-gray-500 underline underline-offset-4 hover:text-black">
          پاک کردن
        </button>
      </div>

      <div>
        <label htmlFor="min-price" className="mb-2 block text-sm font-medium text-gray-700">
          حداقل قیمت (تومان)
        </label>
        <input
          id="min-price"
          type="number"
          min="0"
          value={filters.minPrice}
          onChange={(event) => updateFilter("minPrice", event.target.value)}
          placeholder="مثلاً 100000"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="max-price" className="mb-2 block text-sm font-medium text-gray-700">
          حداکثر قیمت (تومان)
        </label>
        <input
          id="max-price"
          type="number"
          min="0"
          value={filters.maxPrice}
          onChange={(event) => updateFilter("maxPrice", event.target.value)}
          placeholder="مثلاً 1000000"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black"
        />
      </div>

      <div>
        <label htmlFor="product-sort" className="mb-2 block text-sm font-medium text-gray-700">
          مرتب‌سازی
        </label>
        <select
          id="product-sort"
          value={filters.sort}
          onChange={(event) => updateFilter("sort", event.target.value as ProductFiltersType["sort"])}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-black"
        >
          <option value="newest">جدیدترین</option>
          <option value="price">ارزان‌ترین</option>
          <option value="-price">گران‌ترین</option>
        </select>
      </div>
    </section>
  );
}
