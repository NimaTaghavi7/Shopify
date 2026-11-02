
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  type Cart,
} from "@/lib/api";

const money = (value: number) =>
  `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const result = await getCart();
      setCart(result);
    } catch (err) {
      if (err instanceof Error && err.message === "LOGIN_REQUIRED") {
        router.push("/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "دریافت سبد خرید ناموفق بود."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCart();
  }, []);

  async function changeQuantity(productId: number, quantity: number) {
    if (quantity < 1) return;

    try {
      setBusyId(productId);
      setError("");

      const result = await updateCartItem(productId, quantity);
      setCart(result as Cart);

      window.dispatchEvent(new Event("shop:cart-updated"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تغییر تعداد ناموفق بود."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(productId: number) {
    try {
      setBusyId(productId);
      setError("");

      const result = await removeCartItem(productId);
      setCart(result as Cart);

      await loadCart();

      window.dispatchEvent(new Event("shop:cart-updated"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حذف محصول ناموفق بود."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function emptyCart() {
    if (!window.confirm("از خالی کردن سبد خرید مطمئنی؟")) return;

    try {
      setClearing(true);
      setError("");

      await clearCart();
      await loadCart();

      window.dispatchEvent(new Event("shop:cart-updated"));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "خالی کردن سبد ناموفق بود."
      );
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="mx-auto min-h-screen max-w-5xl px-5 py-12"
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-gray-100" />
          <div className="h-28 rounded-2xl bg-gray-100" />
          <div className="h-28 rounded-2xl bg-gray-100" />
        </div>
      </main>
    );
  }

  const items = cart?.items ?? [];

  return (
    <main
      dir="rtl"
      className="mx-auto min-h-screen max-w-5xl px-5 py-10 text-black"
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black pb-5">
        <div>
          <h1 className="text-2xl font-bold">سبد خرید</h1>

          <p className="mt-2 text-sm text-gray-500">
            محصولات انتخاب‌شده را بررسی کن.
          </p>
        </div>

        <Link
          href="/shop"
          className="text-sm underline underline-offset-4"
        >
          ادامه خرید
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 px-5 py-16 text-center">
          <h2 className="text-lg font-bold">
            سبد خرید خالی است
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            هنوز محصولی به سبد خرید اضافه نکرده‌ای.
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm text-white"
          >
            مشاهده محصولات
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.product.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/shop/${item.product.id}`}
                      className="line-clamp-2 text-sm font-semibold hover:underline"
                    >
                      {item.product.name}
                    </Link>

                    <p className="mt-2 text-sm text-gray-500">
                      {money(item.product.price)}
                    </p>

                    <button
                      type="button"
                      onClick={() => deleteItem(item.product.id)}
                      disabled={busyId === item.product.id}
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
                      disabled={
                        busyId === item.product.id ||
                        item.quantity <= 1
                      }
                      onClick={() =>
                        changeQuantity(
                          item.product.id,
                          item.quantity - 1
                        )
                      }
                      className="h-10 w-10 disabled:opacity-30"
                      aria-label="کاهش تعداد"
                    >
                      −
                    </button>

                    <span className="min-w-10 text-center text-sm">
                      {item.quantity.toLocaleString("fa-IR")}
                    </span>

                    <button
                      type="button"
                      disabled={
                        busyId === item.product.id ||
                        item.quantity >= item.product.stock
                      }
                      onClick={() =>
                        changeQuantity(
                          item.product.id,
                          item.quantity + 1
                        )
                      }
                      className="h-10 w-10 disabled:opacity-30"
                      aria-label="افزایش تعداد"
                    >
                      +
                    </button>
                  </div>

                  <strong className="whitespace-nowrap text-sm">
                    {money(item.subtotal)}
                  </strong>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-5 rounded-2xl border border-black p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                مبلغ کل
              </p>

              <p className="mt-2 text-2xl font-extrabold">
                {money(cart?.totalPrice ?? 0)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={emptyCart}
                disabled={clearing}
                className="rounded-xl border border-gray-300 px-5 py-3 text-sm disabled:opacity-50"
              >
                {clearing ? "در حال انجام..." : "خالی کردن سبد"}
              </button>

              <Link
                href="/checkout"
                className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white"
              >
                ادامه و ثبت سفارش
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
