"use client";

import { useState } from "react";
import { postJson } from "@/lib/client";
import { formatCurrency } from "@/lib/format";
import { FormPanel } from "./FormPanel";

type Option = { id: string; name: string };
type Item = { description: string; quantity: string; unitPrice: string };

const emptyItem = (): Item => ({ description: "", quantity: "1", unitPrice: "" });

export function InvoiceForm({ customers }: { customers: Option[] }) {
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [tax, setTax] = useState("0");

  const updateItem = (index: number, key: keyof Item, value: string) =>
    setItems((current) => current.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const taxAmount = Number(tax) || 0;

  return (
    <FormPanel
      title="فاتورة جديدة"
      buttonLabel="إنشاء فاتورة"
      submitLabel="حفظ الفاتورة"
      onSubmit={async (data) => {
        const text = (key: string) => String(data.get(key) ?? "").trim();

        const parsedItems = items.map((item) => ({
          description: item.description.trim(),
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        }));

        for (const item of parsedItems) {
          if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            throw new Error("الكمية يجب أن تكون عدداً صحيحاً أكبر من صفر");
          }
          if (!Number.isInteger(item.unitPrice) || item.unitPrice < 0) {
            throw new Error("سعر الوحدة يجب أن يكون عدداً صحيحاً غير سالب");
          }
        }

        if (!Number.isInteger(taxAmount) || taxAmount < 0) {
          throw new Error("الضريبة يجب أن تكون عدداً صحيحاً غير سالب");
        }

        await postJson("/api/invoices", {
          customerId: text("customerId"),
          invoiceNumber: text("invoiceNumber"),
          issueDate: new Date(text("issueDate")).toISOString(),
          dueDate: text("dueDate") ? new Date(text("dueDate")).toISOString() : null,
          items: parsedItems,
          taxAmount,
          status: text("status") || "draft",
          notes: text("notes") || null,
        });

        setItems([emptyItem()]);
        setTax("0");
      }}
    >
      {customers.length === 0 ? (
        <div className="notice">أضف عميلاً أولاً من صفحة العملاء قبل إنشاء فاتورة.</div>
      ) : null}
      <label>
        العميل
        <select name="customerId" required defaultValue="">
          <option value="" disabled>
            اختر العميل
          </option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        رقم الفاتورة
        <input name="invoiceNumber" required maxLength={64} />
      </label>
      <label>
        تاريخ الإصدار
        <input name="issueDate" type="date" required />
      </label>
      <label>
        تاريخ الاستحقاق
        <input name="dueDate" type="date" />
      </label>
      <label>
        الحالة
        <select name="status" defaultValue="draft">
          <option value="draft">مسودة</option>
          <option value="pending">مستحقة</option>
          <option value="paid">مدفوعة</option>
        </select>
      </label>
      <label>
        ملاحظات
        <input name="notes" maxLength={2000} />
      </label>

      <div className="journal-lines">
        {items.map((item, index) => (
          <div className="invoice-line" key={index}>
            <input
              placeholder="وصف البند"
              value={item.description}
              onChange={(e) => updateItem(index, "description", e.target.value)}
              required
              maxLength={256}
            />
            <input
              placeholder="الكمية"
              type="number"
              min={1}
              step={1}
              value={item.quantity}
              onChange={(e) => updateItem(index, "quantity", e.target.value)}
              required
            />
            <input
              placeholder="سعر الوحدة"
              type="number"
              min={0}
              step={1}
              value={item.unitPrice}
              onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
              required
            />
            <button
              type="button"
              className="secondary-btn"
              disabled={items.length <= 1}
              onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
            >
              حذف
            </button>
          </div>
        ))}
        <div className="journal-footer">
          <button type="button" className="secondary-btn" onClick={() => setItems((current) => [...current, emptyItem()])}>
            إضافة بند
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            الضريبة
            <input type="number" min={0} step={1} value={tax} onChange={(e) => setTax(e.target.value)} style={{ width: 140 }} />
          </label>
          <span className="status pending">
            الإجمالي {formatCurrency(subtotal + taxAmount)}
          </span>
        </div>
      </div>
    </FormPanel>
  );
}
