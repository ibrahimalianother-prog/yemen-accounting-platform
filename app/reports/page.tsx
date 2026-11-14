import { AppShell } from "@/components/layout/AppShell";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { companyId } = await requireCompanyContext(["owner", "accountant", "auditor"]);

  const [paid, pending, expenseTotal, trialBalance] = await Promise.all([
    prisma.invoice.aggregate({ where: { companyId, status: "paid" }, _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ where: { companyId, status: "pending" }, _sum: { totalAmount: true } }),
    prisma.expense.aggregate({ where: { companyId, status: "posted" }, _sum: { amount: true } }),
    prisma.journalEntryLine.groupBy({
      by: ["accountCode", "accountName"],
      where: { journalEntry: { companyId, status: "posted" } },
      _sum: { debit: true, credit: true },
      orderBy: { accountCode: "asc" },
    }),
  ]);

  const revenue = paid._sum.totalAmount ?? 0;
  const receivables = pending._sum.totalAmount ?? 0;
  const expenses = expenseTotal._sum.amount ?? 0;
  const totalDebit = trialBalance.reduce((sum, row) => sum + (row._sum.debit ?? 0), 0);
  const totalCredit = trialBalance.reduce((sum, row) => sum + (row._sum.credit ?? 0), 0);

  return (
    <AppShell title="التقارير" subtitle="ملخص مالي محسوب من الفواتير والمصروفات والقيود المرحّلة">
      <section className="stats-inline">
        <div className="mini-stat">
          <span>الإيرادات (فواتير مدفوعة)</span>
          <strong>{formatCurrency(revenue)}</strong>
        </div>
        <div className="mini-stat">
          <span>المصروفات المسجلة</span>
          <strong>{formatCurrency(expenses)}</strong>
        </div>
        <div className="mini-stat">
          <span>صافي الربح</span>
          <strong>{formatCurrency(revenue - expenses)}</strong>
        </div>
      </section>

      <section className="panel full-width" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <div>
            <p className="eyebrow">التقارير</p>
            <h3>ميزان المراجعة (القيود المرحّلة)</h3>
          </div>
          <span className={`status ${totalDebit === totalCredit ? "paid" : "overdue"}`}>
            {totalDebit === totalCredit ? "متوازن" : "غير متوازن"}
          </span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>رمز الحساب</th>
                <th>اسم الحساب</th>
                <th>المدين</th>
                <th>الدائن</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    لا توجد قيود مرحّلة حتى الآن.
                  </td>
                </tr>
              ) : (
                trialBalance.map((row) => (
                  <tr key={`${row.accountCode}-${row.accountName}`}>
                    <td>{row.accountCode}</td>
                    <td>{row.accountName}</td>
                    <td>{formatCurrency(row._sum.debit ?? 0)}</td>
                    <td>{formatCurrency(row._sum.credit ?? 0)}</td>
                  </tr>
                ))
              )}
              {trialBalance.length > 0 ? (
                <tr>
                  <th colSpan={2}>الإجمالي</th>
                  <th>{formatCurrency(totalDebit)}</th>
                  <th>{formatCurrency(totalCredit)}</th>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-grid">
        <article className="panel">
          <div className="panel-header">
            <h3>قائمة الدخل</h3>
          </div>
          <p className="report-body">
            الإيرادات {formatCurrency(revenue)}، المصروفات {formatCurrency(expenses)}، وصافي الربح{" "}
            {formatCurrency(revenue - expenses)}.
          </p>
        </article>
        <article className="panel">
          <div className="panel-header">
            <h3>الذمم المدينة</h3>
          </div>
          <p className="report-body">إجمالي الفواتير المستحقة غير المسددة {formatCurrency(receivables)}.</p>
        </article>
      </section>
    </AppShell>
  );
}
