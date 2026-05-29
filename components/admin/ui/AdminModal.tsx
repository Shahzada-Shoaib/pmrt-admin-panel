"use client";

import { useEffect, useRef, type ReactNode } from "react";

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
};

const sizeClass = {
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function AdminModal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: AdminModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`admin-modal fixed left-1/2 top-1/2 z-[100] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 ${sizeClass[size]} rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 shadow-xl backdrop:bg-slate-900/50`}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="flex max-h-[min(90vh,800px)] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--border)] bg-slate-50/80 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
