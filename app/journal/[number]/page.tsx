import { AppShell } from "@/components/layout/AppShell";
import { StatusActions, type StatusAction } from "@/components/forms/StatusActions";
import { formatCurrency, formatDate, safeDecode, statusText } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function JournalDetailPage({ params }: { params: { number: string } }) {
  const { companyId, role } = await requireCompanyContext(["owner", "accountant", "cashier", "auditor"]);

  const entry = await prisma.journalEntry.findFirst({
    where: { entryNumber: safeDecode(params.number), companyId },
    include: { lines: true },
  });

  if (!entry) {
    return (
      <AppShell title="القيد غير موجود">
        <section className="panel">لم يتم العثور على القيد المطلوب.</section>
      </AppShell>
    );
  }

  const debit = entry.lines.reduce((sum, line) => sum + line.debit, 0);
  const credit = entry.lines.reduce((sum, line) => sum + line.credit, 0);

  const reversal =
    entry.status === "posted" && !entry.reversalOfId
      ? await prisma.journalEntry.findFirst({
          where: { reversalOfId: entry.id, companyId },
          select: { entryNumber: true },
        })
      : null;

  const journalActions: StatusAction[] =
    entry.status === "draft"
      ? [
          { label: "ترحيل القيد", payload: { action: "post" }, confirm: "بعد الترحيل لا يمكن تعديل القيد. هل تريد المتابعة؟" },
          { label: "إلغاء المسودة", payload: { action: "cancel" }, confirm: "هل تريد إلغاء هذه المسودة؟", secondary: true },
        ]
      : entry.status === "posted" && !entry.reversalOfId && !reversal
        ? [
            {
              label: "عكس القيد",
              payload: { action: "reverse" },
              confirm: "سيتم إنشاء قيد عكسي مرحّل. هل تريد المتابعة؟",
              secondary: true,
            },
          ]
        : [];

  return (
    <AppShell title={`القيد ${entry.entryNumber}`} subtitle="تفاصيل القيد المحاسبي">
      <section className="panel">
        <div className="panel-header">
          <h3>ملخص القيد</h3>
          <span className={`status ${entry.status}`}>{statusText[entry.status] ?? entry.status}</span>
        </div>
        <div className="detail-grid">
          <div>
            <small>التاريخ</small>
            <strong>{formatDate(entry.entryDate)}</strong>
          </div>
          <div>
            <small>البيان</small>
            <strong>{entry.description || "-"}</strong>
          </div>
          <div>
            <small>المدين</small>
            <strong>{formatCurrency(debit)}</strong>
          </div>
          <div>
            <small>الدائن</small>
            <strong>{formatCurrency(credit)}</strong>
          </div>
        </div>
        {reversal ? <p className="notice">تم عكس هذا القيد بالقيد {reversal.entryNumber}.</p> : null}
        {entry.reversalOfId ? <p className="notice">هذا قيد عكسي لقيد مرحّل سابق.</p> : null}
      </section>

      {["owner", "accountant"].includes(role) ? (
        <StatusActions endpoint={`/api/journal/${entry.id}`} actions={journalActions} />
      ) : null}

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-header">
          <h3>سطور القيد</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>رمز الحساب</th>
                <th>اسم ا��حساب</th>
                <th>المدين</th>
                <th>الدائن</th>
              </tr>
            </thead>
            <tbody>
              {entry.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.accountCode}</td>
                  <td>{line.accountName}</td>
                  <td>{formatCurrency(line.debit)}</td>
                  <td>{formatCurrency(line.credit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
