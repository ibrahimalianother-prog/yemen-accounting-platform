"use client";

import { postJson } from "@/lib/client";
import { FormPanel } from "./FormPanel";

export function UserForm() {
  return (
    <FormPanel
      title="مستخدم جديد"
      buttonLabel="إضافة مستخدم"
      submitLabel="حفظ المستخدم"
      onSubmit={async (data) => {
        const text = (key: string) => String(data.get(key) ?? "").trim();
        await postJson("/api/admin/users", {
          fullName: text("fullName"),
          email: text("email"),
          password: String(data.get("password") ?? ""),
          role: text("role"),
        });
      }}
    >
      <label>
        الاسم الكامل
        <input name="fullName" required minLength={3} maxLength={128} />
      </label>
      <label>
        البريد الإلكتروني
        <input name="email" type="email" required maxLength={256} autoComplete="off" />
      </label>
      <label>
        كلمة المرور (8 أحرف على الأقل)
        <input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" />
      </label>
      <label>
        الدور
        <select name="role" defaultValue="accountant">
          <option value="accountant">محاسب</option>
          <option value="cashier">أمين صندوق</option>
          <option value="sales">مندوب مبيعات</option>
          <option value="auditor">مراجع للقراءة فقط</option>
        </select>
      </label>
    </FormPanel>
  );
}
