import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CartProvider } from "@/components/providers/cart-provider";
import SiteFooter from "@/components/shop/site-footer";
import SiteHeader from "@/components/shop/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Shopify | فروشگاه آنلاین",
    template: "%s | Shopify",
  },
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
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
