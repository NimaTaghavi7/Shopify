"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/require-auth";
import { getErrorMessage, getOrders, type Order } from "@/lib/api";
import { formatDate, formatOrderId, formatToman } from "@/lib/format";
import { getStatusInfo } from "@/lib/order-status";

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      setLoading(true);
      setError("");

      try {
        const result = await getOrders();

        if (active) {
          // جدیدترین سفارش اول؛ شناسه‌ها عددی و افزایشی فرض می‌شوند و در غیر این صورت ترتیب API حفظ می‌شود.
          const numeric = result.every((order) => Number.isFinite(Number(order.id)));

          setOrders(
            numeric
              ? [...result].sort((a, b) => Number(b.id) - Number(a.id))
              : result,
          );
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err, "دریافت سفارش‌ها ناموفق بود."));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [retry]);

  if (loading) {
    return (
      <main dir="rtl" className="page-md" aria-busy="true">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="page-md text-black">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="page-title">سفارش‌های من</h1>
          <p className="mt-2 text-sm text-gray-500">تاریخچه و وضعیت سفارش‌ها</p>
        </div>

        <Link href="/shop" className="text-sm underline underline-offset-4">
          بازگشت به فروشگاه
        </Link>
      </div>

      {error && (
        <div role="alert" className="card px-5 py-12 text-center">
          <p className="text-sm leading-7 text-gray-700">{error}</p>

          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="btn btn-primary mt-5"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="card px-5 py-16 text-center">
          <h2 className="text-lg font-bold">هنوز سفارشی ثبت نکرده‌ای</h2>

          <p className="mt-2 text-sm text-gray-500">
            بعد از ثبت سفارش، اطلاعات آن را اینجا می‌بینی.
          </p>

          <Link href="/shop" className="btn btn-primary mt-6">
            مشاهده محصولات
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const status = getStatusInfo(order.status);
          const amount = Number(order.totalPrice ?? order.total ?? 0);
          const date = formatDate(order.created_at ?? order.createdAt);

          return (
            <article key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">شماره سفارش</p>
                  <p className="mt-1 font-bold">#{formatOrderId(order.id)}</p>
                </div>

                {date && (
                  <div>
                    <p className="text-xs text-gray-500">تاریخ ثبت</p>
                    <p className="mt-1 text-sm font-medium">{date}</p>
                  </div>
                )}

                <span
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500">مبلغ سفارش</p>
                  <p className="mt-1 text-sm font-bold">{formatToman(amount)}</p>
                </div>

                <Link
                  href={`/orders/${order.id}`}
                  className="btn btn-primary px-5 py-2.5"
                >
                  مشاهده جزئیات
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersContent />
    </RequireAuth>
  );
}
