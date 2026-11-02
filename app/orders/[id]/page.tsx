"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  getOrder,
  payOrder,
  cancelOrder,
  type Order,
} from "@/lib/api";

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

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadOrder() {
    try {
      setLoading(true);
      setError("");
      const result = await getOrder(params.id);
      setOrder(result);
    } catch (err) {
      if (err instanceof Error && err.message === "LOGIN_REQUIRED") {
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "دریافت سفارش ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) void loadOrder();
  }, [params.id]);

  async function handlePay() {
    if (!order || busy || order.status !== "pending") return;

    try {
      setBusy(true);
      setError("");
      await payOrder(order.id);
      await loadOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "پرداخت سفارش ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!order || busy || order.status !== "pending") return;
    if (!window.confirm("از لغو این سفارش مطمئنی؟")) return;

    try {
      setBusy(true);
      setError("");
      await cancelOrder(order.id);
      await loadOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "لغو سفارش ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main dir="rtl" className="mx-auto min-h-screen max-w-3xl px-5 py-12">
        <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
      </main>
    );
  }

  if (error && !order) {
    return (
      <main dir="rtl" className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
        <p role="alert" className="text-sm text-red-600">{error}</p>
        <Link href="/orders" className="mt-5 rounded-xl bg-black px-6 py-3 text-sm text-white">
          بازگشت به سفارش‌ها
        </Link>
      </main>
    );
  }

  if (!order) return null;

  const status = statusInfo(order.status);
  const total = Number(order.totalPrice ?? order.total ?? 0);

  return (
    <main dir="rtl" className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-black">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black pb-5">
        <div>
          <h1 className="text-2xl font-bold">جزئیات سفارش</h1>
          <p className="mt-2 text-sm text-gray-500">شماره سفارش: #{order.id}</p>
        </div>
        <span className={`rounded-lg px-3 py-2 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="space-y-4 rounded-2xl border border-gray-200 p-5">
        <h2 className="text-base font-bold">اطلاعات گیرنده</h2>
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">نام گیرنده</p>
            <p className="mt-1">{order.fullName || "ثبت نشده"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">شماره موبایل</p>
            <p className="mt-1" dir="ltr">{order.phone || "ثبت نشده"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-500">آدرس</p>
            <p className="mt-1 leading-7">{order.address || "ثبت نشده"}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-gray-200 p-5">
        <h2 className="mb-4 text-base font-bold">محصولات سفارش</h2>

        {order.items?.length ? (
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.product.name}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    تعداد: {item.quantity.toLocaleString("fa-IR")}
                  </p>
                </div>
                <strong className="shrink-0 text-sm">{money(item.subtotal)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">جزئیات محصولات در پاسخ سرور موجود نیست.</p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="text-sm text-gray-500">مبلغ کل</span>
          <strong className="text-lg">{money(total)}</strong>
        </div>
      </section>

      {order.status === "pending" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handlePay}
            disabled={busy}
            className="rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {busy ? "در حال انجام..." : "پرداخت آزمایشی"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="rounded-xl border border-red-300 px-5 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            لغو سفارش
          </button>
        </div>
      )}

      <Link href="/orders" className="mt-6 inline-block text-sm underline underline-offset-4">
        بازگشت به فهرست سفارش‌ها
      </Link>
    </main>
  );
}