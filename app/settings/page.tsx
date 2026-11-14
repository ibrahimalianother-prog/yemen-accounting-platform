import { AppShell } from "@/components/layout/AppShell";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requireCompanyContext } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { company, companyId, user } = await requireCompanyContext();
  const userCount = await prisma.user.count({ where: { companyId, isActive: true } });

  const settingsList = [
    { key: "اسم الشركة", value: company.name },
    { key: "البريد الإلكتروني", value: company.email || "-" },
    { key: "الهاتف", value: company.phone || "-" },
    { key: "الرقم الضريبي", value: company.taxNumber || "-" },
    { key: "العملة", value: company.currency === "YER" ? "ريال يمني (YER)" : company.currency },
    { key: "تاريخ إنشاء الحساب", value: formatDate(company.createdAt) },
    { key: "المستخدم الحالي", value: `${user.fullName} (${user.email})` },
  ];

  return (
    <AppShell title="الإعدادات" subtitle="معلومات الشركة والحساب الحالي">
      <section className="stats-inline">
        <div className="mini-stat">
          <span>المستخدمون النشطون</span>
          <strong>{userCount}</strong>
        </div>
        <div className="mini-stat">
          <span>العملة</span>
          <strong>{company.currency}</strong>
        </div>
        <div className="mini-stat">
          <span>دورك</span>
          <strong>{user.role}</strong>
        </div>
      </section>

      <section className="panel full-width">
        <div className="panel-header">
          <div>
            <p className="eyebrow">الإعدادات</p>
            <h3>معلومات الشركة</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الخيار</th>
                <th>القيمة</th>
              </tr>
            </thead>
            <tbody>
              {settingsList.map((item) => (
                <tr key={item.key}>
                  <td>{item.key}</td>
                  <td>{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
