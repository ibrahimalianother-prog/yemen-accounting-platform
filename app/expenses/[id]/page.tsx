import { AppShell } from "@/components/layout/AppShell";
import { StatusActions, type StatusAction } from "@/components/forms/StatusActions";
import { formatCurrency, formatDate, safeDecode, statusText } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ExpenseDetailPage({ params }: { params: { id: string } }) {
  const { companyId, role } = await requireCompanyContext(["owner", "accountant", "cashier", "auditor"]);

  const expense = await prisma.expense.findFirst({
    where: { id: safeDecode(params.id), companyId },
    include: {
      vendor: { select: { name: true } },
      category: { select: { name: true } },
      createdBy: { select: { fullName: true } },
    },
  });

  if (!expense) {
    return (
      <AppShell title="المصروف غير موجود">
        <section className="panel">لم يتم العثور على المصروف المطلوب.</section>
      </AppShell>
    );
  }

  const cancelAction: StatusAction = {
    label: "إلغاء المصروف",
    payload: { status: "cancelled" },
    confirm: "هل تريد إلغاء هذا المصروف؟",
    secondary: true,
  };
  const expenseActions: StatusAction[] =
    expense.status === "draft"
      ? [{ label: "تسجيل المصروف", payload: { status: "posted" } }, cancelAction]
      : expense.status === "posted"
        ? [cancelAction]
        : [];

  return (
    <AppShell title={`مصروف ${expense.expenseNumber}`} subtitle="تفاصيل المصروف">
      <section className="panel">
        <div className="panel-header">
          <h3>بيانات المصروف</h3>
          <span className={`status ${expense.status}`}>{statusText[expense.status] ?? expense.status}</span>
        </div>
        <div className="detail-grid">
          <div>
            <small>الفئة</small>
            <strong>{expense.category?.name ?? "-"}</strong>
          </div>
          <div>
            <small>المورد</small>
            <strong>{expense.vendor.name}</strong>
          </div>
          <div>
            <small>التاريخ</small>
            <strong>{formatDate(expense.expenseDate)}</strong>
          </div>
          <div>
            <small>المبلغ</small>
            <strong>{formatCurrency(expense.amount)}</strong>
          </div>
          <div>
            <small>سجّله</small>
            <strong>{expense.createdBy.fullName}</strong>
          </div>
        </div>
        {expense.notes ? <p className="notice">{expense.notes}</p> : null}
      </section>

      {["owner", "accountant"].includes(role) ? (
        <StatusActions endpoint={`/api/expenses/${expense.id}`} actions={expenseActions} />
      ) : null}
    </AppShell>
  );
}
