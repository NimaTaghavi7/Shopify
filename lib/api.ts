import type {
  CategoriesResponse,
  ProductsResponse,
  Product,
} from "@/types/shop";

const API_BASE_URL = "https://practice.amirm.me";
const TOKEN_KEY = "token";

/** رویدادی که هنگام نامعتبر شدن توکن (۴۰۱ در درخواست احراز‌هویت‌شده) ارسال می‌شود. */
export const UNAUTHORIZED_EVENT = "shop:unauthorized";

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

export interface AuthUser {
  id: number;
  username: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  expires_at: string;
  user: AuthUser;
}

type StatusMessages = Partial<Record<number, string>>;

interface RequestConfig {
  /** درخواست باید توکن کاربر را داشته باشد. */
  authenticated?: boolean;
  /** پیام فارسی اختصاصی برای کدهای وضعیت همین درخواست. */
  messages?: StatusMessages;
}

const DEFAULT_ERROR_MESSAGE = "درخواست ناموفق بود. دوباره تلاش کن.";

const DEFAULT_STATUS_MESSAGES: StatusMessages = {
  400: "اطلاعات ارسال‌شده معتبر نیست.",
  401: "نشست کاربری معتبر نیست. دوباره وارد شو.",
  404: "اطلاعات موردنظر پیدا نشد.",
  409: "موجودی محصول یا وضعیت سفارش تغییر کرده است.",
};

// ---------------------------------------------------------------------------
// توکن و خطا
// ---------------------------------------------------------------------------

function getToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    throw createError(
      "ذخیره نشست ورود در مرورگر ممکن نیست. حالت خصوصی یا محدودیت‌های مرورگر را بررسی کن.",
    );
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // دسترسی به localStorage ممکن نیست؛ چیزی برای پاک کردن نیست.
  }
}

export function hasToken(): boolean {
  return Boolean(getToken());
}

function createError(message: string, status?: number): ApiError {
  const error = new Error(message) as ApiError;
  error.status = status;
  return error;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

// ---------------------------------------------------------------------------
// درخواست پایه
// ---------------------------------------------------------------------------

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
  config: RequestConfig = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (config.authenticated) {
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
    let message = DEFAULT_ERROR_MESSAGE;

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

    const override =
      config.messages?.[response.status] ??
      DEFAULT_STATUS_MESSAGES[response.status];

    if (override) {
      message = override;
    } else if (response.status >= 500) {
      message = "خطایی در سرور رخ داده است.";
    }

    // توکن منقضی یا نامعتبر: نشست محلی پاک می‌شود و بقیه برنامه خبردار می‌شود.
    if (response.status === 401 && config.authenticated) {
      clearToken();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
      }
    }

    throw createError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function unwrap<T>(result: T | { data: T }): T {
  if (result !== null && typeof result === "object" && "data" in result) {
    return (result as { data: T }).data;
  }

  return result as T;
}

// ---------------------------------------------------------------------------
// دسته‌بندی‌ها
// ---------------------------------------------------------------------------

export function getCategories(): Promise<CategoriesResponse> {
  return request<CategoriesResponse>("/categories");
}

let categoriesPromise: Promise<CategoriesResponse> | null = null;

/** دسته‌بندی‌ها را یک‌بار می‌گیرد و بین هدر، فروشگاه و صفحهٔ اصلی به‌اشتراک می‌گذارد. */
export function getCategoriesCached(): Promise<CategoriesResponse> {
  if (!categoriesPromise) {
    categoriesPromise = getCategories().catch((error: unknown) => {
      categoriesPromise = null;
      throw error;
    });
  }

  return categoriesPromise;
}

// ---------------------------------------------------------------------------
// محصولات
// ---------------------------------------------------------------------------

export function getProducts(
  params: GetProductsParams = {},
): Promise<ProductsResponse> {
  return request<ProductsResponse>(`/products${buildQuery(params)}`);
}

export async function getProduct(id: string | number): Promise<Product> {
  const result = await request<Product | { data: Product }>(
    `/products/${encodeURIComponent(String(id))}`,
  );

  return unwrap(result);
}

// ---------------------------------------------------------------------------
// سبد خرید
// ---------------------------------------------------------------------------

/** پاسخ سبد را ایمن می‌کند: آیتم‌های بدون محصول (مثلاً محصول حذف‌شده) کنار گذاشته می‌شوند. */
function normalizeCart(raw: unknown): Cart {
  const source = (raw && typeof raw === "object" ? raw : {}) as Partial<Cart>;

  const items = (Array.isArray(source.items) ? source.items : [])
    .filter((item): item is CartItem =>
      Boolean(item && item.product && item.product.id !== undefined),
    )
    .map((item) => {
      const quantity = Number(item.quantity) || 0;
      const subtotal =
        Number(item.subtotal) || Number(item.product.price || 0) * quantity;

      return { ...item, quantity, subtotal };
    });

  const totalItems =
    Number(source.totalItems) ||
    items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice =
    Number(source.totalPrice) ||
    items.reduce((sum, item) => sum + item.subtotal, 0);

  return { items, totalItems, totalPrice };
}

const STOCK_MESSAGE = "موجودی این محصول برای تعداد درخواستی کافی نیست.";

export async function getCart(): Promise<Cart> {
  const result = await request<Cart | { data: Cart }>(
    "/me/cart",
    {},
    { authenticated: true },
  );

  return normalizeCart(unwrap(result));
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
      body: JSON.stringify({ productId: Number(productId), quantity }),
    },
    { authenticated: true, messages: { 409: STOCK_MESSAGE } },
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
    { authenticated: true, messages: { 409: STOCK_MESSAGE } },
  );

  return getCart();
}

export async function removeCartItem(
  productId: string | number,
): Promise<Cart> {
  await request(
    `/me/cart/items/${encodeURIComponent(String(productId))}`,
    { method: "DELETE" },
    { authenticated: true },
  );

  return getCart();
}

export function clearCart(): Promise<void> {
  return request<void>("/me/cart", { method: "DELETE" }, { authenticated: true });
}

// ---------------------------------------------------------------------------
// سفارش‌ها
// ---------------------------------------------------------------------------

export async function createOrder(data: CreateOrderData): Promise<Order> {
  const result = await request<Order | { data: Order }>(
    "/me/orders",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    {
      authenticated: true,
      messages: {
        400: "اطلاعات سفارش یا سبد خرید معتبر نیست. فیلدها و سبد خرید را بررسی کن.",
        409: "موجودی بعضی محصولات تغییر کرده است. سبد خرید را بررسی کن و دوباره تلاش کن.",
      },
    },
  );

  return unwrap(result);
}

export async function getOrders(): Promise<Order[]> {
  const result = await request<Order[] | { data: Order[] }>(
    "/me/orders",
    {},
    { authenticated: true },
  );

  const orders = unwrap(result);
  return Array.isArray(orders) ? orders : [];
}

export async function getOrder(id: string | number): Promise<Order> {
  const result = await request<Order | { data: Order }>(
    `/me/orders/${encodeURIComponent(String(id))}`,
    {},
    { authenticated: true, messages: { 404: "سفارش موردنظر پیدا نشد." } },
  );

  return unwrap(result);
}

export async function payOrder(id: string | number): Promise<Order> {
  await request(
    `/me/orders/${encodeURIComponent(String(id))}/pay`,
    { method: "POST" },
    {
      authenticated: true,
      messages: { 409: "وضعیت این سفارش تغییر کرده و پرداخت آن ممکن نیست." },
    },
  );

  return getOrder(id);
}

export async function cancelOrder(id: string | number): Promise<Order> {
  await request(
    `/me/orders/${encodeURIComponent(String(id))}/cancel`,
    { method: "POST" },
    {
      authenticated: true,
      messages: { 409: "وضعیت این سفارش تغییر کرده و لغو آن ممکن نیست." },
    },
  );

  return getOrder(id);
}

// ---------------------------------------------------------------------------
// احراز هویت
// ---------------------------------------------------------------------------

export async function loginUser(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const result = await request<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    {
      messages: {
        400: "نام کاربری و رمز عبور را بررسی کن.",
        401: "نام کاربری یا رمز عبور اشتباه است.",
      },
    },
  );

  if (!result.token) {
    throw createError("توکن ورود از سرور دریافت نشد.");
  }

  setToken(result.token);

  return result;
}

export async function registerUser(
  username: string,
  password: string,
): Promise<AuthResponse> {
  await request(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    {
      messages: {
        400: "نام کاربری یا رمز عبور معتبر نیست. نام کاربری را کمی تغییر بده یا رمز طولانی‌تری انتخاب کن.",
        409: "این نام کاربری قبلاً ثبت شده است. نام دیگری انتخاب کن.",
      },
    },
  );

  try {
    return await loginUser(username, password);
  } catch (error) {
    throw createError(
      `حساب ساخته شد، اما ورود خودکار انجام نشد: ${getErrorMessage(error, "دوباره وارد شو.")}`,
      getErrorStatus(error),
    );
  }
}

export function getCurrentUser(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me", {}, { authenticated: true });
}

/** خروج همیشه نشست محلی را پاک می‌کند، حتی اگر درخواست خروج به سرور نرسد. */
export async function logoutUser(): Promise<void> {
  try {
    await request("/auth/logout", { method: "POST" }, { authenticated: true });
  } catch {
    // خطای شبکه یا توکن منقضی مانع خروج کاربر نمی‌شود.
  } finally {
    clearToken();
  }
}
