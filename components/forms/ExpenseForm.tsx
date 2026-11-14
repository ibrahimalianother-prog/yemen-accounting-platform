"use client";

import { postJson } from "@/lib/client";
import { FormPanel } from "./FormPanel";

type Option = { id: string; name: string };

export function ExpenseForm({ vendors, categories }: { vendors: Option[]; categories: Option[] }) {
  return (
    <FormPanel
      title="مصروف جديد"
      buttonLabel="إضافة مصروف"
      submitLabel="حفظ المصروف"
      onSubmit={async (data) => {
        const text = (key: string) => String(data.get(key) ?? "").trim();
        const amount = Number(text("amount"));

        if (!Number.isInteger(amount) || amount <= 0) {
          throw new Error("المبلغ يجب أن يكون عدداً صحيحاً أكبر من صفر");
        }

        await postJson("/api/expenses", {
          vendorId: text("vendorId"),
          categoryId: text("categoryId") || null,
          expenseNumber: text("expenseNumber"),
          expenseDate: new Date(text("expenseDate")).toISOString(),
          amount,
          status: text("status") || "draft",
          notes: text("notes") || null,
        });
      }}
    >
      {vendors.length === 0 ? (
        <div className="notice">أضف مورداً أولاً من صفحة الموردين قبل تسجيل مصروف.</div>
      ) : null}
      <label>
        المورد
        <select name="vendorId" required defaultValue="">
          <option value="" disabled>
            اختر المورد
          </option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        الفئة
        <select name="categoryId" defaultValue="">
          <option value="">بدون فئة</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        رقم المصروف
        <input name="expenseNumber" required maxLength={64} />
      </label>
      <label>
        التاريخ
        <input name="expenseDate" type="date" required />
      </label>
      <label>
        المبلغ
        <input name="amount" type="number" min={1} step={1} required />
      </label>
      <label>
        الحالة
        <select name="status" defaultValue="draft">
          <option value="draft">مسودة</option>
          <option value="posted">مسجل</option>
        </select>
      </label>
      <label>
        ملاحظات
        <input name="notes" maxLength={2000} />
      </label>
    </FormPanel>
  );
}
