"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { ProductFilters as ProductFiltersType } from "@/types/shop";

export interface PriceBounds {
  min: number;
  max: number;
}

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  onReset: () => void;
  priceBounds: PriceBounds | null;
  priceBoundsError: boolean;
  onRetryPriceBounds: () => void;
}

const PRICE_COMMIT_DELAY = 300;

interface PriceRangeProps {
  filters: ProductFiltersType;
  onChange: (filters: ProductFiltersType) => void;
  bounds: PriceBounds;
}

function PriceRange({ filters, onChange, bounds }: PriceRangeProps) {
  const MIN_PRICE = bounds.min;
  const MAX_PRICE = Math.max(bounds.max, bounds.min + 1);
  const PRICE_STEP = Math.max(1, Math.ceil((MAX_PRICE - MIN_PRICE) / 100));

  function clamp(value: number, fallback: number) {
    const safe = Number.isFinite(value) ? value : fallback;
    return Math.max(MIN_PRICE, Math.min(safe, MAX_PRICE));
  }

  function fromFilters() {
    return {
      min: clamp(
        filters.minPrice === "" ? MIN_PRICE : Number(filters.minPrice),
        MIN_PRICE,
      ),
      max: clamp(
        filters.maxPrice === "" ? MAX_PRICE : Number(filters.maxPrice),
        MAX_PRICE,
      ),
    };
  }

  // مقدار پیش‌نویس هنگام کشیدن دستگیره‌ها؛ با تأخیر کوتاه به URL/فیلترها منتقل می‌شود.
  const [draft, setDraft] = useState(fromFilters);
  const committedKey = `${filters.minPrice}|${filters.maxPrice}|${MIN_PRICE}|${MAX_PRICE}`;
  const [syncedKey, setSyncedKey] = useState(committedKey);

  if (syncedKey !== committedKey) {
    // فیلتر از بیرون تغییر کرده (مثلاً «پاک کردن همه» یا دکمهٔ برگشت مرورگر).
    setSyncedKey(committedKey);
    setDraft(fromFilters());
  }

  const safeMin = Math.min(draft.min, MAX_PRICE - PRICE_STEP);
  const safeMax = Math.max(draft.max, MIN_PRICE + PRICE_STEP);

  useEffect(() => {
    const nextMin = draft.min <= MIN_PRICE ? "" : String(draft.min);
    const nextMax = draft.max >= MAX_PRICE ? "" : String(draft.max);

    if (nextMin === filters.minPrice && nextMax === filters.maxPrice) return;

    const timer = setTimeout(() => {
      onChange({ ...filters, minPrice: nextMin, maxPrice: nextMax });
    }, PRICE_COMMIT_DELAY);

    return () => clearTimeout(timer);
  }, [draft, MIN_PRICE, MAX_PRICE, filters, onChange]);

  const span = MAX_PRICE - MIN_PRICE;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-black">بازه قیمت</h3>

      <div className="rounded-xl border border-gray-200 p-3">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <span className="mb-1 block text-xs text-gray-500">از</span>
            <strong className="text-sm text-black">
              {formatNumber(safeMin)}
            </strong>
          </div>

          <span aria-hidden="true" className="h-px flex-1 bg-gray-200" />

          <div className="text-left">
            <span className="mb-1 block text-xs text-gray-500">تا</span>
            <strong className="text-sm text-black">
              {formatNumber(safeMax)}
            </strong>
          </div>
        </div>

        <div className="relative h-7" dir="ltr" aria-label="انتخاب بازه قیمت">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-200" />

          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-black"
            style={{
              left: `${((safeMin - MIN_PRICE) / span) * 100}%`,
              right: `${100 - ((safeMax - MIN_PRICE) / span) * 100}%`,
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

              setDraft({
                min: Math.min(value, safeMax - PRICE_STEP),
                max: safeMax,
              });
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

              setDraft({
                min: safeMin,
                max: Math.max(value, safeMin + PRICE_STEP),
              });
            }}
            className="price-range-thumb price-range-upper absolute inset-0 h-7 w-full cursor-pointer appearance-none bg-transparent"
          />
        </div>

        <div className="mt-2 flex justify-between gap-2 text-[11px] text-gray-500">
          <span>{formatNumber(MIN_PRICE)} تومان</span>
          <span>{formatNumber(MAX_PRICE)} تومان</span>
        </div>
      </div>

      <p className="text-xs leading-5 text-gray-500">
        برای تغییر محدوده قیمت، دستگیره‌های نوار را جابه‌جا کن.
      </p>
    </div>
  );
}

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  priceBounds,
  priceBoundsError,
  onRetryPriceBounds,
}: ProductFiltersProps) {
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

      {priceBounds ? (
        <PriceRange
          filters={filters}
          onChange={onChange}
          bounds={priceBounds}
        />
      ) : priceBoundsError ? (
        <div role="alert" className="space-y-2">
          <p className="text-sm text-gray-600">دریافت بازه قیمت ناموفق بود.</p>
          <button
            type="button"
            onClick={onRetryPriceBounds}
            className="text-sm font-semibold underline underline-offset-4"
          >
            تلاش مجدد
          </button>
        </div>
      ) : (
        <div className="skeleton h-24" aria-label="در حال دریافت بازه قیمت" />
      )}

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
                onChange({ ...filters, inStock: event.target.checked })
              }
              className="peer sr-only"
            />

            <span className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-black peer-focus-visible:outline peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black" />

            <span className="pointer-events-none absolute right-0.5 h-5 w-5 rounded-full border border-gray-300 bg-white shadow-sm transition-transform peer-checked:-translate-x-5" />
          </span>
        </label>
      </div>
    </section>
  );
}
