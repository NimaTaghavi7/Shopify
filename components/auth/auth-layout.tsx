import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

/** قالب مشترک صفحات ورود و ثبت‌نام؛ هدر و فوتر از layout اصلی می‌آیند. */
export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  return (
    <main
      dir="rtl"
      className="flex min-h-[calc(100vh-14rem)] items-center justify-center px-4 py-12 text-black sm:px-6"
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight">{title}</h1>

          <p className="mt-3 text-sm leading-7 text-gray-500">{description}</p>
        </div>

        <div className="card p-6 shadow-sm sm:p-8">{children}</div>
      </div>
    </main>
  );
}
