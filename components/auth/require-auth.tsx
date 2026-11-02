"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { loginHref } from "@/lib/auth-redirect";

/**
 * صفحات محافظت‌شده را فقط برای کاربر واردشده نمایش می‌دهد؛
 * کاربر مهمان به صفحهٔ ورود (با مسیر بازگشت) هدایت می‌شود.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { status, loggedOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "guest") {
      // خروج عمدی به صفحهٔ اصلی می‌رود؛ نشست منقضی یا مهمان به ورود با مسیر بازگشت.
      router.replace(loggedOut ? "/" : loginHref(pathname));
    }
  }, [status, loggedOut, pathname, router]);

  if (status !== "authenticated") {
    return (
      <main
        dir="rtl"
        aria-busy="true"
        className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6"
      >
        <div className="skeleton h-8 w-40" />
        <div className="skeleton mt-6 h-40" />
      </main>
    );
  }

  return <>{children}</>;
}
