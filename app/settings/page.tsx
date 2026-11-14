import { AppShell } from "@/components/layout/AppShell";

const settingsList = [
  { key: "اسم الشركة", value: "شركة المهدي التجارية" },
  { key: "رأس المال", value: "1,500,000 ر.ي" },
  { key: "العملة", value: "ريال يمني" },
  { key: "السنة المالية", value: "2026" },
  { key: "لغة النظام", value: "العربية" },
  { key: "وضع النسخ الاحتياطي", value: "تلقائي" },
];

export default function SettingsPage() {
  return (
    <AppShell
      title="الإعدادات"
      subtitle="ضبط عامة الشركة والنظام وسهولة التشغيل" 
      actions={<button className="primary-btn">حفظ التعديلات</button>}
    >
      <section className="stats-inline">
        <div className="mini-stat">
          <span>حالة النظام</span>
          <strong>مستقر</strong>
        </div>
        <div className="mini-stat">
          <span>نسخ احتياطي</span>
          <strong>تلقائي</strong>
        </div>
        <div className="mini-stat">
          <span>عدد المستخدمين</span>
          <strong>12</strong>
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
