
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  step?: number;
}

export default function AuthLayout({
  title,
  description,
  children,
  step,
}: AuthLayoutProps) {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen flex-col bg-white text-black"
    >
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            Shopify<span className="text-gray-400">.</span>
          </Link>

          <Link
            href="/shop"
            className="text-sm text-gray-500 transition hover:text-black"
          >
            بازگشت به فروشگاه
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          {typeof step === "number" && (
            <div className="mb-8">
              <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
                <span>مرحله {step} از ۳</span>
                <span>{Math.round((step / 3) * 100)}٪</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-black transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black tracking-tight">
              {title}
            </h1>

            <p className="mt-3 text-sm leading-7 text-gray-500">
              {description}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            تجربه خریدی ساده و مطمئن
          </p>
        </div>
      </section>
    </main>
  );
}
