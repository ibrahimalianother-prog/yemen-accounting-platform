import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { CustomerForm } from "@/components/forms/CustomerForm";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const WRITE_ROLES = ["owner", "accountant", "sales"];

export default async function CustomersPage() {
  const { companyId, role } = await requireCompanyContext(["owner", "accountant", "sales", "auditor"]);

  const [customers, balances] = await Promise.all([
    prisma.customer.findMany({ where: { companyId }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.groupBy({
      by: ["customerId"],
      where: { companyId, status: "pending" },
      _sum: { totalAmount: true },
    }),
  ]);

  const balanceByCustomer = new Map(balances.map((item) => [item.customerId, item._sum.totalAmount ?? 0]));

  return (
    <AppShell title="العملاء" subtitle="دليل العملاء وأرصدة الذمم المدينة">
      {WRITE_ROLES.includes(role) ? <CustomerForm /> : null}

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الرمز</th>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>البريد</th>
                <th>الرصيد المستحق</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    لا يوجد عملاء حتى الآن.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id.slice(0, 8)}</td>
                    <td>{customer.name}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>{customer.email || "-"}</td>
                    <td>{formatCurrency(balanceByCustomer.get(customer.id) ?? 0)}</td>
                    <td>
                      <Link className="table-action" href={`/invoices?customer=${customer.id}`}>
                        الفواتير
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
