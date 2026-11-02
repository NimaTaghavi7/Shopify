"use client";

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/require-auth";
import { useAuth } from "@/components/providers/auth-provider";
import { formatDate } from "@/lib/format";

function AccountContent() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    // پس از خروج، RequireAuth کاربر را به صفحهٔ اصلی می‌برد.
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  }

  const joinedAt = formatDate(user?.created_at);

  return (
    <main dir="rtl" className="page-sm text-black">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="page-title">حساب کاربری</h1>
        <p className="mt-2 text-sm text-gray-500">
          اطلاعات حساب و دسترسی سریع به بخش‌های فروشگاه
        </p>
      </header>

      <section className="card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-xl font-bold uppercase text-white"
          >
            {user?.username.charAt(0) ?? "؟"}
          </span>

          <div className="min-w-0">
            <p className="text-xs text-gray-500">نام کاربری</p>
            <p className="mt-1 truncate text-lg font-bold" dir="ltr">
              {user?.username ?? "نامشخص"}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-gray-100 pt-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-gray-500">وضعیت</dt>
            <dd className="mt-1 font-medium">وارد شده‌ای</dd>
          </div>

          {joinedAt && (
            <div>
              <dt className="text-xs text-gray-500">تاریخ عضویت</dt>
              <dd className="mt-1 font-medium">{joinedAt}</dd>
            </div>
          )}
        </dl>

        {!user && (
          <p className="alert mt-5 border-gray-200 bg-gray-50 text-gray-600">
            دریافت اطلاعات پروفایل از سرور ممکن نشد. صفحه را دوباره بارگذاری کن.
          </p>
        )}
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-3">
        <Link href="/orders" className="card p-5 transition hover:border-black">
          <h2 className="font-bold">سفارش‌های من</h2>
          <p className="mt-2 text-sm leading-7 text-gray-500">
            پیگیری وضعیت و جزئیات سفارش‌ها
          </p>
        </Link>

        <Link href="/cart" className="card p-5 transition hover:border-black">
          <h2 className="font-bold">سبد خرید</h2>
          <p className="mt-2 text-sm leading-7 text-gray-500">
            مشاهده و ویرایش محصولات انتخابی
          </p>
        </Link>

        <Link href="/shop" className="card p-5 transition hover:border-black">
          <h2 className="font-bold">فروشگاه</h2>
          <p className="mt-2 text-sm leading-7 text-gray-500">
            ادامهٔ خرید و دیدن محصولات
          </p>
        </Link>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="btn btn-danger mt-8"
      >
        {loggingOut ? "در حال خروج..." : "خروج از حساب"}
      </button>
    </main>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountContent />
    </RequireAuth>
  );
}
