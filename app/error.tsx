"use client";

import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main
      dir="rtl"
      className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center"
    >
      <h1 className="text-2xl font-bold">مشکلی پیش آمد</h1>

      <p className="mt-3 text-sm leading-7 text-gray-500">
        هنگام نمایش این صفحه خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کن یا به
        صفحه اصلی برگرد.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          تلاش مجدد
        </button>

        <Link href="/" className="btn btn-outline">
          صفحه اصلی
        </Link>
      </div>
    </main>
  );
}
