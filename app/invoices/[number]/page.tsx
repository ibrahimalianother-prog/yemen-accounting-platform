import { AppShell } from "@/components/layout/AppShell";
import { invoices } from "@/lib/mockData";

const money = (n: number) => new Intl.NumberFormat("ar-YE", { style: "currency", currency: "YER", maximumFractionDigits: 0 }).format(n);

export default function InvoiceDetailPage({ params }: { params: { number: string } }) {
  const invoice = invoices.find((item) => item.number === decodeURIComponent(params.number));
  if (!invoice) return <AppShell title="الفاتورة غير موجودة"><section className="panel">لم يتم العثور على الفاتورة المطلوبة.</section></AppShell>;
  return <AppShell title={`الفاتورة ${invoice.number}`} subtitle="تفاصيل فاتورة نموذجية للعرض والتطوير">
    <section className="stats-inline">
      <div className="mini-stat"><span>العميل</span><strong>{invoice.customer}</strong></div>
      <div className="mini-stat"><span>تاريخ الإصدار</span><strong>{invoice.date}</strong></div>
      <div className="mini-stat"><span>الإجمالي</span><strong>{money(invoice.total)}</strong></div>
    </section>
    <section className="panel"><div className="panel-header"><h3>بيانات الفاتورة</h3><span className={`status ${invoice.status}`}>{invoice.statusText}</span></div>
      <div className="detail-grid"><div><small>رقم الفاتورة</small><strong>{invoice.number}</strong></div><div><small>العميل</small><strong>{invoice.customer}</strong></div><div><small>الحالة</small><strong>{invoice.statusText}</strong></div><div><small>العملة</small><strong>ريال يمني (YER)</strong></div></div>
      <p className="notice">هذه بيانات تجريبية ثابتة؛ لا تمثل فاتورة قانونية ولا تُرحّل إلى دفتر أستاذ.</p>
    </section>
  </AppShell>;
}
