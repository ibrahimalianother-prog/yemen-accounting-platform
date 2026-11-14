import { AppShell } from "@/components/layout/AppShell";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const { companyId } = await requireCompanyContext(["owner", "accountant", "auditor"]);

  const logs = await prisma.auditLog.findMany({
    where: { user: { companyId } },
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <AppShell title="سجل التدقيق" subtitle="آخر 200 عملية على بيانات الشركة">
      <section className="panel full-width">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الوقت</th>
                <th>المستخدم</th>
                <th>العملية</th>
                <th>الكيان</th>
                <th>التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    لا توجد عمليات مسجّلة بعد.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="audit-meta">{log.createdAt.toISOString().replace("T", " ").slice(0, 19)}</td>
                    <td>{log.user.fullName}</td>
                    <td className="audit-meta">{log.action}</td>
                    <td className="audit-meta">
                      {log.entityType} {log.entityId.slice(0, 8)}
                    </td>
                    <td className="audit-meta">{log.metadata ? JSON.stringify(log.metadata) : "-"}</td>
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
