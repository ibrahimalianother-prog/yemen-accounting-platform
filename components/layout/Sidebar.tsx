import Link from "next/link";

const menu = [
  { label: "لوحة التحكم", href: "/dashboard" },
  { label: "الفواتير", href: "/invoices" },
  { label: "المصروفات", href: "/expenses" },
  { label: "القيود", href: "/journal" },
  { label: "دليل الحسابات", href: "/accounts" },
  { label: "العملاء", href: "/customers" },
  { label: "الموردون", href: "/vendors" },
  { label: "التقارير", href: "/reports" },
  { label: "إدارة المستخدمين", href: "/admin/users" },
  { label: "سجل التدقيق", href: "/admin/audit" },
  { label: "الإعدادات", href: "/settings" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link href="/dashboard" className="brand-box">
        <span className="brand-mark">Y</span>
        <span><strong>Yemen</strong><small>Accounting</small></span>
      </Link>
      <nav className="sidebar-nav" aria-label="التنقل الرئيسي">
        {menu.map((item) => <Link key={item.href} href={item.href} className="nav-item">{item.label}</Link>)}
      </nav>
      <div className="sidebar-footer"><span>نظام المحاسبة اليمني</span><strong>v1.0</strong></div>
    </aside>
  );
}
