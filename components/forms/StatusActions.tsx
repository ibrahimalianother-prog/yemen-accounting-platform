"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { patchJson } from "@/lib/client";

export type StatusAction = {
  label: string;
  payload: Record<string, string>;
  confirm?: string;
  secondary?: boolean;
};

export function StatusActions({ endpoint, actions }: { endpoint: string; actions: StatusAction[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (actions.length === 0) return null;

  const run = async (action: StatusAction) => {
    if (action.confirm && !window.confirm(action.confirm)) return;

    setBusy(true);
    setError(null);

    try {
      await patchJson(endpoint, action.payload);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تنفيذ العملية");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel" style={{ marginTop: 18 }}>
      <div className="panel-header">
        <h3>الإجراءات</h3>
      </div>
      <div className="form-actions" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={action.secondary ? "secondary-btn" : "primary-btn"}
            disabled={busy}
            onClick={() => run(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
      {error ? (
        <div className="error-box" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : null}
    </section>
  );
}
