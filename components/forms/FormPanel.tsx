"use client";

import { FormEvent, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

type FormPanelProps = {
  buttonLabel: string;
  title: string;
  submitLabel?: string;
  onSubmit: (data: FormData) => Promise<void>;
  children: ReactNode;
};

export function FormPanel({ buttonLabel, title, submitLabel = "حفظ", onSubmit, children }: FormPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(new FormData(form));
      form.reset();
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تنفيذ العملية");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel full-width form-panel">
      <div className="panel-header">
        <h3>{title}</h3>
        <button type="button" className="primary-btn" onClick={() => setOpen((current) => !current)}>
          {open ? "إغلاق النموذج" : buttonLabel}
        </button>
      </div>

      {open ? (
        <form className="form-grid" onSubmit={handleSubmit}>
          {children}
          {error ? <div className="error-box">{error}</div> : null}
          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={() => setOpen(false)}>
              إلغاء
            </button>
            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "جاري الحفظ..." : submitLabel}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
