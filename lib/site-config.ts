/**
 * اطلاعات عمومی فروشگاه.
 *
 * اطلاعات تماس و شبکه‌های اجتماعی عمداً خالی گذاشته شده‌اند تا هیچ داده‌ٔ جعلی
 * نمایش داده نشود. هر مقداری که اینجا پر شود، به‌صورت خودکار در فوتر و صفحهٔ
 * «تماس با ما» نمایش داده می‌شود و مقدار خالی نمایش داده نمی‌شود.
 */
interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  contact: {
    email: string;
    phone: string;
    address: string;
    workingHours: string;
  };
  socials: { label: string; url: string }[];
}

export const siteConfig: SiteConfig = {
  name: "SHOPIFY",
  tagline: "انتخاب بهتر، خرید ساده‌تر",
  description:
    "فروشگاه اینترنتی با تجربه خرید ساده: محصولات را جستجو کن، دسته‌بندی‌ها را ببین و سفارشت را آنلاین ثبت و پیگیری کن.",

  contact: {
    email: "", // مثال: "support@example.com"
    phone: "", // مثال: "021-12345678"
    address: "",
    workingHours: "",
  },

  socials: [
    { label: "اینستاگرام", url: "" }, // مثال: "https://instagram.com/your-shop"
    { label: "تلگرام", url: "" },
    { label: "واتساپ", url: "" },
  ],
};

export interface ContactItem {
  label: string;
  value: string;
  href?: string;
}

/** فقط مواردی که مقدار واقعی دارند. */
export function getContactItems(): ContactItem[] {
  const { email, phone, address, workingHours } = siteConfig.contact;
  const items: ContactItem[] = [];

  if (email) items.push({ label: "ایمیل", value: email, href: `mailto:${email}` });
  if (phone) {
    items.push({
      label: "تلفن",
      value: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    });
  }
  if (address) items.push({ label: "آدرس", value: address });
  if (workingHours) items.push({ label: "ساعات پاسخ‌گویی", value: workingHours });

  return items;
}

export function getSocialLinks(): { label: string; url: string }[] {
  return siteConfig.socials
    .filter((social) => /^https?:\/\//i.test(social.url))
    .map((social) => ({ label: social.label, url: social.url }));
}
