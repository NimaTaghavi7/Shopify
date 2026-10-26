"use client";

import { useEffect, useState } from "react";
import CategoryList from "@/components/shop/category-list";
import Pagination from "@/components/shop/pagination";
import ProductCard from "@/components/shop/product-card";
import ProductFilters from "@/components/shop/product-filters";
import { getCategories, getProducts } from "@/lib/api";
import "./price-range.css";
import type {
  Category,
  Product,
  ProductFilters as ProductFiltersType,
} from "@/types/shop";

const initialFilters: ProductFiltersType = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

const PRODUCTS_PER_PAGE = 8;
const PRICE_PAGE_SIZE = 100;

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFiltersType>(initialFilters);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [priceBounds, setPriceBounds] = useState<{
    min: number;
    max: number;
  } | null>(null);

  const [priceBoundsError, setPriceBoundsError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);
      setCategoryError("");

      try {
        const response = await getCategories();

        if (!cancelled) {
          setCategories(response.data);
        }
      } catch {
        if (!cancelled) {
          setCategoryError("دریافت دسته‌بندی‌ها ناموفق بود.");
        }
      } finally {
        if (!cancelled) {
          setLoadingCategories(false);
        }
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    let cancelled = false;

    async function loadPriceBounds() {
      setPriceBoundsError(false);
      setPriceBounds(null);

      try {
        const firstResponse = await getProducts({
          page: 1,
          limit: PRICE_PAGE_SIZE,
          sort: "newest",
        });

        const allProducts = [...firstResponse.data];
        const pages = Math.max(1, firstResponse.totalPages);

        for (let currentPage = 2; currentPage <= pages; currentPage++) {
          if (cancelled) return;

          const response = await getProducts({
            page: currentPage,
            limit: PRICE_PAGE_SIZE,
            sort: "newest",
          });

          allProducts.push(...response.data);
        }

        if (cancelled) return;

        const prices = allProducts
          .map((product) => Number(product.price))
          .filter((price) => Number.isFinite(price) && price >= 0);

        if (prices.length === 0) {
          setPriceBoundsError(true);
          return;
        }

        setPriceBounds({
          min: Math.min(...prices),
          max: Math.max(...prices),
        });
      } catch {
        if (!cancelled) {
          setPriceBoundsError(true);
        }
      }
    }

    void loadPriceBounds();

    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      const minPrice =
        filters.minPrice === "" ? undefined : Number(filters.minPrice);

      const maxPrice =
        filters.maxPrice === "" ? undefined : Number(filters.maxPrice);

      if (
        (minPrice !== undefined &&
          (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0))
      ) {
        setError("لطفاً قیمت معتبر و غیرمنفی وارد کنید.");
        setLoadingProducts(false);
        return;
      }

      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        setError("حداقل قیمت نمی‌تواند بیشتر از حداکثر قیمت باشد.");
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      setError("");

      try {
        const response = await getProducts({
          search: debouncedSearch,
          category: filters.category || undefined,
          minPrice,
          maxPrice,
          sort: filters.sort,
          page,
          limit: PRODUCTS_PER_PAGE,
        });

        if (cancelled) return;

        setProducts(response.data);
        setTotalProducts(response.total);
        setTotalPages(Math.max(1, response.totalPages));
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
          setError(
            "دریافت محصولات ناموفق بود. اتصال اینترنت را بررسی و دوباره تلاش کنید.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    debouncedSearch,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
    page,
    retry,
  ]);

  function handleFiltersChange(nextFilters: ProductFiltersType) {
    setFilters(nextFilters);

    if (
      nextFilters.category !== filters.category ||
      nextFilters.minPrice !== filters.minPrice ||
      nextFilters.maxPrice !== filters.maxPrice ||
      nextFilters.sort !== filters.sort
    ) {
      setPage(1);
    }
  }

  function handleReset() {
    setFilters(initialFilters);
    setDebouncedSearch("");
    setPage(1);
  }

  function handleCategorySelect(category: string) {
    setFilters((current) => ({ ...current, category }));
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main
      dir="rtl"
      className="mx-auto min-h-screen w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8"
    >
      <header className="mb-7 border-b border-black pb-5">
        <div className="mb-6 flex items-center justify-between gap-4">
          <a
            href="/shop"
            className="text-2xl font-black tracking-tight text-black sm:text-3xl"
          >
            SHOPIFY<span className="text-gray-400">.</span>
          </a>

          <span className="hidden text-sm text-gray-500 sm:inline">
            خریدی ساده، انتخابی بهتر
          </span>
        </div>

        <h1 className="text-2xl font-bold text-black sm:text-3xl">
          همهٔ محصولات
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          محصول موردنظرت را جستجو کن و از میان دسته‌بندی‌ها انتخاب کن.
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-black bg-white px-4 py-3 focus-within:ring-1 focus-within:ring-black">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5 shrink-0 text-gray-500"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>

          <input
            type="search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="جستجو در محصولات..."
            aria-label="جستجو در محصولات"
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-6 rounded-2xl border border-black bg-white p-4 sm:p-5">
          {loadingCategories ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-28 rounded bg-gray-200" />
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-9 rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : categoryError ? (
            <div role="alert" className="space-y-3">
              <p className="text-sm text-gray-600">{categoryError}</p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="text-sm font-semibold underline underline-offset-4"
              >
                تلاش مجدد
              </button>
            </div>
          ) : (
            <CategoryList
              categories={categories}
              selectedCategory={filters.category}
              onSelect={handleCategorySelect}
            />
          )}

          <div className="border-t border-black pt-5">
            {priceBounds ? (
              <ProductFilters
                filters={filters}
                onChange={handleFiltersChange}
                onReset={handleReset}
                minProductPrice={priceBounds.min}
                maxProductPrice={priceBounds.max}
              />
            ) : priceBoundsError ? (
              <div role="alert" className="space-y-2">
                <p className="text-sm text-gray-600">
                  دریافت بازه قیمت ناموفق بود.
                </p>
                <button
                  type="button"
                  onClick={() => setRetry((value) => value + 1)}
                  className="text-sm font-semibold underline underline-offset-4"
                >
                  تلاش مجدد
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                در حال دریافت بازه قیمت محصولات...
              </p>
            )}
          </div>
        </aside>

        <section aria-label="فهرست محصولات" className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-black">محصولات</h2>
              {!loadingProducts && !error && (
                <p className="mt-1 text-sm text-gray-600">
                  {totalProducts.toLocaleString("fa-IR")} محصول
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="product-sort"
                className="whitespace-nowrap text-sm font-semibold text-black"
              >
                مرتب‌سازی:
              </label>

              <div className="relative">
                <select
                  id="product-sort"
                  value={filters.sort}
                  onChange={(event) => {
                    setFilters((current) => ({
                      ...current,
                      sort: event.target.value as ProductFiltersType["sort"],
                    }));
                    setPage(1);
                  }}
                  className="min-w-36 appearance-none rounded-xl border border-black bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-black outline-none transition focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <option value="newest">جدیدترین</option>
                  <option value="price">ارزان‌ترین</option>
                  <option value="-price">گران‌ترین</option>
                </select>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m5 7.5 5 5 5-5" />
                </svg>
              </div>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-black px-5 py-12 text-center"
            >
              <p className="mb-4 text-sm leading-6 text-gray-700">{error}</p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                تلاش مجدد
              </button>
            </div>
          ) : loadingProducts ? (
            <div
              aria-label="در حال بارگذاری محصولات"
              aria-busy="true"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-black"
                >
                  <div className="aspect-square animate-pulse bg-gray-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-black px-5 py-12 text-center">
              <p className="text-lg font-semibold text-black">
                محصولی پیدا نشد
              </p>
              <p className="mt-2 text-sm text-gray-500">
                عبارت جستجو یا فیلترهای انتخاب‌شده را تغییر بده.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-5 rounded-lg border border-black px-5 py-2.5 text-sm font-medium text-black transition hover:bg-black hover:text-white"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
