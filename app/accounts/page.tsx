import { AppShell } from "@/components/layout/AppShell";
import { AccountForm } from "@/components/forms/AccountForm";
import { BackfillButton } from "@/components/forms/BackfillButton";
import { ensureDefaultAccounts } from "@/lib/accounting";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const typeLabels: Record<string, string> = {
  asset: "أصول",
  liability: "خصوم",
  equity: "حقوق ملكية",
  income: "إيرادات",
  expense: "مصروفات",
};

export default async function AccountsPage() {
  const { companyId, role } = await requireCompanyContext(["owner", "accountant", "cashier", "auditor"]);

  await ensureDefaultAccounts(prisma, companyId);

  const [accounts, totals] = await Promise.all([
    prisma.account.findMany({ where: { companyId }, orderBy: { code: "asc" } }),
    prisma.journalEntryLine.groupBy({
      by: ["accountCode"],
      where: { journalEntry: { companyId, status: "posted" } },
      _sum: { debit: true, credit: true },
    }),
  ]);

  const totalsByCode = new Map(totals.map((row) => [row.accountCode, row._sum]));

  return (
    <AppShell title="دليل الحسابات" subtitle="الحسابات المستخدمة في القيود، مع أرصدتها من القيود المرحّلة">
      {["owner", "accountant"].includes(role) ? <AccountForm /> : null}
      {["owner", "accountant"].includes(role) ? <BackfillButton /> : null}

      <section className="panel full-width">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الرمز</th>
                <th>الاسم</th>
                <th>النوع</th>
                <th>المدين</th>
                <th>الدائن</th>
                <th>الرصيد</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const sums = totalsByCode.get(account.code);
                const debit = sums?.debit ?? 0;
                const credit = sums?.credit ?? 0;
                const balance = account.type === "asset" || account.type === "expense" ? debit - credit : credit - debit;

                return (
                  <tr key={account.id}>
                    <td>{account.code}</td>
                    <td>{account.name}</td>
                    <td>{typeLabels[account.type] ?? account.type}</td>
                    <td>{formatCurrency(debit)}</td>
                    <td>{formatCurrency(credit)}</td>
                    <td>{formatCurrency(balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
