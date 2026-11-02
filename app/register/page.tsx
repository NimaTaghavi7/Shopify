"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/auth-layout";
import { useAuth } from "@/components/providers/auth-provider";
import { getErrorMessage } from "@/lib/api";
import { loginHref, safeNextPath } from "@/lib/auth-redirect";

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;

interface FieldErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, register } = useAuth();

  const rawNext = searchParams.get("next");
  const next = safeNextPath(rawNext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(next);
    }
  }, [status, next, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");

    const trimmed = username.trim();
    const errors: FieldErrors = {};

    if (trimmed.length < MIN_USERNAME_LENGTH) {
      errors.username = `نام کاربری باید حداقل ${MIN_USERNAME_LENGTH.toLocaleString("fa-IR")} کاراکتر باشد.`;
    } else if (/\s/.test(trimmed)) {
      errors.username = "نام کاربری نباید فاصله داشته باشد.";
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH.toLocaleString("fa-IR")} کاراکتر باشد.`;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "تکرار رمز عبور با رمز اصلی مطابقت ندارد.";
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    try {
      await register(trimmed, password);
      // ثبت‌نام موفق، کاربر را وارد هم می‌کند؛ هدایت با effect بالا انجام می‌شود.
    } catch (err) {
      setError(getErrorMessage(err, "ثبت‌نام انجام نشد. دوباره تلاش کن."));
      setLoading(false);
    }
  }

  const busy = loading || status === "authenticated";

  return (
    <AuthLayout
      title="ساخت حساب کاربری"
      description="با یک نام کاربری و رمز عبور، حسابت را بساز و خریدت را شروع کن."
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
            placeholder="یک نام کاربری انتخاب کن"
            autoComplete="username"
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.username)}
            aria-describedby={fieldErrors.username ? "username-error" : undefined}
            className={`input ${fieldErrors.username ? "input-error" : ""}`}
          />

          {fieldErrors.username && (
            <p id="username-error" role="alert" className="field-error">
              {fieldErrors.username}
            </p>
          )}
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
              placeholder={`حداقل ${MIN_PASSWORD_LENGTH.toLocaleString("fa-IR")} کاراکتر`}
              autoComplete="new-password"
              disabled={busy}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              className={`input pl-20 ${fieldErrors.password ? "input-error" : ""}`}
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

          {fieldErrors.password && (
            <p id="password-error" role="alert" className="field-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="field-label">
            تکرار رمز عبور
          </label>

          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="رمز عبور را دوباره وارد کن"
            autoComplete="new-password"
            disabled={busy}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            aria-describedby={
              fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
            }
            className={`input ${fieldErrors.confirmPassword ? "input-error" : ""}`}
          />

          {fieldErrors.confirmPassword && (
            <p id="confirmPassword-error" role="alert" className="field-error">
              {fieldErrors.confirmPassword}
            </p>
          )}
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
          {busy ? "در حال ساخت حساب..." : "ساخت حساب کاربری"}
        </button>
      </form>

      <div className="my-6 h-px bg-gray-100" />

      <p className="text-center text-sm text-gray-500">
        قبلاً حساب ساخته‌ای؟{" "}
        <Link
          href={loginHref(rawNext ?? undefined)}
          className="font-bold text-black underline underline-offset-4"
        >
          وارد شو
        </Link>
      </p>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
