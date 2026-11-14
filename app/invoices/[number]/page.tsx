import { AppShell } from "@/components/layout/AppShell";
import { StatusActions, type StatusAction } from "@/components/forms/StatusActions";
import { formatCurrency, formatDate, invoiceDisplayStatus, safeDecode, statusText } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({ params }: { params: { number: string } }) {
  const { companyId, role } = await requireCompanyContext();

  const invoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: safeDecode(params.number), companyId },
    include: {
      customer: { select: { name: true } },
      createdBy: { select: { fullName: true } },
      items: true,
    },
  });

  if (!invoice) {
    return (
      <AppShell title="الفاتورة غير موجودة">
        <section className="panel">لم يتم العثور على الفاتورة المطلوبة.</section>
      </AppShell>
    );
  }

  const display = invoiceDisplayStatus(invoice.status, invoice.dueDate);

  const cancelAction: StatusAction = {
    label: "إلغاء الفاتورة",
    payload: { status: "cancelled" },
    confirm: "هل تريد إلغاء هذه الفاتورة؟",
    secondary: true,
  };
  const invoiceActions: StatusAction[] =
    invoice.status === "draft"
      ? [{ label: "إصدار الفاتورة", payload: { status: "pending" } }, cancelAction]
      : invoice.status === "pending"
        ? [{ label: "تسجيل الدفع", payload: { status: "paid" } }, cancelAction]
        : [];

  return (
    <AppShell title={`الفاتورة ${invoice.invoiceNumber}`} subtitle="تفاصيل الفاتورة">
      <section className="stats-inline">
        <div className="mini-stat">
          <span>العميل</span>
          <strong>{invoice.customer.name}</strong>
        </div>
        <div className="mini-stat">
          <span>تاريخ الإصدار</span>
          <strong>{formatDate(invoice.issueDate)}</strong>
        </div>
        <div className="mini-stat">
          <span>الإجمالي</span>
          <strong>{formatCurrency(invoice.totalAmount)}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>بيانات الفاتورة</h3>
          <span className={`status ${display}`}>{statusText[display] ?? display}</span>
        </div>
        <div className="detail-grid">
          <div>
            <small>رقم الفاتورة</small>
            <strong>{invoice.invoiceNumber}</strong>
          </div>
          <div>
            <small>تاريخ الاستحقاق</small>
            <strong>{invoice.dueDate ? formatDate(invoice.dueDate) : "-"}</strong>
          </div>
          <div>
            <small>المبلغ قبل الضريبة</small>
            <strong>{formatCurrency(invoice.subtotal)}</strong>
          </div>
          <div>
            <small>الضريبة</small>
            <strong>{formatCurrency(invoice.taxAmount)}</strong>
          </div>
          <div>
            <small>أنشأها</small>
            <strong>{invoice.createdBy.fullName}</strong>
          </div>
          <div>
            <small>العملة</small>
            <strong>ريال يمني (YER)</strong>
          </div>
        </div>
        {invoice.notes ? <p className="notice">{invoice.notes}</p> : null}
      </section>

      {["owner", "accountant"].includes(role) ? (
        <StatusActions endpoint={`/api/invoices/${invoice.id}`} actions={invoiceActions} />
      ) : null}

      {invoice.items.length > 0 ? (
        <section className="panel" style={{ marginTop: 18 }}>
          <div className="panel-header">
            <h3>البنود</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الوصف</th>
                  <th>الكمية</th>
                  <th>سعر الوحدة</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </AppShell>
  );
}
