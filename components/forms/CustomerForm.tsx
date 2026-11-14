"use client";

import { postJson } from "@/lib/client";
import { FormPanel } from "./FormPanel";

export function CustomerForm() {
  return (
    <FormPanel
      title="عميل جديد"
      buttonLabel="إضافة عميل"
      submitLabel="حفظ العميل"
      onSubmit={async (data) => {
        const text = (key: string) => String(data.get(key) ?? "").trim();
        await postJson("/api/customers", {
          name: text("name"),
          phone: text("phone") || null,
          email: text("email") || null,
          address: text("address") || null,
        });
      }}
    >
      <label>
        اسم العميل
        <input name="name" required maxLength={128} />
      </label>
      <label>
        الهاتف
        <input name="phone" maxLength={64} />
      </label>
      <label>
        البريد الإلكتروني
        <input name="email" type="email" maxLength={256} />
      </label>
      <label>
        العنوان
        <input name="address" maxLength={500} />
      </label>
    </FormPanel>
  );
}
