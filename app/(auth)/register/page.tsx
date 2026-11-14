"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "تعذّر إنشاء الحساب");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إنشاء الحساب");
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

          <h1>ابدأ بإدارة حسابات شركتك</h1>
          <p>أنشئ حساب شركة جديدة وستكون مالكها بكامل الصلاحيات.</p>
        </div>

        <div className="login-form-wrap">
          <div className="login-header">
            <p className="eyebrow dark">حساب جديد</p>
            <h2>إنشاء حساب</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label>
              الاسم الكامل
              <input name="fullName" minLength={3} maxLength={128} required />
            </label>

            <label>
              اسم الشركة
              <input name="companyName" minLength={2} maxLength={128} required />
            </label>

            <label>
              البريد الإلكتروني
              <input name="email" type="email" autoComplete="email" required />
            </label>

            <label>
              كلمة المرور (8 أحرف على الأقل)
              <input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required />
            </label>

            {error ? <div className="error-box">{error}</div> : null}

            <button type="submit" className="primary-btn login-btn" disabled={loading}>
              {loading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </button>
          </form>

          <p className="login-alt">
            لديك حساب بالفعل؟ <Link href="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
