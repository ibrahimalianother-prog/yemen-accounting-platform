import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { UserForm } from "@/components/forms/UserForm";
import { UserRowActions } from "@/components/forms/UserRowActions";
import { rolePermissions, type AppRole } from "@/lib/accessControl";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

const labels: Record<AppRole, string> = {
  owner: "مالك الشركة",
  accountant: "محاسب",
  cashier: "أمين صندوق",
  sales: "مندوب مبيعات",
  auditor: "مراجع للقراءة فقط",
};

export default async function AdminUsersPage() {
  const { companyId, role, user: currentUser } = await requireCompanyContext(["owner", "accountant"]);
  const isOwner = role === "owner";

  const users = await prisma.user.findMany({
    where: { companyId },
    select: { id: true, fullName: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <AppShell
      title="إدارة المستخدمين والصلاحيات"
      subtitle="مستخدمو الشركة ومصفوفة الصلاحيات حسب الدور"
      actions={
        <Link href="/admin/audit" className="secondary-btn">
          سجل التدقيق
        </Link>
      }
    >
      {isOwner ? <UserForm /> : null}

      <section className="panel full-width" style={{ marginBottom: 18 }}>
        <div className="panel-header">
          <h3>المستخدمون</h3>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>البريد</th>
                <th>الدور</th>
                <th>الحالة</th>
                {isOwner ? <th>الإجراء</th> : null}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{labels[user.role as AppRole] ?? user.role}</td>
                  <td>
                    <span className={`status ${user.isActive ? "paid" : "cancelled"}`}>
                      {user.isActive ? "نشط" : "معطّل"}
                    </span>
                  </td>
                  {isOwner ? (
                    <td>
                      {user.role === "owner" || user.id === currentUser.id ? (
                        "-"
                      ) : (
                        <UserRowActions userId={user.id} role={user.role} isActive={user.isActive} />
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="report-grid">
        {(Object.keys(rolePermissions) as AppRole[]).map((r) => (
          <article className="panel" key={r}>
            <div className="panel-header">
              <h3>{labels[r]}</h3>
              <span className="status approved">{rolePermissions[r].length} صلاحية</span>
            </div>
            <ul className="permission-list">
              {rolePermissions[r].map((permission) => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
