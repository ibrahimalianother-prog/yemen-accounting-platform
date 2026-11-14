import { AppShell } from "@/components/layout/AppShell";
import { expenses } from "@/lib/mockData";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-YE", {
    style: "currency",
    currency: "YER",
    maximumFractionDigits: 0,
  }).format(value);

export default function ExpensesPage() {
  return (
    <AppShell
      title="المصروفات"
      subtitle="متابعة المصروفات والفئات والجهات الداعمة"
      actions={<button className="primary-btn">إضافة مصروف</button>}
    >
      <section className="stats-inline">
        <div className="mini-stat">
          <span>إجمالي المصروفات</span>
          <strong>{formatCurrency(expenses.reduce((sum, item) => sum + item.amount, 0))}</strong>
        </div>
        <div className="mini-stat">
          <span>فئات</span>
          <strong>{new Set(expenses.map((item) => item.category)).size}</strong>
        </div>
        <div className="mini-stat">
          <span>مستحق هذا الشهر</span>
          <strong>{formatCurrency(680000)}</strong>
        </div>
      </section>

      <section className="panel full-width">
        <div className="panel-header">
          <div>
            <p className="eyebrow">القائمة</p>
            <h3>سجل المصروفات</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الفئة</th>
                <th>الجهة</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.category}</td>
                  <td>{expense.vendor}</td>
                  <td>{expense.date}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>
                    <span className="status paid">مؤكد</span>
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
