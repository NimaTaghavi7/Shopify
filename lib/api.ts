
import type {
  CategoriesResponse,
  ProductsResponse,
  Product,
} from "@/types/shop";

const API_BASE_URL = "https://practice.amirm.me";

interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  inStock?: boolean;
  sort?: "newest" | "price" | "-price" | "name";
  page?: number;
  limit?: number;
}

interface AddToCartResponse {
  items: Array<{
    product: Product;
    quantity: number;
    subtotal: number;
  }>;
  totalItems: number;
  totalPrice: number;
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data.message === "string") return data.message;
    if (typeof data.error === "string") return data.error;
  } catch {
    // پاسخ سرور JSON نبود.
  }

  if (response.status === 401) {
    return "برای افزودن محصول به سبد خرید ابتدا وارد حساب کاربری شو.";
  }

  if (response.status === 409) {
    return "موجودی محصول برای این تعداد کافی نیست.";
  }

  if (response.status === 400) {
    return "تعداد انتخاب‌شده معتبر نیست.";
  }

  return "در ارتباط با سرور مشکلی پیش آمد. دوباره تلاش کن.";
}

export function getCategories(): Promise<CategoriesResponse> {
  return request<CategoriesResponse>(`${API_BASE_URL}/categories`);
}

export function getProducts(
  params: GetProductsParams = {}
): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams();

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.category) searchParams.set("category", params.category);

  if (params.minPrice !== undefined && params.minPrice !== "") {
    searchParams.set("minPrice", String(params.minPrice));
  }

  if (params.maxPrice !== undefined && params.maxPrice !== "") {
    searchParams.set("maxPrice", String(params.maxPrice));
  }

  if (params.inStock !== undefined) {
    searchParams.set("inStock", String(params.inStock));
  }

  if (params.sort) searchParams.set("sort", params.sort);
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();

  return request<ProductsResponse>(
    `${API_BASE_URL}/products${query ? `?${query}` : ""}`
  );
}

export function getProduct(id: string | number): Promise<Product> {
  return request<Product>(
    `${API_BASE_URL}/products/${encodeURIComponent(String(id))}`
  );
}

export async function addToCart(
  productId: string | number,
  quantity: number
): Promise<AddToCartResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    throw new Error("LOGIN_REQUIRED");
  }

  const response = await fetch(`${API_BASE_URL}/me/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId: Number(productId),
      quantity,
    }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as AddToCartResponse;
}

export function getImageUrl(image: string): string {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return image.startsWith("/") ? image : `/${image}`;
}
