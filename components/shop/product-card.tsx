
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
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-gray-400 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className={`h-full w-full object-contain p-4 transition duration-300 group-hover:scale-105 ${
              !isAvailable ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            تصویر موجود نیست
          </div>
        )}

        {!isAvailable && (
          <span className="absolute right-3 top-3 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white">
            ناموجود
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 text-xs text-gray-500">
          {product.category.name}
        </p>

        <h3 className="line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-gray-900">
          {product.name}
        </h3>

        <div className="mt-auto pt-5">
          {isAvailable ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-500">
                قیمت
              </span>

              <div className="text-left">
                <span className="text-base font-bold text-black">
                  {tomanFormatter.format(product.price)}
                </span>
                <span className="mr-1 text-xs text-gray-500">
                  تومان
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-500">
              در حال حاضر قابل سفارش نیست
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
