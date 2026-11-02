"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrders, type Order } from "@/lib/api";

const money = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

function statusInfo(status: string) {
  if (status === "paid") {
    return { label: "پرداخت شده", className: "bg-green-100 text-green-700" };
  }

  if (status === "cancelled") {
    return { label: "لغو شده", className: "bg-red-100 text-red-700" };
  }

  return { label: "در انتظار پرداخت", className: "bg-yellow-100 text-yellow-800" };
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getOrders()
      .then((result) => {
        if (active) setOrders(result);
      })
      .catch((err) => {
        if (active) {
          if (err instanceof Error && err.message === "LOGIN_REQUIRED") {
            router.push("/login");
          } else {
            setError(err instanceof Error ? err.message : "دریافت سفارش‌ها ناموفق بود.");
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main dir="rtl" className="mx-auto min-h-screen max-w-4xl px-5 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
          <div className="h-24 rounded-2xl bg-gray-100" />
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="mx-auto min-h-screen max-w-4xl px-5 py-10 text-black">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black pb-5">
        <div>
          <h1 className="text-2xl font-bold">سفارش‌های من</h1>
          <p className="mt-2 text-sm text-gray-500">تاریخچه و وضعیت سفارش‌ها</p>
        </div>
        <Link href="/shop" className="text-sm underline underline-offset-4">بازگشت به فروشگاه</Link>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!error && orders.length === 0 && (
        <div className="rounded-2xl border border-gray-200 px-5 py-16 text-center">
          <h2 className="text-lg font-bold">هنوز سفارشی ثبت نکرده‌ای</h2>
          <p className="mt-2 text-sm text-gray-500">بعد از ثبت سفارش، اطلاعات آن را اینجا می‌بینی.</p>
          <Link href="/shop" className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm text-white">
            مشاهده محصولات
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => {
          const status = statusInfo(order.status);
          const amount = Number(order.totalPrice ?? order.total ?? 0);

          return (
            <article key={order.id} className="rounded-2xl border border-gray-200 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">شماره سفارش</p>
                  <p className="mt-1 font-bold">#{order.id}</p>
                </div>
                <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${status.className}`}>
                  {status.label}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500">مبلغ سفارش</p>
                  <p className="mt-1 text-sm font-bold">{money(amount)}</p>
                </div>
                <Link
                  href={`/orders/${order.id}`}
                  className="rounded-lg bg-black px-5 py-2.5 text-sm text-white transition hover:bg-gray-800"
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