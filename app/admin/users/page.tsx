import { AppShell } from "@/components/layout/AppShell";
import { rolePermissions, type AppRole } from "@/lib/accessControl";
const labels: Record<AppRole, string> = { owner: "مالك الشركة", accountant: "محاسب", cashier: "أمين صندوق", sales: "مندوب مبيعات", auditor: "مراجع للقراءة فقط" };
export default function AdminUsersPage() {
  return <AppShell title="إدارة المستخدمين والصلاحيات" subtitle="مصفوفة RBAC توضيحية؛ لا تطبق المصادقة أو التفويض الفعلي بعد">
    <section className="notice warning">تنبيه أمني: هذه شاشة نموذجية فقط. لا تعتبر حماية فعلية حتى تضاف جلسات موثقة وفحص صلاحيات على الخادم وقاعدة بيانات.</section>
    <section className="report-grid">{(Object.keys(rolePermissions) as AppRole[]).map((role) => <article className="panel" key={role}><div className="panel-header"><h3>{labels[role]}</h3><span className="status approved">{rolePermissions[role].length} صلاحية</span></div><ul className="permission-list">{rolePermissions[role].map((p) => <li key={p}>{p}</li>)}</ul></article>)}</section>
  </AppShell>;
}
