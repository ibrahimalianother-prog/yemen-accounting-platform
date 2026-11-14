import Link from "next/link";

const menu = [
  { label: "لوحة التحكم", href: "/dashboard", active: true },
  { label: "الفواتير", href: "/invoices", active: false },
  { label: "المصروفات", href: "/expenses", active: false },
  { label: "القيود", href: "/journal", active: false },
  { label: "التقارير", href: "/reports", active: false },
  { label: "الإعدادات", href: "/settings", active: false },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand-box">
        <div className="brand-mark">Y</div>
        <div>
          <strong>Yemen</strong>
          <small>Accounting</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`nav-item ${item.active ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span>نسخة تجريبية</span>
        <strong>v1.0</strong>
      </div>
    </aside>
  );
}
