"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/demo")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-shell">جاري التحميل...</div>;

  return (
    <main className="page-shell">
      <h1>لوحة التحكم</h1>
      <p>البيانات الحالية قادمة من API تجريبي. هذا هو سطح التشغيل الأولي.</p>
      <pre className="json-block">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
