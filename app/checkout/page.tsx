"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createOrder, getCart, type Cart } from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getCart()
      .then((result) => {
        if (active) setCart(result);
      })
      .catch((err) => {
        if (active) {
          if (err instanceof Error && err.message === "LOGIN_REQUIRED") {
            router.push("/login");
          } else {
            setError(err instanceof Error ? err.message : "دریافت سبد خرید ناموفق بود.");
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedPhone = phone.replace(/\s/g, "");

    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError("شماره موبایل باید با 09 شروع شود و ۱۱ رقم داشته باشد.");
      return;
    }

    if (!fullName.trim() || !address.trim()) {
      setError("لطفاً تمام فیلدها را تکمیل کن.");
      return;
    }

    try {
      setSubmitting(true);
      const order = await createOrder({
        fullName: fullName.trim(),
        phone: normalizedPhone,
        address: address.trim(),
      });

      window.dispatchEvent(new Event("shop:cart-updated"));
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت سفارش ناموفق بود.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main dir="rtl" className="mx-auto min-h-screen max-w-3xl px-5 py-12">
        <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
      </main>
    );
  }

  if (!cart?.items?.length) {
    return (
      <main dir="rtl" className="mx-auto min-h-[70vh] max-w-3xl px-5 py-16 text-center">
        <h1 className="text-2xl font-bold">سبد خرید خالی است</h1>
        <p className="mt-3 text-sm text-gray-500">برای ثبت سفارش ابتدا محصولی انتخاب کن.</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-xl bg-black px-6 py-3 text-sm text-white">
          بازگشت به فروشگاه
        </Link>
      </main>
    );
  }

  return (
    <main dir="rtl" className="mx-auto min-h-screen max-w-3xl px-5 py-10 text-black">
      <div className="mb-8 border-b border-black pb-5">
        <h1 className="text-2xl font-bold">تکمیل سفارش</h1>
        <p className="mt-2 text-sm text-gray-500">اطلاعات تحویل سفارش را وارد کن.</p>
      </div>

      {error && (
        <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 p-5 sm:p-7">
        <div>
          <label htmlFor="fullName" className="mb-2 block text-sm font-semibold">نام و نام خانوادگی</label>
          <input
            id="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            autoComplete="name"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            placeholder="نام کامل"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-2 block text-sm font-semibold">شماره موبایل</label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            autoComplete="tel"
            maxLength={11}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-left text-sm outline-none focus:border-black"
            placeholder="09123456789"
            dir="ltr"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-2 block text-sm font-semibold">آدرس کامل</label>
          <textarea
            id="address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            required
            rows={4}
            autoComplete="street-address"
            className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-7 outline-none focus:border-black"
            placeholder="استان، شهر، خیابان، کوچه و پلاک"
          />
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">تعداد محصولات</span>
            <strong>{cart.totalItems.toLocaleString("fa-IR")}</strong>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-gray-500">مبلغ قابل پرداخت</span>
            <strong>{new Intl.NumberFormat("fa-IR").format(cart.totalPrice)} تومان</strong>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-wait disabled:opacity-50"
        >
          {submitting ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش"}
        </button>
      </form>

      <Link href="/cart" className="mt-5 inline-block text-sm text-gray-500 underline underline-offset-4">
        بازگشت به سبد خرید
      </Link>
    </main>
  );
}