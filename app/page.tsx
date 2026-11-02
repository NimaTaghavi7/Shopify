"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/shop/product-image";
import { getCategoriesCached, getProducts } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Category, Product } from "@/types/shop";

const HOME_PRODUCTS_LIMIT = 12;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError(false);

      try {
        const response = await getProducts({
          page: 1,
          limit: HOME_PRODUCTS_LIMIT,
          sort: "newest",
        });

        if (!cancelled) {
          setProducts(response.data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    let cancelled = false;

    getCategoriesCached()
      .then((response) => {
        if (!cancelled && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      })
      .catch(() => {
        // بخش دسته‌بندی‌ها اختیاری است؛ نبودنش صفحه را خراب نمی‌کند.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function scrollCarousel(direction: "next" | "prev") {
    const carousel = carouselRef.current;

    if (!carousel) return;

    // در صفحهٔ راست‌چین، پیمایش به سمت «بعدی» یعنی scrollLeft منفی.
    carousel.scrollBy({
      left:
        direction === "next"
          ? -carousel.clientWidth * 0.8
          : carousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  return (
    <main dir="rtl" className="bg-white text-black">
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center px-5 py-16 text-center sm:min-h-[65vh] sm:py-24">
        <p className="text-5xl font-black tracking-tight sm:text-7xl">
          {siteConfig.name}
        </p>

        <h1 className="mt-8 max-w-3xl text-3xl font-extrabold leading-relaxed tracking-tight sm:text-5xl sm:leading-[1.6]">
          انتخاب بهتر،
          <span className="text-gray-400"> خرید ساده‌تر.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-8 text-gray-500 sm:text-base sm:leading-9">
          برای پیدا کردن چیزی که نیاز داری، لازم نیست بین انتخاب‌های پیچیده
          سردرگم بشی. محصولات فروشگاه رو ببین، گزینه‌ها رو بررسی کن و انتخابت رو
          متناسب با نیازت انجام بده.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <span className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 sm:text-sm">
            تجربه خرید ساده
          </span>

          <span className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 sm:text-sm">
            بررسی محصولات
          </span>

          <span className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 sm:text-sm">
            انتخاب متناسب با نیازت
          </span>
        </div>

        <Link href="/shop" className="btn btn-primary mt-9 gap-3 px-8 py-4">
          ورود به فروشگاه
          <span aria-hidden="true">←</span>
        </Link>
      </section>

      {categories.length > 0 && (
        <section
          aria-label="دسته‌بندی محصولات"
          className="mx-auto max-w-7xl px-5 pb-14 sm:px-8"
        >
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            دسته‌بندی‌ها
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${encodeURIComponent(category.slug)}`}
                className="card flex items-center justify-between gap-3 px-4 py-4 text-sm font-medium transition hover:border-black"
              >
                <span className="line-clamp-1">{category.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatNumber(category.productCount)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">جدیدترین محصولات</h2>

            <p className="mt-2 text-sm text-gray-500">
              نگاهی به تازه‌ترین محصولات فروشگاه
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCarousel("prev")}
              aria-label="محصولات قبلی"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-lg transition hover:border-black"
            >
              →
            </button>

            <button
              type="button"
              onClick={() => scrollCarousel("next")}
              aria-label="محصولات بعدی"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-lg transition hover:border-black"
            >
              ←
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="h-64 min-w-55 flex-1 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="card px-5 py-10 text-center">
            <p className="text-sm text-gray-600">
              دریافت محصولات با مشکل مواجه شد.
            </p>

            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
              className="mt-4 text-sm font-semibold underline underline-offset-4"
            >
              تلاش مجدد
            </button>
          </div>
        ) : products.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 py-12 text-center text-sm text-gray-500">
            هنوز محصولی برای نمایش وجود ندارد.
          </p>
        ) : (
          <div
            ref={carouselRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4"
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group w-55 shrink-0 snap-start sm:w-62.5"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 transition-colors group-hover:border-gray-300">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    sizes="(max-width: 640px) 220px, 250px"
                    className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="px-1 pt-4">
                  <p className="line-clamp-2 min-h-12 text-sm font-medium leading-6">
                    {product.name}
                  </p>

                  <p className="mt-3 text-sm font-bold">
                    {formatNumber(product.price)}
                    <span className="mr-1 text-xs font-normal text-gray-500">
                      تومان
                    </span>
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    {product.inStock ? "موجود" : "ناموجود"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Link href="/shop" className="btn btn-outline gap-2 border-black px-6">
            مشاهده همه محصولات
            <span aria-hidden="true">←</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
