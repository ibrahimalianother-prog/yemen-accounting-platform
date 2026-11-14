import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { CategoryForm } from "@/components/forms/CategoryForm";
import { CategoryAccountSelect } from "@/components/forms/CategoryAccountSelect";
import { ensureDefaultAccounts } from "@/lib/accounting";
import { formatCurrency, formatDate, statusText } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const WRITE_ROLES = ["owner", "accountant", "cashier"];

export default async function ExpensesPage() {
  const { companyId, role } = await requireCompanyContext(["owner", "accountant", "cashier", "auditor"]);

  const canManageCategories = ["owner", "accountant"].includes(role);
  if (canManageCategories) await ensureDefaultAccounts(prisma, companyId);

  const [expenses, vendors, categories, expenseAccounts] = await Promise.all([
    prisma.expense.findMany({
      where: { companyId },
      include: { vendor: { select: { name: true } }, category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    // take: 0 returns nothing for roles that may not write, and keeps the result typed.
    prisma.vendor.findMany({
      where: { companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: WRITE_ROLES.includes(role) ? undefined : 0,
    }),
    prisma.expenseCategory.findMany({
      where: { OR: [{ companyId }, { companyId: null }] },
      select: { id: true, name: true, companyId: true, accountCode: true },
      orderBy: { name: "asc" },
      take: WRITE_ROLES.includes(role) ? undefined : 0,
    }),
    prisma.account.findMany({
      where: { companyId, type: "expense", isActive: true },
      select: { code: true, name: true },
      orderBy: { code: "asc" },
      take: canManageCategories ? undefined : 0,
    }),
  ]);

  const active = expenses.filter((item) => item.status !== "cancelled");
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const thisMonth = active.filter((item) => item.expenseDate >= monthStart);

  return (
    <AppShell title="المصروفات" subtitle="متابعة المصروفات والموردين">
      <section className="stats-inline">
        <div className="mini-stat">
          <span>إجمالي المصروفات</span>
          <strong>{formatCurrency(active.reduce((sum, item) => sum + item.amount, 0))}</strong>
        </div>
        <div className="mini-stat">
          <span>عدد المصروفات</span>
          <strong>{active.length}</strong>
        </div>
        <div className="mini-stat">
          <span>مصروفات هذا الشهر</span>
          <strong>{formatCurrency(thisMonth.reduce((sum, item) => sum + item.amount, 0))}</strong>
        </div>
      </section>

      {WRITE_ROLES.includes(role) ? (
        <ExpenseForm vendors={vendors} categories={categories.map(({ id, name }) => ({ id, name }))} />
      ) : null}
      {canManageCategories ? <CategoryForm /> : null}

      {canManageCategories && categories.length > 0 ? (
        <section className="panel full-width" style={{ marginBottom: 18 }}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">الفئات</p>
              <h3>ربط الفئات بحسابات المصروفات</h3>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الفئة</th>
                  <th>حساب المصروف عند الترحيل</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>
                      {category.companyId ? (
                        <CategoryAccountSelect
                          categoryId={category.id}
                          accountCode={category.accountCode}
                          accounts={expenseAccounts}
                        />
                      ) : (
                        "المصروفات العامة (فئة مشتركة)"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

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
                <th>الرقم</th>
                <th>الفئة</th>
                <th>المورد</th>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    لا توجد مصروفات حتى الآن.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.expenseNumber}</td>
                    <td>{expense.category?.name ?? "-"}</td>
                    <td>{expense.vendor.name}</td>
                    <td>{formatDate(expense.expenseDate)}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>
                      <span className={`status ${expense.status}`}>{statusText[expense.status] ?? expense.status}</span>
                    </td>
                    <td>
                      <Link className="table-action" href={`/expenses/${expense.id}`}>
                        عرض
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
