"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { addToCart, getImageUrl, getProduct } from "@/lib/api";
import type { Product } from "@/types/shop";

const priceFormatter = new Intl.NumberFormat("fa-IR");

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const result = await getProduct(params.id);

        if (!cancelled) {
          setProduct(result);
        }
      } catch {
        if (!cancelled) {
          setError("دریافت اطلاعات محصول ناموفق بود. دوباره تلاش کن.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.id) loadProduct();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const isAvailable = Boolean(product?.inStock && product.stock > 0);
  const maxQuantity = Math.min(product?.stock ?? 1, 10);

  async function handleAddToCart() {
    if (!product || !isAvailable) return;

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      await addToCart(product.id, quantity);
      setSuccess("محصول با موفقیت به سبد خرید اضافه شد.");
    } catch (err) {
      if (err instanceof Error && err.message === "LOGIN_REQUIRED") {
        router.push("/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "افزودن محصول به سبد خرید ناموفق بود."
      );
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-white px-5 py-12">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-4 w-32 rounded bg-gray-100" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-gray-100" />
            <div className="space-y-5 py-4">
              <div className="h-8 w-3/4 rounded bg-gray-100" />
              <div className="h-5 w-1/2 rounded bg-gray-100" />
              <div className="h-24 rounded bg-gray-100" />
              <div className="h-12 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !product) {
    return (
      <main
        dir="rtl"
        className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center"
      >
        <p className="text-sm text-gray-600">{error}</p>
        <Link
          href="/shop"
          className="mt-5 rounded-xl bg-black px-6 py-3 text-sm text-white"
        >
          بازگشت به فروشگاه
        </Link>
      </main>
    );
  }

  if (!product) return null;

  const imageUrl = getImageUrl(product.image);

  return (
    <main dir="rtl" className="min-h-screen bg-white px-5 py-8 text-black sm:py-12">
      <div className="mx-auto max-w-6xl">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="transition hover:text-black">
            خانه
          </Link>
          <span>/</span>
          <Link href="/shop" className="transition hover:text-black">
            فروشگاه
          </Link>
          <span>/</span>
          <span className="max-w-56 truncate text-black">{product.name}</span>
        </nav>

        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
          {/* تصویر محصول */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className={`aspect-square h-full w-full object-contain p-6 sm:p-10 ${
                  isAvailable ? "" : "grayscale opacity-60"
                }`}
              />
            ) : (
              <div className="flex aspect-square items-center justify-center text-sm text-gray-400">
                تصویر محصول موجود نیست
              </div>
            )}
          </div>

          {/* مشخصات و خرید */}
          <section className="flex flex-col">
            <p className="mb-3 text-sm text-gray-500">
              {product.category?.name}
            </p>

            <h1 className="text-2xl font-extrabold leading-relaxed sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  isAvailable
                    ? "bg-gray-100 text-black"
                    : "bg-black text-white"
                }`}
              >
                {isAvailable ? "موجود در انبار" : "ناموجود"}
              </span>

              {isAvailable && (
                <span className="text-xs text-gray-500">
                  {priceFormatter.format(product.stock)} عدد موجود
                </span>
              )}
            </div>

            <div className="mt-7 border-y border-gray-200 py-6">
              {isAvailable ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold">
                    {priceFormatter.format(product.price)}
                  </span>
                  <span className="text-sm text-gray-500">تومان</span>
                </div>
              ) : (
                <p className="text-base font-semibold text-gray-500">
                  در حال حاضر موجود نیست
                </p>
              )}
            </div>

            <div className="py-6">
              <h2 className="mb-3 text-base font-bold">توضیحات محصول</h2>
              <p className="whitespace-pre-line text-sm leading-8 text-gray-600">
                {product.description || "توضیحاتی برای این محصول ثبت نشده است."}
              </p>
            </div>

            {isAvailable && (
              <div className="mt-2">
                <label
                  htmlFor="product-quantity"
                  className="mb-3 block text-sm font-semibold"
                >
                  تعداد
                </label>

                <div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-300">
                  <button
                    type="button"
                    aria-label="افزایش تعداد"
                    disabled={quantity >= maxQuantity}
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(current + 1, maxQuantity)
                      )
                    }
                    className="h-11 w-11 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    +
                  </button>

                  <input
                    id="product-quantity"
                    type="number"
                    min={1}
                    max={maxQuantity}
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(event.target.value);

                      if (!Number.isFinite(value)) return;

                      setQuantity(
                        Math.max(1, Math.min(maxQuantity, Math.floor(value)))
                      );
                    }}
                    className="h-11 w-14 border-x border-gray-200 text-center text-sm outline-none"
                  />

                  <button
                    type="button"
                    aria-label="کاهش تعداد"
                    disabled={quantity <= 1}
                    onClick={() =>
                      setQuantity((current) => Math.max(1, current - 1))
                    }
                    className="h-11 w-11 text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    −
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-sm leading-6 text-black">{success}</p>
                <Link
                  href="/cart"
                  className="mt-3 inline-block text-sm font-semibold underline underline-offset-4"
                >
                  مشاهده سبد خرید
                </Link>
              </div>
            )}

            <button
              type="button"
              disabled={!isAvailable || adding}
              onClick={handleAddToCart}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {adding
                ? "در حال افزودن..."
                : isAvailable
                  ? "افزودن به سبد خرید"
                  : "محصول ناموجود است"}
            </button>

            <Link
              href="/shop"
              className="mt-3 flex w-full items-center justify-center rounded-xl border border-gray-300 px-6 py-3.5 text-sm font-medium transition hover:border-black"
            >
              بازگشت به فروشگاه
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
