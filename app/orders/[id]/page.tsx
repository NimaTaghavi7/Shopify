
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

const money = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

function statusInfo(status: string) {
  if (status === "paid") {
    return {
      label: "پرداخت شده",
      className: "bg-green-100 text-green-700",
    };
  }

  if (status === "cancelled") {
    return {
      label: "لغو شده",
      className: "bg-red-100 text-red-700",
    };
  }

  return {
    label: "در انتظار پرداخت",
    className: "bg-yellow-100 text-yellow-800",
  };
}

function getOrderItem(item: unknown, index: number) {
  const data = toRecord(item);
  const product = toRecord(data.product);

  const productName =
    typeof data.product === "string"
      ? data.product
      : "";

  const name =
    getText(
      product.name,
      product.title,
      data.productName,
      data.product_name,
      data.name,
      productName,
    ) || "محصول سفارش";

  const quantity = Math.max(
    1,
    getNumber(data.quantity, data.count) ?? 1,
  );

  const unitPrice =
    getNumber(
      data.price,
      data.unitPrice,
      data.unit_price,
      product.price,
    ) ?? 0;

  const subtotal =
    getNumber(
      data.subtotal,
      data.lineTotal,
      data.line_total,
      data.total,
    ) ?? unitPrice * quantity;

  const id =
    getText(
      String(data.id ?? ""),
      String(product.id ?? ""),
      String(data.productId ?? ""),
      String(data.product_id ?? ""),
    ) || `${name}-${index}`;

  return {
    id,
    name,
    quantity,
    subtotal,
  };
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
      const status = (err as { status?: number })?.status;

      if (status === 401) {
        router.replace("/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "دریافت سفارش ناموفق بود.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) {
      void loadOrder();
    }
  }, [params.id]);

  async function handlePay() {
    if (!order || busy || order.status !== "pending") return;

    try {
      setBusy(true);
      setError("");

      await payOrder(order.id);
      await loadOrder();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "پرداخت سفارش ناموفق بود.",
      );
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
      setError(
        err instanceof Error
          ? err.message
          : "لغو سفارش ناموفق بود.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="mx-auto min-h-screen max-w-3xl px-5 py-12"
      >
        <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
      </main>
    );
  }

  if (error && !order) {
    return (
      <main
        dir="rtl"
        className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 text-center"
      >
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>

        <Link
          href="/orders"
          className="mt-5 rounded-xl bg-black px-6 py-3 text-sm text-white"
        >
          بازگشت به سفارش‌ها
        </Link>
      </main>
    );
  }

  if (!order) return null;

  const status = statusInfo(order.status);

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const displayItems = items.map((item, index) =>
    getOrderItem(item, index),
  );

  const itemsTotal = displayItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  const total =
    getNumber(order.totalPrice, order.total) ?? itemsTotal;

  return (
    <main
      dir="rtl"
      className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-black"
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black pb-5">
        <div>
          <h1 className="text-2xl font-bold">
            جزئیات سفارش
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            شماره سفارش: #{order.id}
          </p>
        </div>

        <span
          className={`rounded-lg px-3 py-2 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <section className="space-y-4 rounded-2xl border border-gray-200 p-5">
        <h2 className="text-base font-bold">
          اطلاعات گیرنده
        </h2>

        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">
              نام گیرنده
            </p>

            <p className="mt-1">
              {order.fullName || "ثبت نشده"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              شماره موبایل
            </p>

            <p className="mt-1" dir="ltr">
              {order.phone || "ثبت نشده"}
            </p>
          </div>

          <div className="sm:col-span-2">
            <p className="text-xs text-gray-500">
              آدرس
            </p>

            <p className="mt-1 leading-7">
              {order.address || "ثبت نشده"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-gray-200 p-5">
        <h2 className="mb-4 text-base font-bold">
          محصولات سفارش
        </h2>

        {displayItems.length > 0 ? (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    تعداد:{" "}
                    {item.quantity.toLocaleString("fa-IR")}
                  </p>
                </div>

                <strong className="shrink-0 text-sm">
                  {money(item.subtotal)}
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
          <span className="text-sm text-gray-500">
            مبلغ کل
          </span>

          <strong className="text-lg">
            {money(total)}
          </strong>
        </div>
      </section>

      {order.status === "pending" && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handlePay}
            disabled={busy}
            className="rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {busy ? "در حال انجام..." : "پرداخت آزمایشی"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="rounded-xl border border-red-300 px-5 py-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
