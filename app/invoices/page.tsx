import { AppShell } from "@/components/layout/AppShell";
import { invoices } from "@/lib/mockData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0,
  }).format(value);

export default function InvoicesPage() {
  return (
    <AppShell
      title="الفواتير"
      subtitle="إدارة الفواتير المصدرة والمستحقة وتتبع حالة الدفع"
      actions={
        <button className="primary-btn">إنشاء فاتورة</button>
      }
    >
      <section className="stats-inline">
        <div className="mini-stat">
          <span>إجمالي الفواتير</span>
          <strong>{formatCurrency(invoices.reduce((sum, item) => sum + item.total, 0))}</strong>
        </div>
        <div className="mini-stat">
          <span>مدفوعة</span>
          <strong>{invoices.filter((item) => item.status === "paid").length}</strong>
        </div>
        <div className="mini-stat">
          <span>قيد المراجعة</span>
          <strong>{invoices.filter((item) => item.status === "pending").length}</strong>
        </div>
      </section>

      <section className="panel full-width">
        <div className="panel-header">
          <div>
            <p className="eyebrow">القائمة</p>
            <h3>جميع الفواتير</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>التاريخ</th>
                <th>المجموع</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.number}>
                  <td>{invoice.number}</td>
                  <td>{invoice.customer}</td>
                  <td>{invoice.date}</td>
                  <td>{formatCurrency(invoice.total)}</td>
                  <td>
                    <span className={`status ${invoice.status}`}>{invoice.statusText}</span>
                  </td>
                  <td>
                    <button className="table-action">عرض</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
