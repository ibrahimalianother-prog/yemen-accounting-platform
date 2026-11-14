import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { formatCurrency, formatDate, invoiceDisplayStatus, statusText } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const EXPENSE_ROLES = ["owner", "accountant", "cashier", "auditor"];

export default async function DashboardPage() {
  const { companyId, company, role } = await requireCompanyContext();
  const canSeeExpenses = EXPENSE_ROLES.includes(role);

  const [paid, pending, expenseTotal, recentInvoices, recentExpenses] = await Promise.all([
    prisma.invoice.aggregate({ where: { companyId, status: "paid" }, _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ where: { companyId, status: "pending" }, _sum: { totalAmount: true } }),
    canSeeExpenses
      ? prisma.expense.aggregate({ where: { companyId, status: "posted" }, _sum: { amount: true } })
      : Promise.resolve(null),
    prisma.invoice.findMany({
      where: { companyId },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.expense.findMany({
      // take: 0 returns nothing for roles that may not see expenses, and keeps the result typed.
      where: { companyId },
      include: { vendor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: canSeeExpenses ? 5 : 0,
    }),
  ]);

  const revenue = paid._sum.totalAmount ?? 0;
  const receivables = pending._sum.totalAmount ?? 0;
  const expenses = expenseTotal?._sum.amount ?? 0;

  return (
    <AppShell title="لوحة التحكم" subtitle={`ملخص نشاط ${company.name}`}>
      <section className="summary-grid">
        <article className="summary-card">
          <span className="card-label">الإيرادات (فواتير مدفوعة)</span>
          <h2>{formatCurrency(revenue)}</h2>
        </article>
        <article className="summary-card">
          <span className="card-label">الذمم المدينة</span>
          <h2>{formatCurrency(receivables)}</h2>
        </article>
        {canSeeExpenses ? (
          <>
            <article className="summary-card">
              <span className="card-label">المصروفات المسجلة</span>
              <h2>{formatCurrency(expenses)}</h2>
            </article>
            <article className="summary-card">
              <span className="card-label">صافي الربح</span>
              <h2>{formatCurrency(revenue - expenses)}</h2>
            </article>
          </>
        ) : null}
      </section>

      <section className="report-grid" style={{ gridTemplateColumns: canSeeExpenses ? "1fr 1fr" : "1fr" }}>
        <article className="panel">
          <div className="panel-header">
            <h3>أحدث الفواتير</h3>
            <Link href="/invoices" className="table-action">
              عرض الكل
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الرقم</th>
                  <th>العميل</th>
                  <th>المجموع</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-cell">
                      لا توجد فواتير بعد.
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => {
                    const display = invoiceDisplayStatus(invoice.status, invoice.dueDate);
                    return (
                      <tr key={invoice.id}>
                        <td>{invoice.invoiceNumber}</td>
                        <td>{invoice.customer.name}</td>
                        <td>{formatCurrency(invoice.totalAmount)}</td>
                        <td>
                          <span className={`status ${display}`}>{statusText[display] ?? display}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </article>

        {canSeeExpenses ? (
          <article className="panel">
            <div className="panel-header">
              <h3>أحدث المصروفات</h3>
              <Link href="/expenses" className="table-action">
                عرض الكل
              </Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>المورد</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="empty-cell">
                        لا توجد مصروفات بعد.
                      </td>
                    </tr>
                  ) : (
                    recentExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td>{expense.vendor.name}</td>
                        <td>{formatDate(expense.expenseDate)}</td>
                        <td>{formatCurrency(expense.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        ) : null}
      </section>
    </AppShell>
  );
}
