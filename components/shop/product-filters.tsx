
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
    Math.ceil((MAX_PRICE - MIN_PRICE) / 100)
  );

  const minValue =
    filters.minPrice === "" ? MIN_PRICE : Number(filters.minPrice);

  const maxValue =
    filters.maxPrice === "" ? MAX_PRICE : Number(filters.maxPrice);

  const safeMin = Math.max(
    MIN_PRICE,
    Math.min(minValue, MAX_PRICE - PRICE_STEP)
  );

  const safeMax = Math.max(
    MIN_PRICE + PRICE_STEP,
    Math.min(maxValue, MAX_PRICE)
  );

  function updateRange(nextMin: number, nextMax: number) {
    onChange({
      ...filters,
      minPrice: nextMin <= MIN_PRICE ? "" : String(nextMin),
      maxPrice: nextMax >= MAX_PRICE ? "" : String(nextMax),
    });
  }

  return (
    <section aria-label="فیلتر محصولات" className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-black">بازه قیمت</h2>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-black underline underline-offset-4 hover:opacity-60"
        >
          پاک کردن فیلترها
        </button>
      </div>

      <div className="rounded-xl border border-black p-3">
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-black">
          <div>
            <span className="mb-1 block text-gray-600">از</span>
            <strong className="text-sm">
              {priceFormatter.format(safeMin)}
            </strong>
          </div>

          <span
            aria-hidden="true"
            className="h-px flex-1 bg-black"
          />

          <div className="text-left">
            <span className="mb-1 block text-gray-600">تا</span>
            <strong className="text-sm">
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
              right: `${100 - ((safeMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100}%`,
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
                safeMax
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
                Math.max(value, safeMin + PRICE_STEP)
              );
            }}
            className="price-range-thumb price-range-upper absolute inset-0 h-7 w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>

        <div className="mt-2 flex justify-between gap-2 text-[11px] text-gray-600">
          <span>{priceFormatter.format(MIN_PRICE)} تومان</span>
          <span>{priceFormatter.format(MAX_PRICE)} تومان</span>
        </div>
      </div>

      <p className="text-xs leading-5 text-gray-600">
        برای تغییر قیمت، دو دستگیرهٔ مشکی نوار را بکش.
      </p>
    </section>
  );
}
