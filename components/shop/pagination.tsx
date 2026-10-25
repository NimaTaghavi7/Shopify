"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav aria-label="صفحه‌بندی محصولات" className="flex flex-wrap items-center justify-center gap-2 py-8">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        قبلی
      </button>
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? "page" : undefined}
          aria-label={`صفحه ${pageNumber}`}
          className={`min-w-10 rounded-lg border px-3 py-2.5 text-sm transition ${
            pageNumber === page ? "border-black bg-black font-semibold text-white" : "border-gray-200 text-gray-700 hover:border-black"
          }`}
        >
          {pageNumber.toLocaleString("fa-IR")}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        بعدی
      </button>
    </nav>
  );
}
