"use client";

import { AdminModal } from "@/components/admin/ui/AdminModal";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmClass =
    variant === "danger"
      ? "rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      : "rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60";

  return (
    <AdminModal
      open={open}
      onClose={onCancel}
      title={title}
      size="md"
      footer={
        <>
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button type="button" disabled={loading} onClick={onConfirm} className={confirmClass}>
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-[var(--foreground)]">{message}</p>
    </AdminModal>
  );
}
