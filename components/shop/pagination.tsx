"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      aria-label="صفحه‌بندی محصولات"
      className="flex flex-wrap items-center justify-center gap-2 py-6"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
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
          className={`min-w-10 rounded-xl border px-3 py-2.5 text-sm transition ${
            pageNumber === page
              ? "border-black bg-black font-semibold text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-black hover:text-black"
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700"
      >
        بعدی
      </button>
    </nav>
  );
}
