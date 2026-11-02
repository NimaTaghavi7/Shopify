"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import RequireAuth from "@/components/auth/require-auth";
import {
  cancelOrder,
  getErrorMessage,
  getErrorStatus,
  getOrder,
  payOrder,
  type Order,
} from "@/lib/api";
import {
  formatDate,
  formatNumber,
  formatOrderId,
  formatToman,
} from "@/lib/format";
import { getStatusInfo } from "@/lib/order-status";

type RecordData = Record<string, unknown>;

function toRecord(value: unknown): RecordData {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as RecordData;
  }

  return {};
}

function getText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const number = Number(value);

    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      Number.isFinite(number)
    ) {
      return number;
    }
  }

  return null;
}

/** ساختار آیتم سفارش بین پاسخ‌های مختلف API ممکن است فرق کند؛ اینجا یکدست می‌شود. */
function getOrderItem(item: unknown, index: number) {
  const data = toRecord(item);
  const product = toRecord(data.product);

  const productName = typeof data.product === "string" ? data.product : "";

  const name =
    getText(
      product.name,
      product.title,
      data.productName,
      data.product_name,
      data.name,
      productName,
    ) || "محصول سفارش";

  const quantity = Math.max(1, getNumber(data.quantity, data.count) ?? 1);

  const unitPrice =
    getNumber(data.price, data.unitPrice, data.unit_price, product.price) ?? 0;

  const subtotal =
    getNumber(data.subtotal, data.lineTotal, data.line_total, data.total) ??
    unitPrice * quantity;

  const productId = getNumber(
    product.id,
    data.productId,
    data.product_id,
  );

  const id =
    getText(
      String(data.id ?? ""),
      String(product.id ?? ""),
      String(data.productId ?? ""),
      String(data.product_id ?? ""),
    ) || `${name}-${index}`;

  return { id, productId, name, quantity, subtotal };
}

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);

  const orderId = params.id;

  const loadOrder = useCallback(async () => {
    const result = await getOrder(orderId);
    setOrder(result);
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      setError("");

      try {
        const result = await getOrder(orderId);

        if (!cancelled) {
          setOrder(result);
        }
      } catch (err) {
        if (!cancelled) {
          setOrder(null);
          setError(
            getErrorStatus(err) === 404
              ? "سفارش موردنظر پیدا نشد."
              : getErrorMessage(err, "دریافت سفارش ناموفق بود."),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (orderId) {
      void initialLoad();
    }

    return () => {
      cancelled = true;
    };
  }, [orderId, retry]);

  async function handlePay() {
    if (!order || busy || order.status !== "pending") return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await payOrder(order.id);
      await loadOrder();
      setNotice("پرداخت سفارش ثبت شد.");
    } catch (err) {
      setError(getErrorMessage(err, "پرداخت سفارش ناموفق بود."));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!order || busy || order.status !== "pending") return;

    if (!window.confirm("از لغو این سفارش مطمئنی؟")) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      await cancelOrder(order.id);
      await loadOrder();
      setNotice("سفارش لغو شد.");
    } catch (err) {
      setError(getErrorMessage(err, "لغو سفارش ناموفق بود."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main dir="rtl" className="page-sm" aria-busy="true">
        <div className="skeleton h-56" />
      </main>
    );
  }

  if (!order) {
    return (
      <main
        dir="rtl"
        className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-5 text-center"
      >
        <p role="alert" className="text-sm leading-7 text-red-600">
          {error || "سفارش موردنظر پیدا نشد."}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="btn btn-outline"
          >
            تلاش مجدد
          </button>

          <Link href="/orders" className="btn btn-primary">
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </main>
    );
  }

  const status = getStatusInfo(order.status);
  const date = formatDate(order.created_at ?? order.createdAt);

  const displayItems = (Array.isArray(order.items) ? order.items : []).map(
    (item, index) => getOrderItem(item, index),
  );

  const itemsTotal = displayItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = getNumber(order.totalPrice, order.total) ?? itemsTotal;

  return (
    <main dir="rtl" className="page-sm text-black">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="page-title">جزئیات سفارش</h1>

          <p className="mt-2 text-sm text-gray-500">
            شماره سفارش: #{formatOrderId(order.id)}
            {date && <span className="mr-3">تاریخ ثبت: {date}</span>}
          </p>
        </div>

        <span
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {error && (
        <p role="alert" className="alert alert-error mb-5">
          {error}
        </p>
      )}

      {notice && (
        <p role="status" className="alert alert-success mb-5">
          {notice}
        </p>
      )}

      <section className="card space-y-4 p-5">
        <h2 className="text-base font-bold">اطلاعات گیرنده</h2>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">نام گیرنده</p>
            <p className="mt-1">{order.fullName || "ثبت نشده"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">شماره موبایل</p>
            <p className="mt-1" dir="ltr">
              {order.phone || "ثبت نشده"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-gray-500">آدرس</p>
            <p className="mt-1 whitespace-pre-line leading-7">
              {order.address || "ثبت نشده"}
            </p>
          </div>
        </div>
      </section>

      <section className="card mt-5 p-5">
        <h2 className="mb-4 text-base font-bold">محصولات سفارش</h2>

        {displayItems.length > 0 ? (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  {item.productId !== null ? (
                    <Link
                      href={`/shop/${item.productId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium">{item.name}</p>
                  )}

                  <p className="mt-1 text-xs text-gray-500">
                    تعداد: {formatNumber(item.quantity)}
                  </p>
                </div>

                <strong className="shrink-0 text-sm">
                  {formatToman(item.subtotal)}
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            جزئیات محصولات در پاسخ سرور موجود نیست.
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="text-sm text-gray-500">مبلغ کل</span>
          <strong className="text-lg">{formatToman(total)}</strong>
        </div>
      </section>

      {order.status === "pending" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handlePay}
            disabled={busy}
            className="btn btn-primary py-4"
          >
            {busy ? "در حال انجام..." : "پرداخت آزمایشی"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="btn btn-danger py-4"
          >
            لغو سفارش
          </button>
        </div>
      )}

      <Link
        href="/orders"
        className="mt-6 inline-block text-sm underline underline-offset-4"
      >
        بازگشت به فهرست سفارش‌ها
      </Link>
    </main>
  );
}

export default function OrderDetailsPage() {
  return (
    <RequireAuth>
      <OrderDetailsContent />
    </RequireAuth>
  );
}
