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
    <section aria-label="دسته‌بندی محصولات">
      <h2 className="mb-4 text-base font-bold text-black">دسته‌بندی‌ها</h2>
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => onSelect("")}
          aria-pressed={selectedCategory === ""}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-right text-sm transition ${
            selectedCategory === "" ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span>همه محصولات</span>
        </button>
        {categories.map((category) => {
          const selected = selectedCategory === category.slug;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelect(category.slug)}
              aria-pressed={selected}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-right text-sm transition ${
                selected ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>{category.name}</span>
              <span className={`text-xs ${selected ? "text-gray-300" : "text-gray-400"}`}>
                {category.productCount.toLocaleString("fa-IR")}
              </span>
            </button>
          );
        })}
      </div>
      {categories.length === 0 && (
        <p className="mt-3 text-sm text-gray-500">دسته‌بندی‌ای برای نمایش وجود ندارد.</p>
      )}
    </section>
  );
}
