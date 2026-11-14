"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patchJson } from "@/lib/client";

type Props = { userId: string; role: string; isActive: boolean };

export function UserRowActions({ userId, role, isActive }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (payload: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await patchJson(`/api/admin/users/${userId}`, payload);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تنفيذ العملية");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <select
        className="inline-select"
        value={role}
        disabled={busy}
        onChange={(event) => update({ role: event.target.value })}
        aria-label="الدور"
      >
        <option value="accountant">محاسب</option>
        <option value="cashier">أمين صندوق</option>
        <option value="sales">مندوب مبيعات</option>
        <option value="auditor">مراجع للقراءة فقط</option>
      </select>
      <button
        type="button"
        className="secondary-btn"
        disabled={busy}
        onClick={() => {
          if (isActive && !window.confirm("هل تريد تعطيل هذا الحساب؟")) return;
          update({ isActive: !isActive });
        }}
      >
        {isActive ? "تعطيل" : "تفعيل"}
      </button>
      {error ? <span className="error-box">{error}</span> : null}
    </div>
  );
}
