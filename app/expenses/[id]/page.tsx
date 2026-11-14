import { AppShell } from "@/components/layout/AppShell";
import { expenses } from "@/lib/mockData";

const money = (n: number) => new Intl.NumberFormat("ar-YE", { style: "currency", currency: "YER", maximumFractionDigits: 0 }).format(n);

export default function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const expense = expenses.find((item) => String(item.id) === params.id);
  if (!expense) return <AppShell title="المصروف غير موجود"><section className="panel">لم يتم العثور على المصروف المطلوب.</section></AppShell>;
  return <AppShell title={`مصروف #${expense.id}`} subtitle="تفاصيل مصروف نموذجي">
    <section className="panel"><div className="panel-header"><h3>بيانات المصروف</h3><span className="status paid">مسجل</span></div>
      <div className="detail-grid"><div><small>الفئة</small><strong>{expense.category}</strong></div><div><small>المورد</small><strong>{expense.vendor}</strong></div><div><small>التاريخ</small><strong>{expense.date}</strong></div><div><small>المبلغ</small><strong>{money(expense.amount)}</strong></div></div>
      <p className="notice">هذه بيانات تجريبية ثابتة وليست سجلًا ماليًا دائمًا.</p>
    </section>
  </AppShell>;
}
