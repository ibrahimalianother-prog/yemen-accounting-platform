import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { JournalForm } from "@/components/forms/JournalForm";
import { ensureDefaultAccounts } from "@/lib/accounting";
import { formatCurrency, formatDate, statusText } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const WRITE_ROLES = ["owner", "accountant"];

export default async function JournalPage() {
  const { companyId, role } = await requireCompanyContext(["owner", "accountant", "cashier", "auditor"]);

  const canWrite = WRITE_ROLES.includes(role);
  if (canWrite) await ensureDefaultAccounts(prisma, companyId);

  const [entries, accounts] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { companyId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    }),
    canWrite
      ? prisma.account.findMany({
          where: { companyId, isActive: true },
          select: { code: true, name: true },
          orderBy: { code: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AppShell title="القيود المحاسبية" subtitle="تتبع القيد المزدوج والتأكد من توازن الحسابات">
      <section className="stats-inline">
        <div className="mini-stat">
          <span>إجمالي القيود</span>
          <strong>{entries.length}</strong>
        </div>
        <div className="mini-stat">
          <span>مرحّلة</span>
          <strong>{entries.filter((item) => item.status === "posted").length}</strong>
        </div>
        <div className="mini-stat">
          <span>مسودات</span>
          <strong>{entries.filter((item) => item.status === "draft").length}</strong>
        </div>
      </section>

      {canWrite ? <JournalForm accounts={accounts} /> : null}

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
                <th>البيان</th>
                <th>المدين</th>
                <th>الدائن</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    لا توجد قيود حتى الآن.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.entryNumber}</td>
                    <td>{formatDate(entry.entryDate)}</td>
                    <td>{entry.description || "-"}</td>
                    <td>{formatCurrency(entry.lines.reduce((sum, line) => sum + line.debit, 0))}</td>
                    <td>{formatCurrency(entry.lines.reduce((sum, line) => sum + line.credit, 0))}</td>
                    <td>
                      <span className={`status ${entry.status}`}>{statusText[entry.status] ?? entry.status}</span>
                    </td>
                    <td>
                      <Link className="table-action" href={`/journal/${encodeURIComponent(entry.entryNumber)}`}>
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
