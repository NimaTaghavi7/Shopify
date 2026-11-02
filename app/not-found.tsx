import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "صفحه پیدا نشد",
};

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center"
    >
      <p className="text-7xl font-black tracking-tight text-gray-200">۴۰۴</p>

      <h1 className="mt-4 text-2xl font-bold">صفحه موردنظر پیدا نشد</h1>

      <p className="mt-3 text-sm leading-7 text-gray-500">
        آدرس را اشتباه وارد کرده‌ای یا این صفحه دیگر وجود ندارد. از لینک‌های
        زیر ادامه بده.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          صفحه اصلی
        </Link>

        <Link href="/shop" className="btn btn-outline">
          مشاهده فروشگاه
        </Link>
      </div>
    </main>
  );
}
