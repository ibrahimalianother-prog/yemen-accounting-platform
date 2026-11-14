"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/client";

export function BackfillButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    if (!window.confirm("سيتم إنشاء قيود مرحّلة للفواتير المصدرة والمصروفات المسجلة التي لا قيد لها. هل تريد المتابعة؟")) {
      return;
    }

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const result = await postJson("/api/accounting/backfill", {});
      const failed: string[] = result.failed ?? [];
      setMessage(
        `تم إنشاء ${result.entries} قيد، و${result.alreadyPosted} مستند لديه قيوده مسبقاً.` +
          (failed.length > 0 ? ` تعذّر ترحيل: ${failed.join("، ")} (راجع تعارض أرقام القيود).` : "")
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تنفيذ العملية");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="panel full-width form-panel">
      <div className="panel-header">
        <div>
          <h3>قيود السجلات القديمة</h3>
          <p className="report-body">
            أنشئ القيود المحاسبية للفواتير المصدرة والمدفوعة والمصروفات المسجلة التي سبقت الترحيل التلقائي. العملية آمنة
            للتكرار ولا تمس المستندات التي لها قيود.
          </p>
        </div>
        <button type="button" className="primary-btn" disabled={busy} onClick={run}>
          {busy ? "جاري الترحيل..." : "إنشاء القيود المفقودة"}
        </button>
      </div>
      {message ? <div className="notice">{message}</div> : null}
      {error ? <div className="error-box">{error}</div> : null}
    </section>
  );
}
