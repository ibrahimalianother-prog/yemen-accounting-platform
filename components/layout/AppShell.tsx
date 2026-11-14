import Link from "next/link";
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-shell">
        <header className="main-header">
          <div>
            <p className="eyebrow">لوحة التحكم</p>
            <h1>{title}</h1>
          </div>

          <div className="topbar-actions">
            {actions}
            <Link href="/login" className="secondary-btn">
              تسجيل الخروج
            </Link>
          </div>
        </header>

        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}

        {children}
      </main>
    </div>
  );
}
