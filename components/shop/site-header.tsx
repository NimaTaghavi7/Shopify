"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useCart } from "@/components/providers/cart-provider";
import { getCategoriesCached } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Category } from "@/types/shop";

type OpenMenu = "categories" | "user" | "mobile" | null;

const navLinkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-black";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 shrink-0"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path strokeLinecap="round" d="m16 16 4.5 4.5" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

export default function SiteHeader() {
  const router = useRouter();
  const { user, status, logout } = useAuth();
  const { count } = useCart();

  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;

    getCategoriesCached()
      .then((response) => {
        if (!cancelled && Array.isArray(response.data)) {
          setCategories(response.data);
        }
      })
      .catch(() => {
        // منوی دسته‌بندی اختیاری است؛ خطا نباید هدر را مختل کند.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (openMenu === null) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        headerRef.current &&
        event.target instanceof Node &&
        !headerRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  function closeMenus() {
    setOpenMenu(null);
  }

  function toggleMenu(menu: Exclude<OpenMenu, null>) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = query.trim();
    closeMenus();
    router.push(value ? `/shop?search=${encodeURIComponent(value)}` : "/shop");
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    closeMenus();
  }

  const cartLabel =
    count > 0
      ? `سبد خرید، ${formatNumber(count)} محصول`
      : "سبد خرید";

  const searchForm = (idSuffix: string) => (
    <form onSubmit={handleSearch} role="search" className="relative w-full">
      <label htmlFor={`header-search-${idSuffix}`} className="sr-only">
        جستجوی محصولات
      </label>

      <input
        id={`header-search-${idSuffix}`}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="جستجو در محصولات..."
        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
      />

      <button
        type="submit"
        aria-label="جستجو"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition hover:text-black"
      >
        <SearchIcon />
      </button>
    </form>
  );

  return (
    <header
      ref={headerRef}
      dir="rtl"
      className={`sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow ${
        scrolled ? "border-gray-200 shadow-sm" : "border-gray-100"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
        <Link
          href="/"
          onClick={closeMenus}
          className="text-xl font-black tracking-tight text-black sm:text-2xl"
        >
          {siteConfig.name}
        </Link>

        <nav
          aria-label="منوی اصلی"
          className="hidden items-center gap-1 lg:flex"
        >
          <Link href="/" className={navLinkClass}>
            خانه
          </Link>

          <Link href="/shop" className={navLinkClass}>
            فروشگاه
          </Link>

          {categories.length > 0 && (
            <div className="relative">
              <button
                type="button"
                aria-expanded={openMenu === "categories"}
                aria-haspopup="true"
                onClick={() => toggleMenu("categories")}
                className={`${navLinkClass} inline-flex items-center gap-1`}
              >
                دسته‌بندی‌ها
                <ChevronIcon open={openMenu === "categories"} />
              </button>

              {openMenu === "categories" && (
                <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${encodeURIComponent(category.slug)}`}
                      onClick={closeMenus}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-black"
                    >
                      <span>{category.name}</span>
                      <span className="text-xs text-gray-400">
                        {formatNumber(category.productCount)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="mx-auto hidden w-full max-w-md lg:block">
          {searchForm("desktop")}
        </div>

        <div className="mr-auto flex items-center gap-2 lg:mr-0">
          <Link
            href="/cart"
            aria-label={cartLabel}
            onClick={closeMenus}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-black transition hover:border-black"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l2.2 11.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.5L21 8H6"
              />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>

            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white"
              >
                {count > 99 ? "۹۹+" : formatNumber(count)}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {status === "authenticated" ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openMenu === "user"}
                  aria-haspopup="true"
                  onClick={() => toggleMenu("user")}
                  className="flex h-11 items-center gap-2 rounded-xl border border-gray-200 pl-3 pr-2 text-sm font-medium transition hover:border-black"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold uppercase text-white"
                  >
                    {user?.username.charAt(0) ?? "؟"}
                  </span>
                  <span className="max-w-28 truncate">
                    {user?.username ?? "حساب من"}
                  </span>
                  <ChevronIcon open={openMenu === "user"} />
                </button>

                {openMenu === "user" && (
                  <div className="absolute left-0 top-full z-50 mt-2 w-52 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg">
                    <Link
                      href="/account"
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-black"
                    >
                      حساب کاربری
                    </Link>

                    <Link
                      href="/orders"
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-100 hover:text-black"
                    >
                      سفارش‌های من
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="block w-full rounded-lg px-3 py-2.5 text-right text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {loggingOut ? "در حال خروج..." : "خروج از حساب"}
                    </button>
                  </div>
                )}
              </div>
            ) : status === "guest" ? (
              <>
                <Link
                  href="/login"
                  className="btn btn-outline h-11 px-4 py-0"
                >
                  ورود
                </Link>

                <Link
                  href="/register"
                  className="btn btn-primary h-11 px-4 py-0"
                >
                  ثبت‌نام
                </Link>
              </>
            ) : (
              <div className="skeleton h-11 w-28" aria-hidden="true" />
            )}
          </div>

          <button
            type="button"
            aria-label={openMenu === "mobile" ? "بستن منو" : "باز کردن منو"}
            aria-expanded={openMenu === "mobile"}
            onClick={() => toggleMenu("mobile")}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-black transition hover:border-black lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              {openMenu === "mobile" ? (
                <path d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {openMenu === "mobile" && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-gray-100 bg-white px-4 pb-6 pt-4 lg:hidden">
          {searchForm("mobile")}

          <nav aria-label="منوی موبایل" className="mt-4 space-y-1">
            <Link
              href="/"
              onClick={closeMenus}
              className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-gray-100"
            >
              خانه
            </Link>

            <Link
              href="/shop"
              onClick={closeMenus}
              className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-gray-100"
            >
              فروشگاه
            </Link>

            {status === "authenticated" && (
              <>
                <Link
                  href="/orders"
                  onClick={closeMenus}
                  className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-gray-100"
                >
                  سفارش‌های من
                </Link>

                <Link
                  href="/account"
                  onClick={closeMenus}
                  className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-gray-100"
                >
                  حساب کاربری
                  {user && (
                    <span className="mr-2 text-xs font-normal text-gray-500">
                      ({user.username})
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {categories.length > 0 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-3 px-3 text-xs font-semibold text-gray-500">
                دسته‌بندی‌ها
              </p>

              <div className="flex flex-wrap gap-2 px-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${encodeURIComponent(category.slug)}`}
                    onClick={closeMenus}
                    className="rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-700 transition hover:border-black hover:text-black"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 border-t border-gray-100 pt-5">
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn btn-danger w-full"
              >
                {loggingOut ? "در حال خروج..." : "خروج از حساب"}
              </button>
            ) : status === "guest" ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="btn btn-outline"
                >
                  ورود
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="btn btn-primary"
                >
                  ثبت‌نام
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}
