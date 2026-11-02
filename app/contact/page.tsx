import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/shop/static-page";
import { getContactItems, getSocialLinks } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "تماس با ما",
};

export default function ContactPage() {
  const contactItems = getContactItems();
  const socialLinks = getSocialLinks();

  return (
    <StaticPage
      title="تماس با ما"
      intro="برای پیگیری سفارش یا طرح پرسش، از راه‌های زیر استفاده کن."
    >
      {contactItems.length > 0 ? (
        <section className="card divide-y divide-gray-100">
          {contactItems.map((item) => (
            <div
              key={item.label}
              className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm"
            >
              <span className="text-gray-500">{item.label}</span>

              {item.href ? (
                <a
                  href={item.href}
                  dir="ltr"
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  {item.value}
                </a>
              ) : (
                <span className="font-semibold">{item.value}</span>
              )}
            </div>
          ))}
        </section>
      ) : (
        <section className="card px-5 py-6 text-sm leading-8 text-gray-600">
          راه‌های ارتباط مستقیم فروشگاه هنوز در این صفحه ثبت نشده است. تا آن
          زمان می‌توانی وضعیت سفارش‌هایت را از بخش «سفارش‌های من» دنبال کنی و
          پاسخ پرسش‌های رایج را در صفحهٔ سؤالات متداول بخوانی.
        </section>
      )}

      {socialLinks.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">شبکه‌های اجتماعی</h2>

          <ul className="flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/orders" className="card p-5 transition hover:border-black">
          <h2 className="font-bold">پیگیری سفارش</h2>
          <p className="mt-2 text-sm leading-7 text-gray-500">
            وضعیت و جزئیات همهٔ سفارش‌هایت را ببین.
          </p>
        </Link>

        <Link href="/faq" className="card p-5 transition hover:border-black">
          <h2 className="font-bold">سؤالات متداول</h2>
          <p className="mt-2 text-sm leading-7 text-gray-500">
            پاسخ پرسش‌های رایج دربارهٔ خرید، پرداخت و لغو سفارش.
          </p>
        </Link>
      </section>
    </StaticPage>
  );
}
