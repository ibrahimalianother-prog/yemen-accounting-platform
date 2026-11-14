"use client";

import { postJson } from "@/lib/client";
import { FormPanel } from "./FormPanel";

export function AccountForm() {
  return (
    <FormPanel
      title="حساب جديد"
      buttonLabel="إضافة حساب"
      submitLabel="حفظ الحساب"
      onSubmit={async (data) => {
        const text = (key: string) => String(data.get(key) ?? "").trim();
        await postJson("/api/accounts", { code: text("code"), name: text("name"), type: text("type") });
      }}
    >
      <label>
        رمز الحساب
        <input name="code" required maxLength={16} pattern="[0-9A-Za-z.\-]{1,16}" />
      </label>
      <label>
        اسم الحساب
        <input name="name" required maxLength={128} />
      </label>
      <label>
        النوع
        <select name="type" defaultValue="asset">
          <option value="asset">أصول</option>
          <option value="liability">خصوم</option>
          <option value="equity">حقوق ملكية</option>
          <option value="income">إيرادات</option>
          <option value="expense">مصروفات</option>
        </select>
      </label>
    </FormPanel>
  );
}
