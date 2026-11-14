import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { connectedReports, expenses, invoices, journalEntries, summaryCards } from "@/lib/mockData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0,
  }).format(value);

export default function DashboardPage() {
  return (
    <AppShell
      title="لوحة التحكم الرئيسية"
      subtitle="ملخص الأداء المالي للشركة خلال الفترة الحالية"
      actions={
        <>
          <button className="secondary-btn">تصدير</button>
          <Link href="/journal" className="primary-btn">
            إضافة قيد
          </Link>
        </>
      }
    >
      <section className="summary-grid">
        {summaryCards.map((card) => (
          <article key={card.title} className="summary-card">
            <div className="card-header">
              <span className="card-label">{card.title}</span>
              <span className={`badge ${card.trendDirection}`}>{card.trend}</span>
            </div>
            <h2>{card.value}</h2>
            <p>{card.note}</p>
          </article>
        ))}
      </section>

      <section className="panel-grid">
        <article className="panel large-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">الفواتير</p>
              <h3>الفواتير المصدرة</h3>
            </div>
            <Link href="/invoices" className="ghost-btn">
              عرض الكل
            </Link>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>العميل</th>
                  <th>التاريخ</th>
                  <th>المجموع</th>
                  <th>الحالة</th>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">المصروفات</p>
              <h3>أحدث المصروفات</h3>
            </div>
          </div>

          <div className="stack-list">
            {expenses.map((expense) => (
              <div key={expense.id} className="stack-item">
                <div>
                  <strong>{expense.category}</strong>
                  <small>{expense.vendor}</small>
                </div>
                <div className="amount-column">
                  <span>{formatCurrency(expense.amount)}</span>
                  <small>{expense.date}</small>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel-grid lower-grid">
        <article className="panel large-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">قيود اليوم</p>
              <h3>القيود المحاسبية</h3>
            </div>
            <Link href="/journal" className="ghost-btn">
              تفاصيل
            </Link>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>التاريخ</th>
                  <th>الحساب</th>
                  <th>المدين</th>
                  <th>الدائن</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.map((entry) => (
                  <tr key={entry.number}>
                    <td>{entry.number}</td>
                    <td>{entry.date}</td>
                    <td>{entry.account}</td>
                    <td>{formatCurrency(entry.debit)}</td>
                    <td>{formatCurrency(entry.credit)}</td>
                    <td>
                      <span className={`status ${entry.status}`}>{entry.statusText}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">التقارير</p>
              <h3>ملخص مالي</h3>
            </div>
          </div>

          <div className="report-stack">
            {connectedReports.map((report) => (
              <div key={report.title} className="report-card">
                <div>
                  <strong>{report.title}</strong>
                  <small>{report.period}</small>
                </div>
                <span>{report.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  );
}
