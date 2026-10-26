
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/types/shop";
import { addToCart, getImageUrl } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

const tomanFormatter = new Intl.NumberFormat("fa-IR");

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const imageUrl = getImageUrl(product.image);
  const isAvailable = product.inStock && product.stock > 0;

  async function handleAddToCart() {
    if (!isAvailable || adding) return;

    setAdding(true);
    setMessage("");
    setIsError(false);

    try {
      await addToCart(product.id, 1);
      setMessage("به سبد اضافه شد.");
    } catch (err) {
      if (err instanceof Error && err.message === "LOGIN_REQUIRED") {
        router.push("/login");
        return;
      }

      setIsError(true);
      setMessage(
        err instanceof Error
          ? err.message
          : "افزودن به سبد خرید ناموفق بود."
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-black bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/shop/${product.id}`}
        aria-label={`مشاهده ${product.name}`}
        className="relative block aspect-square overflow-hidden bg-gray-50"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105 sm:p-5 ${
              isAvailable ? "" : "opacity-50 grayscale"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-sm text-gray-400">
            تصویر موجود نیست
          </div>
        )}

        {!isAvailable && (
          <span className="absolute right-2 top-2 rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white sm:right-3 sm:top-3">
            ناموجود
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="mb-2 line-clamp-1 text-xs text-gray-500">
          {product.category.name}
        </p>

        <Link
          href={`/shop/${product.id}`}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <h3 className="line-clamp-2 min-h-12 text-sm font-medium leading-6 text-gray-900 transition hover:text-gray-500">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {isAvailable ? (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              aria-label="افزودن به سبد خرید"
              title="افزودن به سبد خرید"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-60"
            >
              {adding ? (
                <span className="text-xs">...</span>
              ) : (
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
              )}
            </button>
          ) : (
            <span className="text-xs text-gray-400">ناموجود</span>
          )}

          {isAvailable && (
            <div className="flex flex-wrap items-baseline justify-end gap-x-1">
              <span className="text-base font-bold text-black sm:text-lg">
                {tomanFormatter.format(product.price)}
              </span>
              <span className="text-xs text-gray-500">تومان</span>
            </div>
          )}
        </div>

        {message && (
          <p
            role={isError ? "alert" : "status"}
            className={`mt-2 text-xs leading-5 ${
              isError ? "text-red-600" : "text-gray-600"
            }`}
          >
            {message}

            {!isError && (
              <>
                {" "}
                <Link
                  href="/cart"
                  className="font-semibold underline underline-offset-2"
                >
                  مشاهده سبد
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </article>
  );
}
