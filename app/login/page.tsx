
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/auth-layout";
import { loginUser } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("نام کاربری و رمز عبور را وارد کن.");
      return;
    }

    try {
      setLoading(true);

      await loginUser(username.trim(), password);

      router.replace("/shop");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ورود ناموفق بود. دوباره تلاش کن.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="خوش برگشتی!"
      description="برای ورود به حساب کاربری، اطلاعاتت را وارد کن."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="نام کاربری خود را وارد کن"
            autoComplete="username"
            required
            disabled={loading}
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white disabled:opacity-60"
          />
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
              placeholder="رمز عبور خود را وارد کن"
              autoComplete="current-password"
              required
              disabled={loading}
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 pl-20 text-sm outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white disabled:opacity-60"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={loading}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 transition hover:text-black"
            >
              {showPassword ? "پنهان کردن" : "نمایش"}
            </button>
          </div>
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
          className="flex h-12 w-full items-center justify-center rounded-xl bg-black text-sm font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "در حال ورود..." : "ورود به حساب"}
        </button>
      </form>

      <div className="my-6 h-px bg-gray-100" />

      <p className="text-center text-sm text-gray-500">
        هنوز حساب کاربری نداری؟{" "}
        <Link
          href="/register"
          className="font-bold text-black underline underline-offset-4 hover:text-gray-600"
        >
          ثبت‌نام کن
        </Link>
      </p>
    </AuthLayout>
  );
}
