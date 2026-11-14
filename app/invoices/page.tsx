import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { InvoiceForm } from "@/components/forms/InvoiceForm";
import { formatCurrency, formatDate, invoiceDisplayStatus, statusText } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const WRITE_ROLES = ["owner", "accountant", "sales"];

export default async function InvoicesPage({ searchParams }: { searchParams: { customer?: string } }) {
  const { companyId, role } = await requireCompanyContext();
  const customerFilter = searchParams.customer?.trim() || undefined;

  const [invoices, customers] = await Promise.all([
    prisma.invoice.findMany({
      where: { companyId, ...(customerFilter ? { customerId: customerFilter } : {}) },
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    WRITE_ROLES.includes(role)
      ? prisma.customer.findMany({
          where: { companyId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const active = invoices.filter((item) => item.status !== "cancelled");

  return (
    <AppShell title="الفواتير" subtitle="إدارة الفواتير المصدرة والمستحقة وتتبع حالة الدفع">
      <section className="stats-inline">
        <div className="mini-stat">
          <span>إجمالي الفواتير</span>
          <strong>{formatCurrency(active.reduce((sum, item) => sum + item.totalAmount, 0))}</strong>
        </div>
        <div className="mini-stat">
          <span>مدفوعة</span>
          <strong>{invoices.filter((item) => item.status === "paid").length}</strong>
        </div>
        <div className="mini-stat">
          <span>مستحقة</span>
          <strong>{invoices.filter((item) => item.status === "pending").length}</strong>
        </div>
      </section>

      {WRITE_ROLES.includes(role) ? <InvoiceForm customers={customers} /> : null}

      <section className="panel full-width">
        <div className="panel-header">
          <div>
            <p className="eyebrow">القائمة</p>
            <h3>{customerFilter ? "فواتير العميل" : "جميع الفواتير"}</h3>
          </div>
          {customerFilter ? (
            <Link href="/invoices" className="secondary-btn">
              عرض الكل
            </Link>
          ) : null}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>العميل</th>
                <th>التاريخ</th>
                <th>المجموع</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    لا توجد فواتير حتى الآن.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const display = invoiceDisplayStatus(invoice.status, invoice.dueDate);
                  return (
                    <tr key={invoice.id}>
                      <td>{invoice.invoiceNumber}</td>
                      <td>{invoice.customer.name}</td>
                      <td>{formatDate(invoice.issueDate)}</td>
                      <td>{formatCurrency(invoice.totalAmount)}</td>
                      <td>
                        <span className={`status ${display}`}>{statusText[display] ?? display}</span>
                      </td>
                      <td>
                        <Link className="table-action" href={`/invoices/${encodeURIComponent(invoice.invoiceNumber)}`}>
                          عرض
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
