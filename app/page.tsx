"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import type { Product } from "@/types/shop";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(false);

        const firstPage = await getProducts({
          page: 1,
          limit: 100,
        });

        let allProducts = [...firstPage.data];

        for (let page = 2; page <= firstPage.totalPages; page++) {
          const response = await getProducts({
            page,
            limit: 100,
          });

          allProducts = [...allProducts, ...response.data];
        }

        if (!cancelled) {
          setProducts(allProducts);
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

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  function scrollCarousel(direction: "next" | "prev") {
    const carousel = document.getElementById("home-products");

    if (!carousel) return;

    carousel.scrollBy({
      left:
        direction === "next"
          ? -carousel.clientWidth * 0.8
          : carousel.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-hidden bg-white text-black"
    >
      <section className="relative flex min-h-[65vh] flex-col items-center justify-center px-5 py-20 text-center sm:min-h-[70vh] sm:py-28">
        <Link
          href="/"
          className="text-5xl font-black tracking-tight sm:text-7xl"
        >
          SHOPIFY<span className="text-gray-400"></span>
        </Link>

        <h1 className="mt-8 max-w-3xl text-3xl font-extrabold leading-relaxed tracking-tight sm:text-5xl sm:leading-[1.6]">
          انتخاب بهتر،
          <span className="text-gray-400"> خرید ساده‌تر.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-8 text-gray-500 sm:text-base sm:leading-9">
          برای پیدا کردن چیزی که نیاز داری، لازم نیست بین انتخاب‌های پیچیده
          سردرگم بشی. محصولات فروشگاه رو ببین، گزینه‌ها رو بررسی کن و انتخابت رو
          متناسب با نیازت انجام بده.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500 sm:text-sm">
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

        <Link
          href="/shop"
          className="mt-9 inline-flex items-center gap-3 rounded-xl bg-black px-8 py-4 text-sm font-medium text-white transition duration-200 hover:bg-gray-800 active:scale-[0.98]"
        >
          ورود به فروشگاه
          <span aria-hidden="true">←</span>
        </Link>

        <p className="mt-4 text-xs text-gray-400">
          انتخابت رو از اینجا شروع کن.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">محصولات فروشگاه</h2>

            <p className="mt-2 text-sm text-gray-500">
              نگاهی به محصولات موجود در فروشگاه
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
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-64 min-w-[220px] flex-1 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-gray-200 px-5 py-10 text-center">
            <p className="text-sm text-gray-600">
              دریافت محصولات با مشکل مواجه شد.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
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
            id="home-products"
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4"
          >
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group w-[220px] shrink-0 snap-start sm:w-[250px]"
              >
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-5 transition-colors group-hover:border-gray-300">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="px-1 pt-4">
                  <p className="line-clamp-2 min-h-12 text-sm font-medium leading-6">
                    {product.name}
                  </p>

                  <p className="mt-3 text-sm font-bold">
                    {new Intl.NumberFormat("fa-IR").format(product.price)}
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
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-black px-6 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
          >
            مشاهده همه محصولات
            <span aria-hidden="true">←</span>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Shopify © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
