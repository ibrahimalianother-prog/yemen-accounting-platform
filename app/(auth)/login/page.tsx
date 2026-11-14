import Link from "next/link";

export default function LoginPage() {
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
          <p>
            إدارة الفواتير، المصروفات، القيود والتقارير من واجهة واحدة سريعة وآمنة.
          </p>

          <ul className="feature-list">
            <li>لوحة تحكم حقيقية ومخصصة</li>
            <li>تتبع فواتير ومصروفات دقيقة</li>
            <li>قيود محاسبية متوازنة وموثقة</li>
          </ul>
        </div>

        <div className="login-form-wrap">
          <div className="login-header">
            <p className="eyebrow dark">تسجيل الدخول</p>
            <h2>مرحباً بك</h2>
          </div>

          <form className="login-form">
            <label>
              البريد الإلكتروني
              <input type="email" defaultValue="admin@yemenaccounting.com" />
            </label>

            <label>
              كلمة المرور
              <input type="password" defaultValue="123456" />
            </label>

            <div className="form-row">
              <label className="checkbox-wrap">
                <input type="checkbox" defaultChecked />
                <span>تذكرني</span>
              </label>

              <Link href="/dashboard">نسيت كلمة المرور؟</Link>
            </div>

            <Link href="/dashboard" className="primary-btn login-btn">
              تسجيل الدخول
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
