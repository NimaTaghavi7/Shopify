"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  /** مقدار فیلد `image` در پاسخ API؛ معمولاً مسیر محلی داخل `public` مثل `/shop/images/x.png`. */
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/**
 * مسیر تصویر را به آدرس قابل‌نمایش تبدیل می‌کند.
 * مسیر محلی (`/shop/images/...`) هرگز به آدرس API متصل نمی‌شود.
 */
export function resolveImageSrc(image?: string | null): string | null {
  const value = image?.trim();

  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  return value.startsWith("/") ? value : `/${value}`;
}

/**
 * تصویر محصول داخل یک والد `relative` با اندازهٔ مشخص (fill).
 * اگر تصویر نباشد یا بارگذاری نشود، جایگزین نمایش داده می‌شود و صفحه خراب نمی‌شود.
 */
export default function ProductImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
}: ProductImageProps) {
  const resolved = resolveImageSrc(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!resolved || failedSrc === resolved) {
    return (
      <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-gray-400">
        تصویر موجود نیست
      </div>
    );
  }

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={/^https?:\/\//i.test(resolved)}
      onError={() => setFailedSrc(resolved)}
      className={className}
    />
  );
}
