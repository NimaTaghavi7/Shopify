"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CategoryList from "@/components/shop/category-list";
import Pagination from "@/components/shop/pagination";
import ProductCard from "@/components/shop/product-card";
import ProductFilters, {
  type PriceBounds,
} from "@/components/shop/product-filters";
import { getCategoriesCached, getProducts } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import ShopLoading from "./loading";
import "./price-range.css";
import type {
  Category,
  Product,
  ProductFilters as ProductFiltersType,
} from "@/types/shop";

const PRODUCTS_PER_PAGE = 8;
const SEARCH_DEBOUNCE = 350;

type SortValue = ProductFiltersType["sort"];

function parseSort(value: string | null): SortValue {
  return value === "price" || value === "-price" ? value : "newest";
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function parsePrice(value: string): number | undefined {
  if (value === "") return undefined;

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

interface QueryOptions {
  /** به‌جای افزودن به تاریخچه، آدرس فعلی را جایگزین می‌کند (برای تایپ و اسلایدر). */
  replace?: boolean;
  /** پارامتر page را حفظ می‌کند (فقط هنگام تغییر صفحه). */
  keepPage?: boolean;
}

/**
 * وضعیت فروشگاه (جستجو، دسته‌بندی، قیمت، مرتب‌سازی، صفحه) در آدرس نگه داشته می‌شود؛
 * بنابراین Refresh، دکمهٔ برگشت و لینک‌های `/shop?category=...` درست کار می‌کنند.
 */
function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlSearch = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const sort = parseSort(searchParams.get("sort"));
  const inStock = searchParams.get("inStock") === "1";
  const page = parsePage(searchParams.get("page"));

  const filters = useMemo<ProductFiltersType>(
    () => ({ search: urlSearch, category, minPrice, maxPrice, sort, inStock }),
    [urlSearch, category, minPrice, maxPrice, sort, inStock],
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const [priceBounds, setPriceBounds] = useState<PriceBounds | null>(null);
  const [priceBoundsError, setPriceBoundsError] = useState(false);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState(urlSearch);
  const pushedSearch = useRef(urlSearch);

  const updateQuery = useCallback(
    (patch: Record<string, string>, options: QueryOptions = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      Object.entries(patch).forEach(([key, value]) => {
        if (value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });

      if (!options.keepPage) next.delete("page");

      const query = next.toString();
      const target = query ? `${pathname}?${query}` : pathname;

      if (options.replace) {
        router.replace(target, { scroll: false });
      } else {
        router.push(target, { scroll: false });
      }
    },
    [pathname, router, searchParams],
  );

  // تغییر جستجو از بیرون (جستجوی هدر، برگشت مرورگر، پاک کردن فیلترها) → کادر جستجو.
  useEffect(() => {
    if (urlSearch === pushedSearch.current) return;

    pushedSearch.current = urlSearch;
    setSearchText(urlSearch);
  }, [urlSearch]);

  // تایپ کاربر → آدرس (با تأخیر).
  useEffect(() => {
    const value = searchText.trim();

    if (value === urlSearch) return;

    const timer = setTimeout(() => {
      pushedSearch.current = value;
      updateQuery({ search: value }, { replace: true });
    }, SEARCH_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [searchText, urlSearch, updateQuery]);

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoadingCategories(true);
      setCategoryError("");

      try {
        const response = await getCategoriesCached();

        if (!cancelled) {
          setCategories(Array.isArray(response.data) ? response.data : []);
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

  // بازهٔ قیمت با دو درخواست سبک (ارزان‌ترین و گران‌ترین محصول)، نه دریافت همهٔ محصولات.
  useEffect(() => {
    let cancelled = false;

    async function loadPriceBounds() {
      setPriceBoundsError(false);

      try {
        const [cheapest, priciest] = await Promise.all([
          getProducts({ sort: "price", limit: 1 }),
          getProducts({ sort: "-price", limit: 1 }),
        ]);

        if (cancelled) return;

        const min = Number(cheapest.data[0]?.price);
        const max = Number(priciest.data[0]?.price);

        setPriceBounds(
          Number.isFinite(min) && Number.isFinite(max)
            ? { min: Math.min(min, max), max: Math.max(min, max) }
            : null,
        );
      } catch {
        if (!cancelled) {
          setPriceBounds(null);
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
      const min = parsePrice(minPrice);
      const max = parsePrice(maxPrice);

      if (min !== undefined && max !== undefined && min > max) {
        setProducts([]);
        setTotalProducts(0);
        setError("حداقل قیمت نمی‌تواند بیشتر از حداکثر قیمت باشد.");
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);
      setError("");

      try {
        const response = await getProducts({
          search: urlSearch.trim(),
          category: category || undefined,
          minPrice: min,
          maxPrice: max,
          sort,
          inStock: inStock ? true : undefined,
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
  }, [urlSearch, category, minPrice, maxPrice, sort, inStock, page, retry]);

  const handleFiltersChange = useCallback(
    (next: ProductFiltersType) => {
      updateQuery(
        {
          minPrice: next.minPrice,
          maxPrice: next.maxPrice,
          inStock: next.inStock ? "1" : "",
        },
        { replace: true },
      );
    },
    [updateQuery],
  );

  function handleReset() {
    router.push(pathname, { scroll: false });
  }

  function handleCategorySelect(slug: string) {
    updateQuery({ category: slug });
    setFiltersOpen(false);
  }

  function handlePageChange(nextPage: number) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;

    updateQuery(
      { page: nextPage === 1 ? "" : String(nextPage) },
      { keepPage: true },
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const selectedCategory = categories.find((item) => item.slug === category);

  const activeFilterCount = [
    category !== "",
    minPrice !== "" || maxPrice !== "",
    inStock,
  ].filter(Boolean).length;

  return (
    <main dir="rtl" className="page">
      <header className="mb-7 border-b border-gray-200 pb-5">
        <h1 className="page-title">
          {selectedCategory ? selectedCategory.name : "همه محصولات"}
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          محصول موردنظرت را جستجو کن و از میان دسته‌بندی‌ها انتخاب کن.
        </p>

        <div className="mt-5 flex items-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
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
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="جستجو در محصولات..."
            aria-label="جستجو در محصولات"
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-gray-400"
          />
        </div>
      </header>

      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
        aria-controls="shop-filters"
        className="btn btn-outline mb-4 w-full lg:hidden"
      >
        {filtersOpen ? "بستن فیلترها" : "دسته‌بندی و فیلترها"}
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">
            {formatNumber(activeFilterCount)}
          </span>
        )}
      </button>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside
          id="shop-filters"
          className={`card space-y-6 p-4 sm:p-5 lg:sticky lg:top-24 lg:block ${
            filtersOpen ? "block" : "hidden"
          }`}
        >
          {loadingCategories ? (
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-28 rounded bg-gray-200" />
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-9 rounded-lg bg-gray-100" />
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
              selectedCategory={category}
              onSelect={handleCategorySelect}
            />
          )}

          <div className="border-t border-gray-200 pt-5">
            <ProductFilters
              filters={filters}
              onChange={handleFiltersChange}
              onReset={handleReset}
              priceBounds={priceBounds}
              priceBoundsError={priceBoundsError}
              onRetryPriceBounds={() => setRetry((value) => value + 1)}
            />
          </div>
        </aside>

        <section aria-label="فهرست محصولات" className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-black">محصولات</h2>

              {!loadingProducts && !error && (
                <p className="mt-1 text-sm text-gray-600">
                  {formatNumber(totalProducts)} محصول
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
                  value={sort}
                  onChange={(event) =>
                    updateQuery({
                      sort:
                        event.target.value === "newest"
                          ? ""
                          : event.target.value,
                    })
                  }
                  className="min-w-36 appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm font-medium text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black focus:ring-offset-2"
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
              className="card px-5 py-12 text-center"
            >
              <p className="mb-4 text-sm leading-6 text-gray-700">{error}</p>
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
                className="btn btn-primary"
              >
                تلاش مجدد
              </button>
            </div>
          ) : loadingProducts ? (
            <div
              aria-label="در حال بارگذاری محصولات"
              aria-busy="true"
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: PRODUCTS_PER_PAGE }, (_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-gray-200"
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
            <div className="card px-5 py-12 text-center">
              <p className="text-lg font-semibold text-black">
                محصولی پیدا نشد
              </p>
              <p className="mt-2 text-sm text-gray-500">
                عبارت جستجو یا فیلترهای انتخاب‌شده را تغییر بده.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline mt-5"
              >
                پاک کردن فیلترها
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
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

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopContent />
    </Suspense>
  );
}
