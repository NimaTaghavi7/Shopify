import type { Metadata } from "next";
import Link from "next/link";
import StaticPage, { StaticSection } from "@/components/shop/static-page";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "درباره ما",
  description: `آشنایی با فروشگاه اینترنتی ${siteConfig.name}`,
};

export default function AboutPage() {
  return (
    <StaticPage
      title="درباره ما"
      intro={`${siteConfig.name} یک فروشگاه اینترنتی است که خرید آنلاین را ساده و شفاف می‌کند: ${siteConfig.tagline}.`}
    >
      <StaticSection title="هدف ما">
        <p>
          می‌خواهیم پیدا کردن محصول مناسب، بررسی قیمت و موجودی و ثبت سفارش
          بدون سردرگمی انجام شود. همهٔ قیمت‌ها و وضعیت موجودی هر محصول
          مستقیماً از اطلاعات زندهٔ فروشگاه نمایش داده می‌شود.
        </p>
      </StaticSection>

      <StaticSection title="تجربه خرید در این فروشگاه">
        <ul className="list-disc space-y-2 pr-5">
          <li>جستجو، دسته‌بندی، فیلتر قیمت و مرتب‌سازی محصولات</li>
          <li>سبد خرید همیشه در دسترس و همگام با حساب کاربری</li>
          <li>ثبت سفارش با اطلاعات تحویل و پیگیری وضعیت آن در هر زمان</li>
          <li>امکان پرداخت یا لغو سفارش‌های در انتظار پرداخت</li>
        </ul>
      </StaticSection>

      <StaticSection title="از کجا شروع کنم؟">
        <p>
          محصولات را در{" "}
          <Link href="/shop" className="font-semibold text-black underline underline-offset-4">
            فروشگاه
          </Link>{" "}
          ببین، و اگر دربارهٔ روند خرید سؤالی داری به{" "}
          <Link href="/faq" className="font-semibold text-black underline underline-offset-4">
            سؤالات متداول
          </Link>{" "}
          سر بزن.
        </p>
      </StaticSection>
    </StaticPage>
  );
}
