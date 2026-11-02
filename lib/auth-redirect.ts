const AUTH_PATHS = ["/login", "/register"];

/**
 * مسیر بازگشت (`next`) را فقط وقتی می‌پذیرد که یک مسیر داخلی امن باشد؛
 * از Open Redirect به سایت‌های بیرونی جلوگیری می‌کند.
 */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/shop",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  if (AUTH_PATHS.some((path) => value === path || value.startsWith(`${path}?`))) {
    return fallback;
  }

  return value;
}

export function loginHref(next?: string): string {
  const safe = safeNextPath(next, "");
  return safe ? `/login?next=${encodeURIComponent(safe)}` : "/login";
}

export function registerHref(next?: string): string {
  const safe = safeNextPath(next, "");
  return safe ? `/register?next=${encodeURIComponent(safe)}` : "/register";
}

/** مسیر فعلی همراه با query؛ فقط داخل رویدادهای سمت کاربر استفاده شود. */
export function currentPathWithQuery(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}
