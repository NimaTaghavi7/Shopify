import { redirect } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * آدرس استاندارد دسته‌بندی؛ فهرست محصولات با فیلتر همان دسته در فروشگاه نمایش داده می‌شود.
 * اگر slug وجود نداشته باشد، فروشگاه پیام «محصولی پیدا نشد» نشان می‌دهد.
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  redirect(`/shop?category=${encodeURIComponent(slug)}`);
}
