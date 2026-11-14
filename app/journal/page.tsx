import { AppShell } from "@/components/layout/AppShell";
import { journalEntries } from "@/lib/mockData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0,
  }).format(value);

export default function JournalPage() {
  return (
    <AppShell
      title="القيود المحاسبية"
      subtitle="تتبع القيد المزدوج والتأكد من توازن الحسابات"
      actions={<button className="primary-btn">إضافة قيد</button>}
    >
      <section className="stats-inline">
        <div className="mini-stat">
          <span>إجمالي القيود</span>
          <strong>{journalEntries.length}</strong>
        </div>
        <div className="mini-stat">
          <span>معتمدة</span>
          <strong>{journalEntries.filter((item) => item.status === "approved").length}</strong>
        </div>
        <div className="mini-stat">
          <span>قيد متوازن</span>
          <strong>100%</strong>
        </div>
      </section>

      <section className="panel full-width">
        <div className="panel-header">
          <div>
            <p className="eyebrow">القيد</p>
            <h3>سجل القيود</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>رقم القيد</th>
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
      </section>
    </AppShell>
  );
}
