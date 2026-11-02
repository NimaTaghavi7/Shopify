"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/auth-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { getErrorMessage } from "@/lib/api";
import { registerHref, safeNextPath } from "@/lib/auth-redirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, login } = useAuth();

  const rawNext = searchParams.get("next");
  const next = safeNextPath(rawNext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // کاربر واردشده (یا تازه واردشده) نباید صفحهٔ ورود را ببیند.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next);
    }
  }, [status, next, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!username.trim() || !password) {
      setError("نام کاربری و رمز عبور را وارد کن.");
      return;
    }

    setLoading(true);

    try {
      await login(username.trim(), password);
      // هدایت را effect بالا پس از تغییر وضعیت انجام می‌دهد.
    } catch (err) {
      setError(getErrorMessage(err, "ورود ناموفق بود. دوباره تلاش کن."));
      setLoading(false);
    }
  }

  const busy = loading || status === "authenticated";

  return (
    <AuthLayout
      title="خوش برگشتی!"
      description={
        rawNext
          ? "برای ادامه، وارد حساب کاربری‌ات شو."
          : "برای ورود به حساب کاربری، اطلاعاتت را وارد کن."
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="username" className="field-label">
            نام کاربری
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="نام کاربری خود را وارد کن"
            autoComplete="username"
            disabled={busy}
            className="input"
          />
        </div>

        <div>
          <label htmlFor="password" className="field-label">
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
              disabled={busy}
              className="input pl-20"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              disabled={busy}
              aria-pressed={showPassword}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 transition hover:text-black"
            >
              {showPassword ? "پنهان کردن" : "نمایش"}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="btn btn-primary h-12 w-full py-0"
        >
          {busy ? "در حال ورود..." : "ورود به حساب"}
        </button>
      </form>

      <div className="my-6 h-px bg-gray-100" />

      <p className="text-center text-sm text-gray-500">
        هنوز حساب کاربری نداری؟{" "}
        <Link
          href={registerHref(rawNext ?? undefined)}
          className="font-bold text-black underline underline-offset-4 hover:text-gray-600"
        >
          ثبت‌نام کن
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
