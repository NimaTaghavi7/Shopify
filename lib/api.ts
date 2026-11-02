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

function buildQuery(params: Record<string, unknown>): string {
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
      const error = new Error("برای ادامه ابتدا وارد حساب کاربری شو.") as ApiError;
      error.status = 401;
      throw error;
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
    throw new Error("ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کن.");
  }

  if (!response.ok) {
    let message = "درخواست ناموفق بود. دوباره تلاش کن.";

    try {
      const data = await response.json();
      message =
        data.message ||
        data.error ||
        data.errors?.[0]?.message ||
        message;
    } catch {
      if (response.status === 401) {
        message = "نشست کاربری معتبر نیست. دوباره وارد شو.";
      } else if (response.status === 404) {
        message = "اطلاعات موردنظر پیدا نشد.";
      } else if (response.status === 409) {
        message = "موجودی محصول کافی نیست.";
      } else if (response.status === 400) {
        message = "اطلاعات ارسال‌شده معتبر نیست.";
      } else if (response.status >= 500) {
        message = "خطایی در سرور رخ داده است.";
      }
    }

    const error = new Error(message) as ApiError;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getCategories(): Promise<CategoriesResponse> {
  return request<CategoriesResponse>("/categories");
}

export function getProducts(
  params: GetProductsParams = {},
): Promise<ProductsResponse> {
  return request<ProductsResponse>(
    `/products${buildQuery(params)}`,
  );
}

export function getProduct(id: string | number): Promise<Product> {
  return request<Product>(
    `/products/${encodeURIComponent(String(id))}`,
  );
}

export function getCart(): Promise<Cart> {
  return request<Cart>("/me/cart", {}, true);
}

export function addToCart(
  productId: string | number,
  quantity: number,
): Promise<Cart> {
  return request<Cart>(
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
}

export function updateCartItem(
  productId: string | number,
  quantity: number,
): Promise<Cart> {
  return request<Cart>(
    `/me/cart/items/${encodeURIComponent(String(productId))}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
    true,
  );
}

export function removeCartItem(
  productId: string | number,
): Promise<Cart> {
  return request<Cart>(
    `/me/cart/items/${encodeURIComponent(String(productId))}`,
    { method: "DELETE" },
    true,
  );
}

export function clearCart(): Promise<void> {
  return request<void>(
    "/me/cart",
    { method: "DELETE" },
    true,
  );
}

export function createOrder(data: CreateOrderData): Promise<Order> {
  return request<Order>(
    "/me/orders",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    true,
  );
}

export function getOrders(): Promise<Order[]> {
  return request<Order[]>("/me/orders", {}, true);
}

export function getOrder(id: string | number): Promise<Order> {
  return request<Order>(
    `/me/orders/${encodeURIComponent(String(id))}`,
    {},
    true,
  );
}

export function payOrder(id: string | number): Promise<Order> {
  return request<Order>(
    `/me/orders/${encodeURIComponent(String(id))}/pay`,
    { method: "POST" },
    true,
  );
}

export function cancelOrder(id: string | number): Promise<Order> {
  return request<Order>(
    `/me/orders/${encodeURIComponent(String(id))}/cancel`,
    { method: "POST" },
    true,
  );
}

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
