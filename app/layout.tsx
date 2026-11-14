import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yemen Accounting Platform",
  description: "منصة محاسبية عربية لإدارة الفواتير والمصروفات والقيود والتقارير",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
