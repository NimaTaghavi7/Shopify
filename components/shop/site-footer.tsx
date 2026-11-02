import Link from "next/link";
import {
  getContactItems,
  getSocialLinks,
  siteConfig,
} from "@/lib/site-config";

const quickLinks = [
  { href: "/", label: "صفحه اصلی" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/cart", label: "سبد خرید" },
  { href: "/orders", label: "سفارش‌های من" },
  { href: "/account", label: "حساب کاربری" },
];

const infoLinks = [
  { href: "/about", label: "درباره ما" },
  { href: "/faq", label: "راهنمای خرید و سؤالات متداول" },
  { href: "/terms", label: "قوانین و مقررات" },
  { href: "/contact", label: "تماس با ما" },
];

const linkClass = "text-sm text-gray-600 transition hover:text-black";

export default function SiteFooter() {
  const contactItems = getContactItems();
  const socialLinks = getSocialLinks();

  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(
    new Date(),
  );

  return (
    <footer dir="rtl" className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <section>
          <Link href="/" className="text-2xl font-black tracking-tight">
            {siteConfig.name}
          </Link>

          <p className="mt-4 text-sm leading-7 text-gray-600">
            {siteConfig.description}
          </p>
        </section>

        <nav aria-label="دسترسی سریع">
          <h2 className="mb-4 text-sm font-bold">دسترسی سریع</h2>

          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="راهنما و قوانین">
          <h2 className="mb-4 text-sm font-bold">راهنما و قوانین</h2>

          <ul className="space-y-3">
            {infoLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section>
          <h2 className="mb-4 text-sm font-bold">ارتباط با ما</h2>

          {contactItems.length > 0 ? (
            <ul className="space-y-3">
              {contactItems.map((item) => (
                <li key={item.label} className="text-sm text-gray-600">
                  <span className="text-gray-500">{item.label}: </span>

                  {item.href ? (
                    <a
                      href={item.href}
                      dir="ltr"
                      className="transition hover:text-black"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <span>{item.value}</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-gray-600">
              برای پیگیری سفارش‌ها از بخش «سفارش‌های من» و برای پاسخ پرسش‌های
              رایج از صفحهٔ{" "}
              <Link href="/faq" className="font-medium underline underline-offset-4">
                سؤالات متداول
              </Link>{" "}
              استفاده کن.
            </p>
          )}

          {socialLinks.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-700 transition hover:border-black hover:text-black"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="border-t border-gray-200 py-5 text-center text-xs text-gray-500">
        {siteConfig.name} © {year} — تمامی حقوق محفوظ است.
      </div>
    </footer>
  );
}
