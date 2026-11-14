"use client";

import { useState } from "react";
import { postJson } from "@/lib/client";
import { FormPanel } from "./FormPanel";

type AccountOption = { code: string; name: string };
type Line = { accountCode: string; debit: string; credit: string };

const emptyLine = (): Line => ({ accountCode: "", debit: "", credit: "" });

export function JournalForm({ accounts }: { accounts: AccountOption[] }) {
  const [lines, setLines] = useState<Line[]>([emptyLine(), emptyLine()]);

  const updateLine = (index: number, key: keyof Line, value: string) =>
    setLines((current) => current.map((line, i) => (i === index ? { ...line, [key]: value } : line)));

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);

  return (
    <FormPanel
      title="قيد جديد"
      buttonLabel="إضافة قيد"
      submitLabel="حفظ القيد"
      onSubmit={async (data) => {
        const text = (key: string) => String(data.get(key) ?? "").trim();

        const parsedLines = lines.map((line) => ({
          accountCode: line.accountCode,
          debit: Number(line.debit || "0"),
          credit: Number(line.credit || "0"),
        }));

        for (const line of parsedLines) {
          if (!Number.isInteger(line.debit) || !Number.isInteger(line.credit) || line.debit < 0 || line.credit < 0) {
            throw new Error("المبالغ يجب أن تكون أعداداً صحيحة غير سالبة");
          }
          if ((line.debit > 0) === (line.credit > 0)) {
            throw new Error("كل سطر يجب أن يحتوي على مبلغ مدين أو دائن فقط");
          }
        }

        const debit = parsedLines.reduce((sum, line) => sum + line.debit, 0);
        const credit = parsedLines.reduce((sum, line) => sum + line.credit, 0);
        if (debit !== credit) {
          throw new Error("القيد غير متوازن: يجب أن يتساوى مجموع المدين مع مجموع الدائن");
        }

        await postJson("/api/journal", {
          entryNumber: text("entryNumber"),
          entryDate: new Date(text("entryDate")).toISOString(),
          description: text("description") || null,
          status: text("status") || "draft",
          lines: parsedLines,
        });

        setLines([emptyLine(), emptyLine()]);
      }}
    >
      <label>
        رقم القيد
        <input name="entryNumber" required maxLength={64} />
      </label>
      <label>
        التاريخ
        <input name="entryDate" type="date" required />
      </label>
      <label>
        الحالة
        <select name="status" defaultValue="draft">
          <option value="draft">مسودة</option>
          <option value="posted">مرحّل</option>
        </select>
      </label>
      <label>
        البيان
        <input name="description" maxLength={2000} />
      </label>

      <div className="journal-lines">
        {lines.map((line, index) => (
          <div className="journal-line chart-line" key={index}>
            <select
              value={line.accountCode}
              onChange={(e) => updateLine(index, "accountCode", e.target.value)}
              required
              aria-label="الحساب"
            >
              <option value="" disabled>
                اختر الحساب
              </option>
              {accounts.map((account) => (
                <option key={account.code} value={account.code}>
                  {account.code} - {account.name}
                </option>
              ))}
            </select>
            <input
              placeholder="مدين"
              type="number"
              min={0}
              step={1}
              value={line.debit}
              onChange={(e) => updateLine(index, "debit", e.target.value)}
            />
            <input
              placeholder="دائن"
              type="number"
              min={0}
              step={1}
              value={line.credit}
              onChange={(e) => updateLine(index, "credit", e.target.value)}
            />
            <button
              type="button"
              className="secondary-btn"
              disabled={lines.length <= 2}
              onClick={() => setLines((current) => current.filter((_, i) => i !== index))}
            >
              حذف
            </button>
          </div>
        ))}
        <div className="journal-footer">
          <button type="button" className="secondary-btn" onClick={() => setLines((current) => [...current, emptyLine()])}>
            إضافة سطر
          </button>
          <span className={totalDebit === totalCredit && totalDebit > 0 ? "status paid" : "status pending"}>
            مدين {totalDebit} / دائن {totalCredit}
          </span>
        </div>
      </div>
    </FormPanel>
  );
}
