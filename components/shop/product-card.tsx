import type { Product } from "@/types/shop";
import { getImageUrl } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

const tomanFormatter = new Intl.NumberFormat("fa-IR");

export default function ProductCard({ product }: ProductCardProps) {
  const imageUrl = getImageUrl(product.image);
  const isAvailable = product.inStock && product.stock > 0;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-contain p-3 transition duration-300 group-hover:scale-105 sm:p-5 ${
              isAvailable ? "" : "opacity-50 grayscale"
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-sm text-gray-400">
            تصویر موجود نیست
          </div>
        )}
        {!isAvailable && (
          <span className="absolute right-2 top-2 rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white sm:right-3 sm:top-3">
            ناموجود
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="mb-2 line-clamp-1 text-xs text-gray-500">{product.category.name}</p>
        <h3 className="line-clamp-2 min-h-12 text-sm font-medium leading-6 text-gray-900">
          {product.name}
        </h3>
        <div className="mt-auto pt-4">
          {isAvailable ? (
            <div className="flex flex-wrap items-baseline justify-end gap-x-1">
              <span className="text-base font-bold text-black sm:text-lg">
                {tomanFormatter.format(product.price)}
              </span>
              <span className="text-xs text-gray-500">تومان</span>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-500">در حال حاضر موجود نیست</p>
          )}
        </div>
      </div>
    </article>
  );
}
