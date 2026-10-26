
"use client";

import type { ProductFilters as ProductFiltersType } from "@/types/shop";

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  onReset: () => void;
  minProductPrice: number;
  maxProductPrice: number;
}

const priceFormatter = new Intl.NumberFormat("fa-IR");

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  minProductPrice,
  maxProductPrice,
}: ProductFiltersProps) {
  const MIN_PRICE = minProductPrice;
  const MAX_PRICE = Math.max(maxProductPrice, minProductPrice + 1);

  const PRICE_STEP = Math.max(
    1,
    Math.ceil((MAX_PRICE - MIN_PRICE) / 100),
  );

  const minValue =
    filters.minPrice === "" ? MIN_PRICE : Number(filters.minPrice);

  const maxValue =
    filters.maxPrice === "" ? MAX_PRICE : Number(filters.maxPrice);

  const safeMin = Math.max(
    MIN_PRICE,
    Math.min(
      Number.isFinite(minValue) ? minValue : MIN_PRICE,
      MAX_PRICE - PRICE_STEP,
    ),
  );

  const safeMax = Math.max(
    MIN_PRICE + PRICE_STEP,
    Math.min(
      Number.isFinite(maxValue) ? maxValue : MAX_PRICE,
      MAX_PRICE,
    ),
  );

  function updateRange(nextMin: number, nextMax: number) {
    onChange({
      ...filters,
      minPrice: nextMin <= MIN_PRICE ? "" : String(nextMin),
      maxPrice: nextMax >= MAX_PRICE ? "" : String(nextMax),
    });
  }

  return (
    <section aria-label="فیلتر محصولات" className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-black">فیلتر محصولات</h2>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-gray-500 underline underline-offset-4 transition hover:text-black"
        >
          پاک کردن همه
        </button>
      </div>

      {/* فیلتر قیمت */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-black">بازه قیمت</h3>

        <div className="rounded-xl border border-gray-200 p-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <span className="mb-1 block text-xs text-gray-500">از</span>
              <strong className="text-sm text-black">
                {priceFormatter.format(safeMin)}
              </strong>
            </div>

            <span
              aria-hidden="true"
              className="h-px flex-1 bg-gray-200"
            />

            <div className="text-left">
              <span className="mb-1 block text-xs text-gray-500">تا</span>
              <strong className="text-sm text-black">
                {priceFormatter.format(safeMax)}
              </strong>
            </div>
          </div>

          <div
            className="relative h-7"
            dir="ltr"
            aria-label="انتخاب بازه قیمت"
          >
            <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />

            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-black"
              style={{
                left: `${((safeMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
                right: `${
                  100 -
                  ((safeMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
                }%`,
              }}
            />

            <input
              aria-label="حداقل قیمت"
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={PRICE_STEP}
              value={safeMin}
              onChange={(event) => {
                const value = Number(event.target.value);

                updateRange(
                  Math.min(value, safeMax - PRICE_STEP),
                  safeMax,
                );
              }}
              className="price-range-thumb absolute inset-0 h-7 w-full cursor-pointer appearance-none bg-transparent"
            />

            <input
              aria-label="حداکثر قیمت"
              type="range"
              min={MIN_PRICE}
              max={MAX_PRICE}
              step={PRICE_STEP}
              value={safeMax}
              onChange={(event) => {
                const value = Number(event.target.value);

                updateRange(
                  safeMin,
                  Math.max(value, safeMin + PRICE_STEP),
                );
              }}
              className="price-range-thumb price-range-upper absolute inset-0 h-7 w-full cursor-pointer appearance-none bg-transparent"
            />
          </div>

          <div className="mt-2 flex justify-between gap-2 text-[11px] text-gray-500">
            <span>{priceFormatter.format(MIN_PRICE)} تومان</span>
            <span>{priceFormatter.format(MAX_PRICE)} تومان</span>
          </div>
        </div>

        <p className="text-xs leading-5 text-gray-500">
          برای تغییر محدوده قیمت، دستگیره‌های نوار را جابه‌جا کن.
        </p>
      </div>

      {/* فیلتر موجودی */}
      <div className="border-t border-gray-200 pt-5">
        <label
          htmlFor="filter-in-stock"
          className="flex cursor-pointer items-center justify-between gap-3 rounded-xl transition"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-black">
              فقط محصولات موجود
            </span>
            <span className="mt-1 block text-xs leading-5 text-gray-500">
              نمایش محصولات قابل خرید
            </span>
          </span>

          <span className="relative inline-flex shrink-0 items-center">
            <input
              id="filter-in-stock"
              type="checkbox"
              checked={filters.inStock}
              onChange={(event) =>
                onChange({
                  ...filters,
                  inStock: event.target.checked,
                })
              }
              className="peer sr-only"
            />

            <span className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-black peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black" />

            <span className="pointer-events-none absolute right-0.5 h-5 w-5 rounded-full border border-gray-300 bg-white shadow-sm transition-transform peer-checked:-translate-x-5" />
          </span>
        </label>
      </div>
    </section>
  );
}
