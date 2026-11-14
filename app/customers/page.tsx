import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { customers } from "@/lib/mockData";
const money = (n: number) => new Intl.NumberFormat("ar-YE", { style: "currency", currency: "YER", maximumFractionDigits: 0 }).format(n);
export default function CustomersPage() {
  return <AppShell title="العملاء" subtitle="دليل العملاء وأرصدة الذمم المدينة" actions={<button className="primary-btn">إضافة عميل</button>}>
    <section className="panel"><div className="table-wrap"><table><thead><tr><th>الرمز</th><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>الرصيد</th><th>التفاصيل</th></tr></thead><tbody>{customers.map((c) => <tr key={c.id}><td>{c.id}</td><td>{c.name}</td><td>{c.phone}</td><td>{c.email}</td><td>{money(c.balance)}</td><td><Link className="table-action" href={`/invoices?customer=${c.id}`}>الفواتير</Link></td></tr>)}</tbody></table></div></section>
  </AppShell>;
}
