"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patchJson } from "@/lib/client";

type Props = {
  categoryId: string;
  accountCode: string | null;
  accounts: { code: string; name: string }[];
};

export function CategoryAccountSelect({ categoryId, accountCode, accounts }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      await patchJson(`/api/expense-categories/${categoryId}`, { accountCode: value || null });
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
        value={accountCode ?? ""}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
        aria-label="حساب المصروف"
      >
        <option value="">المصروفات العامة (افتراضي)</option>
        {accounts.map((account) => (
          <option key={account.code} value={account.code}>
            {account.code} - {account.name}
          </option>
        ))}
      </select>
      {error ? <span className="error-box">{error}</span> : null}
    </div>
  );
}
