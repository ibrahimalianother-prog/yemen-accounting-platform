export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: Date | string) => new Date(value).toISOString().slice(0, 10);

export const statusText: Record<string, string> = {
  draft: "مسودة",
  pending: "مستحقة",
  paid: "مدفوعة",
  overdue: "متأخرة",
  posted: "مرحّل",
  cancelled: "ملغاة",
};

export function invoiceDisplayStatus(status: string, dueDate: Date | null) {
  if (status === "pending" && dueDate && dueDate.getTime() < Date.now()) return "overdue";
  return status;
}


export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
