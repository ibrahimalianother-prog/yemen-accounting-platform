import { AppShell } from "@/components/layout/AppShell";
import { journalEntries } from "@/lib/mockData";

const money = (n: number) => new Intl.NumberFormat("ar-YE", { style: "currency", currency: "YER", maximumFractionDigits: 0 }).format(n);

export default function JournalDetailPage({ params }: { params: { number: string } }) {
  const entry = journalEntries.find((item) => item.number === decodeURIComponent(params.number));
  if (!entry) return <AppShell title="القيد غير موجود"><section className="panel">لم يتم العثور على القيد المطلوب.</section></AppShell>;
  return <AppShell title={`القيد ${entry.number}`} subtitle="تفاصيل القيد المحاسبي النموذجي">
    <section className="panel"><div className="panel-header"><h3>ملخص القيد</h3><span className={`status ${entry.status}`}>{entry.statusText}</span></div>
      <div className="detail-grid"><div><small>التاريخ</small><strong>{entry.date}</strong></div><div><small>الحسابات</small><strong>{entry.account}</strong></div><div><small>المدين</small><strong>{money(entry.debit)}</strong></div><div><small>الدائن</small><strong>{money(entry.credit)}</strong></div></div>
      <p className="notice">البيانات الحالية للعرض فقط. القيود المنشورة في نظام إنتاج يجب أن تكون مزدوجة ومتوازنة وغير قابلة للحذف الصامت.</p>
    </section>
  </AppShell>;
}
