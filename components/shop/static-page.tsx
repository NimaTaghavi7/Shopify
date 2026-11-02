import type { ReactNode } from "react";

interface StaticPageProps {
  title: string;
  intro?: string;
  children: ReactNode;
}

/** قالب مشترک صفحات اطلاع‌رسانی (درباره ما، سؤالات متداول، قوانین و ...). */
export default function StaticPage({ title, intro, children }: StaticPageProps) {
  return (
    <main dir="rtl" className="page-sm text-black">
      <header className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="page-title">{title}</h1>

        {intro && (
          <p className="mt-3 text-sm leading-8 text-gray-600">{intro}</p>
        )}
      </header>

      <div className="space-y-8">{children}</div>
    </main>
  );
}

export function StaticSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="space-y-3 text-sm leading-8 text-gray-600">{children}</div>
    </section>
  );
}
