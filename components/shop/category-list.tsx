
"use client";

import type { Category } from "@/types/shop";

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryList({
  categories,
  selectedCategory,
  onSelect,
}: CategoryListProps) {
  return (
    <section className="w-full" aria-label="دسته‌بندی محصولات">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-black">
          دسته‌بندی‌ها
        </h2>

        <span className="text-sm text-gray-500">
          {categories.length} دسته
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        <button
          type="button"
          onClick={() => onSelect("")}
          aria-pressed={selectedCategory === ""}
          className={`shrink-0 rounded-xl border px-5 py-3 text-sm font-medium transition-colors ${
            selectedCategory === ""
              ? "border-black bg-black text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-black"
          }`}
        >
          همه محصولات
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.slug)}
              aria-pressed={isSelected}
              className={`flex shrink-0 items-center gap-3 rounded-xl border px-5 py-3 text-sm transition-colors ${
                isSelected
                  ? "border-black bg-black text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-black"
              }`}
            >
              <span className="font-medium">{category.name}</span>

              <span
                className={`rounded-lg px-2 py-1 text-xs ${
                  isSelected
                    ? "bg-white/15 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {category.productCount}
              </span>
            </button>
          );
        })}
      </div>

      {categories.length === 0 && (
        <p className="py-4 text-sm text-gray-500">
          دسته‌بندی‌ای برای نمایش وجود ندارد.
        </p>
      )}
    </section>
  );
}
