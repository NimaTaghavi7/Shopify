"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getCart } from "@/lib/api";

export default function SiteHeader() {
  const [count, setCount] = useState(0);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCount(0);
      return;
    }

    try {
      const cart = await getCart();
      setCount(Number(cart.totalItems) || 0);
    } catch {
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void refreshCart();

    window.addEventListener("shop:cart-updated", refreshCart);
    window.addEventListener("storage", refreshCart);

    return () => {
      window.removeEventListener("shop:cart-updated", refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, [refreshCart]);

  return (
    <header dir="rtl" className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="text-xl font-black tracking-tight text-black sm:text-2xl">
          SHOPIFY
        </Link>

        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link href="/shop" className="text-gray-600 transition hover:text-black">
            فروشگاه
          </Link>

          <Link href="/orders" className="hidden text-gray-600 transition hover:text-black sm:inline">
            سفارش‌های من
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-xl border border-black px-3 py-2 font-semibold text-black transition hover:bg-black hover:text-white"
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
            <span>سبد خرید</span>

            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white group-hover:bg-white group-hover:text-black">
                {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}