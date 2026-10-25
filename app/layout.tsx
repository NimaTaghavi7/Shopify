
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shopify | فروشگاه آنلاین",
  description:
    "محصولات را جستجو کنید، دسته‌بندی‌ها را بررسی کنید و محصولات دلخواهتان را پیدا کنید.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
