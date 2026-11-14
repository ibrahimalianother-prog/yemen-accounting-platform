"use client";

import { postJson } from "@/lib/client";
import { FormPanel } from "./FormPanel";

export function CategoryForm() {
  return (
    <FormPanel
      title="فئة مصروفات جديدة"
      buttonLabel="إضافة فئة"
      submitLabel="حفظ الفئة"
      onSubmit={async (data) => {
        await postJson("/api/expense-categories", { name: String(data.get("name") ?? "").trim() });
      }}
    >
      <label>
        اسم الفئة
        <input name="name" required maxLength={64} />
      </label>
    </FormPanel>
  );
}
