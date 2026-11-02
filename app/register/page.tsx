
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/auth-layout";
import { registerUser } from "@/lib/api";

type ContactMethod = "phone" | "email" | "both";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [username, setUsername] = useState("");
  const [contactMethod, setContactMethod] =
    useState<ContactMethod>("phone");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFirstStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError("نام کاربری باید حداقل ۳ کاراکتر باشد.");
      return;
    }

    if (
      (contactMethod === "phone" || contactMethod === "both") &&
      !/^09\d{9}$/.test(phone.trim())
    ) {
      setError("شماره موبایل معتبر وارد کن.");
      return;
    }

    if (
      (contactMethod === "email" || contactMethod === "both") &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      setError("آدرس ایمیل معتبر وارد کن.");
      return;
    }

    setStep(2);
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    if (password !== confirmPassword) {
      setError("تکرار رمز عبور با رمز اصلی مطابقت ندارد.");
      return;
    }

    try {
      setLoading(true);

      await registerUser(username.trim(), password);

      localStorage.setItem(
        "shopify-contact",
        JSON.stringify({
          username: username.trim(),
          contactMethod,
          phone: phone.trim(),
          email: email.trim(),
        }),
      );

      setStep(3);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ثبت‌نام انجام نشد. دوباره تلاش کن.",
      );
    } finally {
      setLoading(false);
    }
  }

  function goToShop() {
    router.replace("/shop");
  }

  return (
    <AuthLayout
      title={
        step === 3
          ? "ثبت‌نام موفق"
          : "ساخت حساب کاربری"
      }
      description={
        step === 1
          ? "اطلاعات اولیه حساب خود را وارد کن."
          : step === 2
            ? "برای حساب خود یک رمز عبور انتخاب کن."
            : "حساب کاربری تو با موفقیت ساخته شد."
      }
      step={step}
    >
      {step === 1 && (
        <form onSubmit={handleFirstStep} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold"
            >
              نام کاربری
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="یک نام کاربری انتخاب کن"
              autoComplete="username"
              required
              minLength={3}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold">
              روش ارتباطی
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "phone", label: "موبایل" },
                { value: "email", label: "ایمیل" },
                { value: "both", label: "هر دو" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setContactMethod(option.value as ContactMethod)
                  }
                  className={`rounded-xl border px-2 py-3 text-xs font-semibold transition ${
                    contactMethod === option.value
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {(contactMethod === "phone" || contactMethod === "both") && (
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold"
              >
                شماره موبایل
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                dir="ltr"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="09123456789"
                required
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-left text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
              />
            </div>
          )}

          {(contactMethod === "email" || contactMethod === "both") && (
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                آدرس ایمیل
              </label>

              <input
                id="email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                required
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-left text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
              />
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-black text-sm font-bold text-white transition hover:bg-gray-800"
          >
            ادامه
          </button>

          <p className="text-center text-xs leading-6 text-gray-400">
            اطلاعات تماس در این نسخه فقط در مرورگر ذخیره می‌شود و
            توسط سرور تأیید نمی‌شود.
          </p>

          <div className="border-t border-gray-100 pt-5">
            <p className="text-center text-sm text-gray-500">
              قبلاً حساب ساخته‌ای؟{" "}
              <Link
                href="/login"
                className="font-bold text-black underline underline-offset-4"
              >
                وارد شو
              </Link>
            </p>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              نام کاربری
            </label>

            <div className="flex h-12 items-center rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500">
              {username}
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold"
            >
              رمز عبور
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                autoComplete="new-password"
                required
                minLength={6}
                disabled={loading}
                className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pl-20 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black"
              >
                {showPassword ? "پنهان کردن" : "نمایش"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-semibold"
            >
              تکرار رمز عبور
            </label>

            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="رمز عبور را دوباره وارد کن"
              autoComplete="new-password"
              required
              disabled={loading}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-black text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال ساخت حساب..." : "ساخت حساب کاربری"}
          </button>

          <button
            type="button"
            onClick={() => {
              setError("");
              setStep(1);
            }}
            disabled={loading}
            className="w-full py-2 text-sm text-gray-500 transition hover:text-black"
          >
            بازگشت به مرحله قبل
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="py-3 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
            ✓
          </div>

          <h2 className="mt-5 text-xl font-bold">
            حساب تو آماده است!
          </h2>

          <p className="mt-3 text-sm leading-7 text-gray-500">
            ثبت‌نام با موفقیت انجام شد. حالا می‌توانی محصولات فروشگاه
            را مشاهده و خرید خود را شروع کنی.
          </p>

          <button
            type="button"
            onClick={goToShop}
            className="mt-7 h-12 w-full rounded-xl bg-black text-sm font-bold text-white transition hover:bg-gray-800"
          >
            ورود به فروشگاه
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
