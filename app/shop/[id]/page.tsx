"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/shop/product-card";
import ProductImage from "@/components/shop/product-image";
import { useCart } from "@/components/providers/cart-provider";
import {
  getErrorMessage,
  getErrorStatus,
  getProduct,
  getProducts,
} from "@/lib/api";
import { currentPathWithQuery, loginHref } from "@/lib/auth-redirect";
import { formatNumber } from "@/lib/format";
import type { Product } from "@/types/shop";

const MAX_QUANTITY_PER_ADD = 10;
const RELATED_LIMIT = 4;

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setNotFound(false);
      setLoadError("");

      try {
        const result = await getProduct(params.id);

        if (!cancelled) {
          setProduct(result);
          setQuantity(1);
          setError("");
          setSuccess("");
        }
      } catch (err) {
        if (!cancelled) {
          setProduct(null);

          if (getErrorStatus(err) === 404) {
            setNotFound(true);
          } else {
            setLoadError(
              "دریافت اطلاعات محصول ناموفق بود. اتصال اینترنت را بررسی کن و دوباره تلاش کن.",
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      void loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id, retry]);

  // محصولات مرتبط: فقط از همان دسته‌بندی و از دادهٔ واقعی API؛ در صورت خطا بخش نمایش داده نمی‌شود.
  const categorySlug = product?.category?.slug;
  const productId = product?.id;

  useEffect(() => {
    if (!categorySlug || productId === undefined) return;

    let cancelled = false;

    getProducts({ category: categorySlug, limit: RELATED_LIMIT + 1 })
      .then((response) => {
        if (!cancelled) {
          setRelated(
            response.data
              .filter((item) => item.id !== productId)
              .slice(0, RELATED_LIMIT),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, productId]);

  const isAvailable = Boolean(product?.inStock && product.stock > 0);
  const maxQuantity = Math.max(
    1,
    Math.min(product?.stock ?? 1, MAX_QUANTITY_PER_ADD),
  );

  async function handleAddToCart() {
    if (!product || !isAvailable || adding) return;

    setAdding(true);
    setError("");
    setSuccess("");

    try {
      await addItem(product.id, quantity);
      setSuccess("محصول با موفقیت به سبد خرید اضافه شد.");
    } catch (err) {
      if (getErrorStatus(err) === 401) {
        router.push(loginHref(currentPathWithQuery()));
        return;
      }

      setError(getErrorMessage(err, "افزودن محصول به سبد خرید ناموفق بود."));
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <main dir="rtl" className="page-md" aria-busy="true">
        <div className="animate-pulse">
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

  if (notFound || loadError || !product) {
    return (
      <main
        dir="rtl"
        className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center"
      >
        <h1 className="text-xl font-bold">
          {notFound ? "این محصول پیدا نشد" : "مشکلی پیش آمد"}
        </h1>

        <p role="alert" className="mt-3 text-sm leading-7 text-gray-600">
          {notFound
            ? "ممکن است محصول حذف شده باشد یا آدرس را اشتباه وارد کرده باشی."
            : loadError}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {!notFound && (
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="btn btn-primary"
            >
              تلاش مجدد
            </button>
          )}

          <Link
            href="/shop"
            className={`btn ${notFound ? "btn-primary" : "btn-outline"}`}
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="page-md text-black">
      <nav
        aria-label="مسیر صفحه"
        className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500"
      >
        <Link href="/" className="transition hover:text-black">
          خانه
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/shop" className="transition hover:text-black">
          فروشگاه
        </Link>

        {product.category?.slug && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              href={`/categories/${encodeURIComponent(product.category.slug)}`}
              className="transition hover:text-black"
            >
              {product.category.name}
            </Link>
          </>
        )}

        <span aria-hidden="true">/</span>
        <span className="max-w-56 truncate text-black">{product.name}</span>
      </nav>

      <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
          <ProductImage
            src={product.image}
            alt={product.name}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-contain p-6 sm:p-10 ${
              isAvailable ? "" : "opacity-60 grayscale"
            }`}
          />
        </div>

        <section className="flex flex-col">
          {product.category?.name && (
            <p className="mb-3 text-sm text-gray-500">{product.category.name}</p>
          )}

          <h1 className="text-2xl font-extrabold leading-relaxed sm:text-3xl">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                isAvailable ? "bg-gray-100 text-black" : "bg-black text-white"
              }`}
            >
              {isAvailable ? "موجود در انبار" : "ناموجود"}
            </span>

            {isAvailable && (
              <span className="text-xs text-gray-500">
                {formatNumber(product.stock)} عدد موجود
              </span>
            )}
          </div>

          <div className="mt-7 border-y border-gray-200 py-6">
            {isAvailable ? (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">
                  {formatNumber(product.price)}
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
                    setQuantity((current) => Math.min(current + 1, maxQuantity))
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
                      Math.max(1, Math.min(maxQuantity, Math.floor(value))),
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
            <p role="alert" className="alert alert-error mt-5">
              {error}
            </p>
          )}

          {success && (
            <div role="status" className="alert alert-success mt-5">
              <p>{success}</p>
              <Link
                href="/cart"
                className="mt-2 inline-block text-sm font-semibold underline underline-offset-4"
              >
                مشاهده سبد خرید
              </Link>
            </div>
          )}

          <button
            type="button"
            disabled={!isAvailable || adding}
            onClick={handleAddToCart}
            className="btn btn-primary mt-6 w-full py-4"
          >
            {adding
              ? "در حال افزودن..."
              : isAvailable
                ? "افزودن به سبد خرید"
                : "محصول ناموجود است"}
          </button>

          <Link href="/shop" className="btn btn-outline mt-3 w-full">
            بازگشت به فروشگاه
          </Link>
        </section>
      </div>

      {related.length > 0 && (
        <section aria-label="محصولات مرتبط" className="mt-16">
          <h2 className="mb-6 text-xl font-bold">محصولات مرتبط</h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
