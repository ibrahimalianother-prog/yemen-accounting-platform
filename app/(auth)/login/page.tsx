"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email")),
      password: String(form.get("password")),
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-hero">
          <div className="brand-box large">
            <div className="brand-mark">Y</div>
            <div>
              <strong>Yemen</strong>
              <small>Accounting</small>
            </div>
          </div>
          <h1>منصة محاسبية عربية متقدمة</h1>
          <p>إدارة الفواتير، المصروفات، القيود والتقارير مع حماية أذونات المستخدمين.</p>
          <ul className="feature-list">
            <li>لوحة تحكم</li>
            <li>فواتير ومصروفات</li>
            <li>قيود وتقرير</li>
          </ul>
        </div>

        <div className="login-form-wrap">
          <div className="login-header">
            <p className="eyebrow dark">تسجيل الدخول</p>
            <h2>مرحباً بك</h2>
          </div>

          <form className="login-form" onSubmit={onSubmit}>
            <label>
              البريد الإلكتروني
              <input name="email" type="email" defaultValue="admin@yemenaccounting.com" required />
            </label>

            <label>
              كلمة المرور
              <input name="password" type="password" defaultValue="123456" required />
            </label>

            {error ? <div className="error-box">{error}</div> : null}

            <button type="submit" className="primary-btn login-btn" disabled={loading}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
