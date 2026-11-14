export type SummaryCard = {
  title: string;
  value: string;
  note: string;
  trend: string;
  trendDirection: "up" | "down";
};

export type Invoice = {
  number: string;
  customer: string;
  date: string;
  total: number;
  status: "paid" | "pending" | "overdue";
  statusText: string;
};

export type Expense = {
  id: number;
  category: string;
  vendor: string;
  date: string;
  amount: number;
};

export type JournalEntry = {
  number: string;
  date: string;
  account: string;
  debit: number;
  credit: number;
  status: "approved" | "review";
  statusText: string;
};

export type Customer = { id: string; name: string; phone: string; email: string; balance: number };
export type Vendor = { id: string; name: string; phone: string; email: string; balance: number };

export const summaryCards: SummaryCard[] = [
  { title: "إيرادات الشهر", value: "٤٬٢٠٠٬٠٠٠ ر.ي", note: "مقارنة بالشهر السابق", trend: "+١٢.٤٪", trendDirection: "up" },
  { title: "المصروفات", value: "٢٬٨٦٠٬٠٠٠ ر.ي", note: "إجمالي المصروفات المسجلة", trend: "-٣.١٪", trendDirection: "down" },
  { title: "صافي الربح", value: "١٬٣٤٠٬٠٠٠ ر.ي", note: "إيرادات ناقص المصروفات", trend: "+٩.٣٪", trendDirection: "up" },
  { title: "الذمم المدينة", value: "٦٤٠٬٠٠٠ ر.ي", note: "رصيد الفواتير غير المسددة", trend: "متابعة", trendDirection: "up" },
];

export const invoices: Invoice[] = [
  { number: "INV-2401", customer: "مؤسسة النور للتجارة", date: "2026-11-12", total: 950000, status: "paid", statusText: "مدفوعة" },
  { number: "INV-2402", customer: "شركة الأمل للمواد الغذائية", date: "2026-11-08", total: 720000, status: "pending", statusText: "مستحقة" },
  { number: "INV-2403", customer: "مركز المدينة للأجهزة", date: "2026-11-05", total: 1360000, status: "overdue", statusText: "متأخرة" },
  { number: "INV-2404", customer: "شركة أمان للإنشاءات", date: "2026-11-02", total: 850000, status: "paid", statusText: "مدفوعة" },
];

export const expenses: Expense[] = [
  { id: 1, category: "إيجار", vendor: "مكتب العمران", date: "2026-11-10", amount: 250000 },
  { id: 2, category: "مشتريات", vendor: "محل الرفعة", date: "2026-11-09", amount: 430000 },
  { id: 3, category: "رواتب", vendor: "إدارة الموارد البشرية", date: "2026-11-07", amount: 620000 },
  { id: 4, category: "نقل", vendor: "شركة النقل السريع", date: "2026-11-04", amount: 120000 },
];

export const journalEntries: JournalEntry[] = [
  { number: "JNL-1101", date: "2026-11-12", account: "الصندوق / النقدية", debit: 520000, credit: 520000, status: "approved", statusText: "معتمد" },
  { number: "JNL-1102", date: "2026-11-11", account: "المشتريات / الصندوق", debit: 450000, credit: 450000, status: "approved", statusText: "معتمد" },
  { number: "JNL-1103", date: "2026-11-10", account: "المصروفات الإدارية / الصندوق", debit: 180000, credit: 180000, status: "review", statusText: "قيد المراجعة" },
  { number: "JNL-1104", date: "2026-11-09", account: "الذمم المدينة / الإيرادات", debit: 610000, credit: 610000, status: "approved", statusText: "معتمد" },
];

export const customers: Customer[] = [
  { id: "CUS-001", name: "مؤسسة النور للتجارة", phone: "+967 1 234 567", email: "alnoor@example.com", balance: 0 },
  { id: "CUS-002", name: "شركة الأمل للمواد الغذائية", phone: "+967 1 345 678", email: "alamal@example.com", balance: 720000 },
  { id: "CUS-003", name: "مركز المدينة للأجهزة", phone: "+967 1 456 789", email: "city@example.com", balance: 1360000 },
  { id: "CUS-004", name: "شركة أمان للإنشاءات", phone: "+967 1 567 890", email: "aman@example.com", balance: 0 },
];

export const vendors: Vendor[] = [
  { id: "VEN-001", name: "مكتب العمران", phone: "+967 1 221 100", email: "omran@example.com", balance: 250000 },
  { id: "VEN-002", name: "محل الرفعة", phone: "+967 1 222 200", email: "rifaa@example.com", balance: 430000 },
  { id: "VEN-003", name: "شركة النقل السريع", phone: "+967 1 333 300", email: "fast@example.com", balance: 120000 },
];

export const connectedReports = [
  { title: "ميزان المراجعة", period: "نوفمبر 2026", value: "عرض التقرير" },
  { title: "قائمة الدخل", period: "الفترة الحالية", value: "عرض التقرير" },
  { title: "المركز المالي", period: "حتى تاريخه", value: "عرض التقرير" },
];
