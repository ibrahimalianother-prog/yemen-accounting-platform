import { AppShell } from "@/components/layout/AppShell";

export default function ReportsPage() {
  return (
    <AppShell
      title="التقارير"
      subtitle="ملخص مالي فوري لمتابعة الأداء ومؤشرات الأداء الرئيسية"
      actions={<button className="primary-btn">تصدير التقرير</button>}
    >
      <section className="stats-inline">
        <div className="mini-stat">
          <span>الإيرادات</span>
          <strong>4,200,000 ر.ي</strong>
        </div>
        <div className="mini-stat">
          <span>المصروفات</span>
          <strong>2,860,000 ر.ي</strong>
        </div>
        <div className="mini-stat">
          <span>صافي الربح</span>
          <strong>1,340,000 ر.ي</strong>
        </div>
      </section>

      <section className="report-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">التقارير</p>
              <h3>ميزان المراجعة</h3>
            </div>
          </div>
          <p className="report-body">تم تجهيز حسابات الشركة ومراجعة الرصيد بنجاح. جميع النسب المالية تراعي التوازن القيد المزدوج.</p>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">التقارير</p>
              <h3>قائمة الدخل</h3>
            </div>
          </div>
          <p className="report-body">إجمالي الإيرادات 4,200,000 ر.ي، مع कुल مصروفات 2,860,000 ر.ي، وصافي ربح 1,340,000 ر.ي.</p>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">التقارير</p>
              <h3>الميزانية</h3>
            </div>
          </div>
          <p className="report-body">الميزانية الحالية متوازنة، مع رصيد نقدي مناسب وتوجيه فرعي للمصروفات الإدارية.</p>
        </article>
      </section>
    </AppShell>
  );
}
