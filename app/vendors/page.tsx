import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { vendors } from "@/lib/mockData";
const money = (n: number) => new Intl.NumberFormat("ar-YE", { style: "currency", currency: "YER", maximumFractionDigits: 0 }).format(n);
export default function VendorsPage() {
  return <AppShell title="الموردون" subtitle="دليل الموردين ومتابعة الأرصدة المستحقة" actions={<button className="primary-btn">إضافة مورد</button>}>
    <section className="panel"><div className="table-wrap"><table><thead><tr><th>الرمز</th><th>الاسم</th><th>الهاتف</th><th>البريد</th><th>الرصيد</th><th>التفاصيل</th></tr></thead><tbody>{vendors.map((v) => <tr key={v.id}><td>{v.id}</td><td>{v.name}</td><td>{v.phone}</td><td>{v.email}</td><td>{money(v.balance)}</td><td><Link className="table-action" href={`/expenses?vendor=${v.id}`}>المصروفات</Link></td></tr>)}</tbody></table></div></section>
  </AppShell>;
}
