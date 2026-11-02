"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/require-auth";
import { useCart } from "@/components/providers/cart-provider";
import ProductImage from "@/components/shop/product-image";
import { createOrder, getErrorMessage } from "@/lib/api";
import { formatNumber, formatToman, normalizeDigits } from "@/lib/format";

interface FieldErrors {
  fullName?: string;
  phone?: string;
  address?: string;
}

function validate(fullName: string, phone: string, address: string) {
  const errors: FieldErrors = {};

  if (fullName.trim().length < 3) {
    errors.fullName = "نام و نام خانوادگی را کامل وارد کن (حداقل ۳ حرف).";
  }

  if (!/^09\d{9}$/.test(phone)) {
    errors.phone = "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم داشته باشد.";
  }

  if (address.trim().length < 10) {
    errors.address = "آدرس را کامل‌تر وارد کن (استان، شهر، خیابان و پلاک).";
  }

  return errors;
}

function CheckoutContent() {
  const router = useRouter();
  const { cart, status, error: loadError, refresh } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // قفل هم‌زمان: دو کلیک پشت‌سرهم قبل از اعمال state نباید دو سفارش ثبت کند.
  const submitLock = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLock.current) return;

    setError("");

    const normalizedPhone = normalizeDigits(phone).replace(/[\s-]/g, "");
    const errors = validate(fullName, normalizedPhone, address);

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    submitLock.current = true;
    setSubmitting(true);

    try {
      const order = await createOrder({
        fullName: fullName.trim(),
        phone: normalizedPhone,
        address: address.trim(),
      });

      // سبد سمت سرور خالی شده؛ شمارندهٔ هدر هم بدون انتظار به‌روز می‌شود.
      void refresh();
      router.replace(
        order?.id !== undefined && order?.id !== null
          ? `/orders/${order.id}`
          : "/orders",
      );
    } catch (err) {
      setError(getErrorMessage(err, "ثبت سفارش ناموفق بود."));
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  if (status === "idle" || status === "loading") {
    return (
      <main dir="rtl" className="page-sm" aria-busy="true">
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-6 h-64" />
      </main>
    );
  }

  if (status === "error" && !cart) {
    return (
      <main dir="rtl" className="page-sm">
        <div role="alert" className="card px-5 py-14 text-center">
          <p className="text-sm leading-7 text-gray-700">{loadError}</p>

          <button
            type="button"
            onClick={() => void refresh()}
            className="btn btn-primary mt-5"
          >
            تلاش مجدد
          </button>
        </div>
      </main>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <main
        dir="rtl"
        className="mx-auto min-h-[50vh] max-w-3xl px-5 py-16 text-center"
      >
        <h1 className="text-2xl font-bold">سبد خرید خالی است</h1>

        <p className="mt-3 text-sm text-gray-500">
          برای ثبت سفارش ابتدا محصولی انتخاب کن.
        </p>

        <Link href="/shop" className="btn btn-primary mt-6">
          بازگشت به فروشگاه
        </Link>
      </main>
    );
  }

  return (
    <main dir="rtl" className="page-md text-black">
      <div className="mb-8 border-b border-gray-200 pb-5">
        <h1 className="page-title">تکمیل سفارش</h1>
        <p className="mt-2 text-sm text-gray-500">
          اطلاعات تحویل سفارش را وارد کن.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="card order-2 space-y-5 p-5 sm:p-7 lg:order-1"
        >
          {error && (
            <p role="alert" className="alert alert-error">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="fullName" className="field-label">
              نام و نام خانوادگی
            </label>

            <input
              id="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
              className={`input ${fieldErrors.fullName ? "input-error" : ""}`}
              placeholder="نام کامل"
            />

            {fieldErrors.fullName && (
              <p id="fullName-error" role="alert" className="field-error">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="field-label">
              شماره موبایل
            </label>

            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              autoComplete="tel"
              maxLength={14}
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              className={`input text-left ${fieldErrors.phone ? "input-error" : ""}`}
              placeholder="09123456789"
              dir="ltr"
            />

            {fieldErrors.phone && (
              <p id="phone-error" role="alert" className="field-error">
                {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="field-label">
              آدرس کامل
            </label>

            <textarea
              id="address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={4}
              autoComplete="street-address"
              disabled={submitting}
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={fieldErrors.address ? "address-error" : undefined}
              className={`input h-auto resize-y py-3 leading-7 ${
                fieldErrors.address ? "input-error" : ""
              }`}
              placeholder="استان، شهر، خیابان، کوچه و پلاک"
            />

            {fieldErrors.address && (
              <p id="address-error" role="alert" className="field-error">
                {fieldErrors.address}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-4"
          >
            {submitting ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش"}
          </button>

          <Link
            href="/cart"
            className="inline-block text-sm text-gray-500 underline underline-offset-4"
          >
            بازگشت به سبد خرید
          </Link>
        </form>

        <aside className="card order-1 space-y-4 border-black p-5 lg:sticky lg:top-24 lg:order-2">
          <h2 className="text-base font-bold">خلاصه سفارش</h2>

          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.product.id} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                  <ProductImage
                    src={item.product.image}
                    alt={item.product.name}
                    sizes="56px"
                    className="object-contain p-1"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">
                    {item.product.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatNumber(item.quantity)} × {formatToman(item.product.price)}
                  </p>
                </div>

                <strong className="shrink-0 text-xs">
                  {formatToman(item.subtotal)}
                </strong>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">تعداد محصولات</span>
              <strong>{formatNumber(cart?.totalItems ?? 0)}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">مبلغ قابل پرداخت</span>
              <strong>{formatToman(cart?.totalPrice ?? 0)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutContent />
    </RequireAuth>
  );
}
