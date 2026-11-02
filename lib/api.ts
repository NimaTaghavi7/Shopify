
import type {
  CategoriesResponse,
  ProductsResponse,
  Product,
} from "@/types/shop";

const API_BASE_URL = "https://practice.amirm.me";

export interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  inStock?: boolean;
  sort?: "newest" | "price" | "-price" | "name";
  page?: number;
  limit?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface Order {
  id: number | string;
  status: "pending" | "paid" | "cancelled" | string;
  fullName?: string;
  phone?: string;
  address?: string;
  items?: CartItem[];
  totalPrice?: number;
  total?: number;
  created_at?: string;
  createdAt?: string;
}

export interface CreateOrderData {
  fullName: string;
  phone: string;
  address: string;
}

export interface ApiError extends Error {
  status?: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function createError(message: string, status?: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

function buildQuery(params: GetProductsParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const token = getToken();

    if (!token) {
      throw createError("برای ادامه ابتدا وارد حساب کاربری شو.", 401);
    }

    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw createError(
      "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کن.",
    );
  }

  if (!response.ok) {
    let message = "درخواست ناموفق بود. دوباره تلاش کن.";

    try {
      const data = await response.json();

      if (typeof data.message === "string") {
        message = data.message;
      } else if (typeof data.error === "string") {
        message = data.error;
      } else if (typeof data.errors?.[0]?.message === "string") {
        message = data.errors[0].message;
      }
    } catch {
      // پاسخ خطا JSON نبود.
    }

    if (response.status === 401) {
      message = "نشست کاربری معتبر نیست. دوباره وارد شو.";
    } else if (response.status === 404) {
      message = "اطلاعات موردنظر پیدا نشد.";
    } else if (response.status === 409) {
      message = "موجودی محصول یا وضعیت سفارش تغییر کرده است.";
    } else if (response.status === 400) {
      message = "اطلاعات ارسال‌شده معتبر نیست.";
    } else if (response.status >= 500) {
      message = "خطایی در سرور رخ داده است.";
    }

    throw createError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function unwrap<T>(result: T | { data: T }): T {
  if (
    result !== null &&
    typeof result === "object" &&
    "data" in result
  ) {
    return (result as { data: T }).data;
  }

  return result as T;
}

// Categories

export function getCategories(): Promise<CategoriesResponse> {
  return request<CategoriesResponse>("/categories");
}

// Products

export function getProducts(
  params: GetProductsParams = {},
): Promise<ProductsResponse> {
  return request<ProductsResponse>(
    `/products${buildQuery(params)}`,
  );
}

export async function getProduct(
  id: string | number,
): Promise<Product> {
  const result = await request<Product | { data: Product }>(
    `/products/${encodeURIComponent(String(id))}`,
  );

  return unwrap(result);
}

// Cart

export async function getCart(): Promise<Cart> {
  const result = await request<Cart | { data: Cart }>(
    "/me/cart",
    {},
    true,
  );

  return unwrap(result);
}

export async function addToCart(
  productId: string | number,
  quantity: number,
): Promise<Cart> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createError("تعداد محصول معتبر نیست.", 400);
  }

  await request(
    "/me/cart/items",
    {
      method: "POST",
      body: JSON.stringify({
        productId: Number(productId),
        quantity,
      }),
    },
    true,
  );

  return getCart();
}

export async function updateCartItem(
  productId: string | number,
  quantity: number,
): Promise<Cart> {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw createError("تعداد محصول معتبر نیست.", 400);
  }

  await request(
    `/me/cart/items/${encodeURIComponent(String(productId))}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
    true,
  );

  return getCart();
}

export async function removeCartItem(
  productId: string | number,
): Promise<Cart> {
  await request(
    `/me/cart/items/${encodeURIComponent(String(productId))}`,
    { method: "DELETE" },
    true,
  );

  return getCart();
}

export function clearCart(): Promise<void> {
  return request<void>(
    "/me/cart",
    { method: "DELETE" },
    true,
  );
}

// Orders

export async function createOrder(
  data: CreateOrderData,
): Promise<Order> {
  const result = await request<Order | { data: Order }>(
    "/me/orders",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true,
  );

  return unwrap(result);
}

export async function getOrders(): Promise<Order[]> {
  const result = await request<Order[] | { data: Order[] }>(
    "/me/orders",
    {},
    true,
  );

  return unwrap(result);
}

export async function getOrder(
  id: string | number,
): Promise<Order> {
  const result = await request<Order | { data: Order }>(
    `/me/orders/${encodeURIComponent(String(id))}`,
    {},
    true,
  );

  return unwrap(result);
}

export async function payOrder(
  id: string | number,
): Promise<Order> {
  await request(
    `/me/orders/${encodeURIComponent(String(id))}/pay`,
    { method: "POST" },
    true,
  );

  return getOrder(id);
}

export async function cancelOrder(
  id: string | number,
): Promise<Order> {
  await request(
    `/me/orders/${encodeURIComponent(String(id))}/cancel`,
    { method: "POST" },
    true,
  );

  return getOrder(id);
}

// Helpers

export function getImageUrl(image: string): string {
  if (!image) return "";

  if (/^https?:\/\//i.test(image)) {
    return image;
  }

  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
}

export function formatPrice(price: number): string {
  return `${Number(price || 0).toLocaleString("fa-IR")} تومان`;
}
