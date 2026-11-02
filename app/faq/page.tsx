import type { Metadata } from "next";
import StaticPage from "@/components/shop/static-page";

export const metadata: Metadata = {
  title: "سؤالات متداول",
};

const faqs: { question: string; answer: string }[] = [
  {
    question: "چطور خرید کنم؟",
    answer:
      "محصول موردنظر را از فروشگاه پیدا کن، به سبد خرید اضافه کن، سپس از صفحهٔ سبد خرید روی «ادامه و ثبت سفارش» بزن، اطلاعات تحویل را وارد کن و سفارش را ثبت کن.",
  },
  {
    question: "برای خرید باید ثبت‌نام کنم؟",
    answer:
      "مشاهدهٔ محصولات نیازی به حساب کاربری ندارد، اما سبد خرید و ثبت سفارش به حساب کاربری وابسته است. اگر هنگام افزودن محصول وارد نشده باشی، به صفحهٔ ورود هدایت می‌شوی و بعد از ورود به همان مسیر برمی‌گردی.",
  },
  {
    question: "چرا نمی‌توانم تعداد بیشتری از یک محصول اضافه کنم؟",
    answer:
      "تعداد قابل انتخاب هر محصول به موجودی انبار محدود است. اگر محصولی ناموجود باشد، دکمهٔ افزودن به سبد برای آن غیرفعال می‌شود.",
  },
  {
    question: "سفارش‌هایم را کجا ببینم؟",
    answer:
      "از منوی حساب کاربری یا لینک «سفارش‌های من»، فهرست همهٔ سفارش‌ها را با شماره، وضعیت و مبلغ می‌بینی و با زدن «مشاهده جزئیات» به صفحهٔ کامل هر سفارش می‌روی.",
  },
  {
    question: "وضعیت‌های مختلف سفارش یعنی چه؟",
    answer:
      "«در انتظار پرداخت» یعنی سفارش ثبت شده ولی هنوز پرداخت نشده است، «پرداخت شده» یعنی پرداخت سفارش انجام شده و «لغو شده» یعنی سفارش لغو شده است.",
  },
  {
    question: "پرداخت سفارش چگونه انجام می‌شود؟",
    answer:
      "پرداخت از صفحهٔ جزئیات سفارش انجام می‌شود. در این نسخه پرداخت از طریق سرویس آزمایشی فروشگاه ثبت می‌شود و به درگاه بانکی متصل نیست.",
  },
  {
    question: "آیا می‌توانم سفارش را لغو کنم؟",
    answer:
      "بله، تا زمانی که سفارش در وضعیت «در انتظار پرداخت» است، در صفحهٔ جزئیات سفارش دکمهٔ «لغو سفارش» را می‌بینی.",
  },
  {
    question: "نشست ورودم منقضی شد، چه کنم؟",
    answer:
      "اگر نشست ورودت منقضی شود، به‌طور خودکار به صفحهٔ ورود هدایت می‌شوی. دوباره وارد شو تا به کارت برگردی.",
  },
];

export default function FaqPage() {
  return (
    <StaticPage
      title="سؤالات متداول"
      intro="پاسخ کوتاه پرسش‌های رایج دربارهٔ خرید، پرداخت و پیگیری سفارش."
    >
      <div className="space-y-3">
        {faqs.map((item) => (
          <details key={item.question} className="card group px-5 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:hidden">
              {item.question}
              <span
                aria-hidden="true"
                className="text-lg text-gray-400 transition group-open:rotate-45"
              >
                +
              </span>
            </summary>

            <p className="mt-3 text-sm leading-8 text-gray-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </StaticPage>
  );
}
