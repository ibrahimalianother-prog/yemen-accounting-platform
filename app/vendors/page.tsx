"use client";

import { useEffect, useState } from "react";

type VendorRecord = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const loadVendors = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/vendors");
      if (!response.ok) throw new Error("تعذّر تحميل الموردين");
      const data = await response.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحميل الموردين");
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          address: form.address || undefined,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "فشل إنشاء المورد");
      }

      setForm({ name: "", phone: "", email: "", address: "" });
      setShowForm(false);
      await loadVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إنشاء المورد");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="panel" style={{ marginBottom: 20 }}>
        <div className="panel-header" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow">الموردون</p>
            <h3>إدارة الموردين</h3>
          </div>
          <button className="primary-btn" onClick={() => setShowForm((current) => !current)}>
            {showForm ? "إغلاق النموذج" : "إضافة مورد"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleCreate} style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label>
                اسم المورد
                <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required />
              </label>
              <label>
                الهاتف
                <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
              </label>
              <label>
                البريد الإلكتروني
                <input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
              </label>
            </div>

            <label>
              العنوان
              <textarea value={form.address} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} rows={3} />
            </label>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>إلغاء</button>
              <button type="submit" className="primary-btn" disabled={submitting}>{submitting ? "جاري الحفظ..." : "حفظ المورد"}</button>
            </div>
          </form>
        ) : null}
      </section>

      {error ? <div className="error-box" style={{ marginBottom: 16 }}>{error}</div> : null}

      <section className="panel full-width">
        <div className="panel-header">
          <div>
            <p className="eyebrow">القائمة</p>
            <h3>جميع الموردين</h3>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>البريد</th>
                <th>العنوان</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>جاري التحميل...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>لا توجد موردين حتى الآن.</td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor.id}>
                    <td>{vendor.name}</td>
                    <td>{vendor.phone || "-"}</td>
                    <td>{vendor.email || "-"}</td>
                    <td>{vendor.address || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
