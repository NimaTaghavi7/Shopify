"use client";

import { formatNumber } from "@/lib/format";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** شماره صفحه‌ها با «…» برای تعداد زیاد: اول، آخر و اطراف صفحهٔ جاری. */
function getVisiblePages(page: number, totalPages: number): (number | "gap")[] {
  const wanted = new Set<number>([1, totalPages, page - 1, page, page + 1]);

  const sorted = [...wanted]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "gap")[] = [];

  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("gap");
    result.push(value);
  });

  return result;
}

const baseButton =
  "rounded-lg border px-4 py-2.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(page, totalPages);

  return (
    <nav
      aria-label="صفحه‌بندی محصولات"
      className="flex flex-wrap items-center justify-center gap-2 py-8"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={`${baseButton} border-gray-300 text-gray-700 hover:border-black`}
      >
        قبلی
      </button>

      {pages.map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} aria-hidden="true" className="px-1 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`صفحه ${formatNumber(item)}`}
            className={`min-w-10 rounded-lg border px-3 py-2.5 text-sm transition ${
              item === page
                ? "border-black bg-black font-semibold text-white"
                : "border-gray-300 text-gray-700 hover:border-black"
            }`}
          >
            {formatNumber(item)}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={`${baseButton} border-gray-300 text-gray-700 hover:border-black`}
      >
        بعدی
      </button>
    </nav>
  );
}
