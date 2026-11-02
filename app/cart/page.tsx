"use client";

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "@/components/auth/require-auth";
import { useCart } from "@/components/providers/cart-provider";
import ProductImage from "@/components/shop/product-image";
import { getErrorMessage } from "@/lib/api";
import { formatNumber, formatToman } from "@/lib/format";

function CartContent() {
  const { cart, status, error: loadError, refresh, updateItem, removeItem, clear } =
    useCart();

  const [busyId, setBusyId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState("");

  async function changeQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;

    setBusyId(productId);
    setActionError("");

    try {
      await updateItem(productId, quantity);
    } catch (err) {
      setActionError(getErrorMessage(err, "تغییر تعداد ناموفق بود."));
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(productId: number) {
    setBusyId(productId);
    setActionError("");

    try {
      await removeItem(productId);
    } catch (err) {
      setActionError(getErrorMessage(err, "حذف محصول ناموفق بود."));
    } finally {
      setBusyId(null);
    }
  }

  async function emptyCart() {
    if (!window.confirm("از خالی کردن سبد خرید مطمئنی؟")) return;

    setClearing(true);
    setActionError("");

    try {
      await clear();
    } catch (err) {
      setActionError(getErrorMessage(err, "خالی کردن سبد ناموفق بود."));
    } finally {
      setClearing(false);
    }
  }

  if (status === "idle" || status === "loading") {
    return (
      <main dir="rtl" className="page-md" aria-busy="true">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-gray-100" />
          <div className="h-28 rounded-2xl bg-gray-100" />
          <div className="h-28 rounded-2xl bg-gray-100" />
        </div>
      </main>
    );
  }

  if (status === "error" && !cart) {
    return (
      <main dir="rtl" className="page-md">
        <div role="alert" className="card px-5 py-14 text-center">
          <p className="text-sm leading-7 text-gray-700">{loadError}</p>

          <button
            type="button"
            onClick={() => void refresh()}
            className="btn btn-primary mt-5"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const hasStockProblem = items.some(
    (item) => !item.product.inStock || item.quantity > item.product.stock,
  );

  return (
    <main dir="rtl" className="page-md text-black">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="page-title">سبد خرید</h1>

          <p className="mt-2 text-sm text-gray-500">
            {items.length > 0
              ? `${formatNumber(cart?.totalItems ?? 0)} محصول در سبد توست.`
              : "محصولات انتخاب‌شده را بررسی کن."}
          </p>
        </div>

        <Link href="/shop" className="text-sm underline underline-offset-4">
          ادامه خرید
        </Link>
      </div>

      {actionError && (
        <p role="alert" className="alert alert-error mb-5">
          {actionError}
        </p>
      )}

      {items.length === 0 ? (
        <div className="card px-5 py-16 text-center">
          <h2 className="text-lg font-bold">سبد خرید خالی است</h2>

          <p className="mt-2 text-sm text-gray-500">
            هنوز محصولی به سبد خرید اضافه نکرده‌ای.
          </p>

          <Link href="/shop" className="btn btn-primary mt-6">
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {items.map((item) => {
              const busy = busyId === item.product.id;
              const overStock = item.quantity > item.product.stock;

              return (
                <article
                  key={item.product.id}
                  aria-busy={busy}
                  className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <Link
                      href={`/shop/${item.product.id}`}
                      aria-label={item.product.name}
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50"
                    >
                      <ProductImage
                        src={item.product.image}
                        alt={item.product.name}
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </Link>

                    <div className="min-w-0">
                      <Link
                        href={`/shop/${item.product.id}`}
                        className="line-clamp-2 text-sm font-semibold hover:underline"
                      >
                        {item.product.name}
                      </Link>

                      <p className="mt-2 text-sm text-gray-500">
                        {formatToman(item.product.price)}
                      </p>

                      {(!item.product.inStock || overStock) && (
                        <p className="mt-1 text-xs text-red-600">
                          {item.product.inStock
                            ? `موجودی فقط ${formatNumber(item.product.stock)} عدد است.`
                            : "این محصول ناموجود شده است."}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => void deleteItem(item.product.id)}
                        disabled={busy}
                        className="mt-3 text-xs text-red-600 underline underline-offset-4 disabled:opacity-50"
                      >
                        حذف محصول
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                      <button
                        type="button"
                        disabled={busy || item.quantity >= item.product.stock}
                        onClick={() =>
                          void changeQuantity(item.product.id, item.quantity + 1)
                        }
                        className="h-10 w-10 transition hover:bg-gray-100 disabled:opacity-30"
                        aria-label="افزایش تعداد"
                      >
                        +
                      </button>

                      <span
                        aria-live="polite"
                        className="min-w-10 text-center text-sm"
                      >
                        {formatNumber(item.quantity)}
                      </span>

                      <button
                        type="button"
                        disabled={busy || item.quantity <= 1}
                        onClick={() =>
                          void changeQuantity(item.product.id, item.quantity - 1)
                        }
                        className="h-10 w-10 transition hover:bg-gray-100 disabled:opacity-30"
                        aria-label="کاهش تعداد"
                      >
                        −
                      </button>
                    </div>

                    <strong className="whitespace-nowrap text-sm">
                      {formatToman(item.subtotal)}
                    </strong>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="card space-y-5 border-black p-5 lg:sticky lg:top-24">
            <h2 className="text-base font-bold">خلاصه سفارش</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">تعداد محصولات</span>
                <strong>{formatNumber(cart?.totalItems ?? 0)}</strong>
              </div>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-gray-500">مبلغ کل</span>
                <strong className="text-lg">
                  {formatToman(cart?.totalPrice ?? 0)}
                </strong>
              </div>
            </div>

            {hasStockProblem && (
              <p className="alert alert-error text-xs">
                موجودی بعضی محصولات تغییر کرده است. قبل از ثبت سفارش، تعداد
                آن‌ها را اصلاح کن.
              </p>
            )}

            <Link href="/checkout" className="btn btn-primary w-full py-4">
              ادامه و ثبت سفارش
            </Link>

            <button
              type="button"
              onClick={() => void emptyCart()}
              disabled={clearing}
              className="btn btn-outline w-full"
            >
              {clearing ? "در حال انجام..." : "خالی کردن سبد"}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default function CartPage() {
  return (
    <RequireAuth>
      <CartContent />
    </RequireAuth>
  );
}
