export interface StatusInfo {
  label: string;
  className: string;
}

/** برچسب و رنگ وضعیت سفارش؛ وضعیت ناشناخته به «در انتظار پرداخت» نسبت داده نمی‌شود. */
export function getStatusInfo(status: string): StatusInfo {
  switch (status) {
    case "paid":
      return { label: "پرداخت شده", className: "bg-green-100 text-green-700" };
    case "cancelled":
      return { label: "لغو شده", className: "bg-red-100 text-red-700" };
    case "pending":
      return {
        label: "در انتظار پرداخت",
        className: "bg-yellow-100 text-yellow-800",
      };
    default:
      return {
        label: status || "نامشخص",
        className: "bg-gray-100 text-gray-700",
      };
  }
}
