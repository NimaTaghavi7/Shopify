"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = token.trim();

    if (!value) {
      setError("لطفاً توکن ورود را وارد کن.");
      return;
    }

    localStorage.setItem("token", value);
    window.dispatchEvent(new Event("shop:cart-updated"));
    router.push("/shop");
  }

  return (
    <main dir="rtl" className="flex min-h-[75vh] items-center justify-center px-5 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-gray-200 p-6 sm:p-8">
        <h1 className="text-2xl font-bold">ورود به حساب</h1>
        <p className="mt-3 text-sm leading-7 text-gray-500">
          توکن دریافتی از سیستم ورود تمرین قبلی را وارد کن تا بتوانی از سبد خرید و ثبت سفارش استفاده کنی.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <label htmlFor="token" className="mb-2 mt-6 block text-sm font-semibold">
          توکن ورود
        </label>
        <textarea
          id="token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          rows={4}
          required
          dir="ltr"
          placeholder="Bearer token..."
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left text-sm outline-none focus:border-black"
        />

        <button type="submit" className="mt-5 w-full rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white hover:bg-gray-800">
          ذخیره و ورود
        </button>

        <Link href="/shop" className="mt-5 block text-center text-sm text-gray-500 underline underline-offset-4">
          بازگشت به فروشگاه
        </Link>
      </form>
    </main>
  );
}