const numberFormatter = new Intl.NumberFormat("fa-IR");

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
});

export function formatNumber(value: number | string | null | undefined): string {
  const number = Number(value);
  return numberFormatter.format(Number.isFinite(number) ? number : 0);
}

export function formatToman(value: number | string | null | undefined): string {
  return `${formatNumber(value)} تومان`;
}

/** تاریخ ISO را به تاریخ شمسی تبدیل می‌کند؛ برای مقدار نامعتبر رشتهٔ خالی برمی‌گرداند. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

/** ارقام فارسی و عربی را به ارقام لاتین تبدیل می‌کند (برای اعتبارسنجی شماره موبایل). */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660),
    );
}

/** شناسهٔ سفارش: عددی با ارقام فارسی، در غیر این صورت همان متن. */
export function formatOrderId(id: number | string): string {
  return Number.isFinite(Number(id)) && String(id).trim() !== ""
    ? formatNumber(id)
    : String(id);
}
