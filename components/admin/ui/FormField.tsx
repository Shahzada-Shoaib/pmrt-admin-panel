import type { ReactNode } from "react";

export const inputClass =
  "mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

export const labelClass = "text-sm font-semibold text-[var(--foreground)]";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, hint, className, children }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {hint ? <p className="mt-1 text-xs text-[var(--muted)]">{hint}</p> : null}
      {children}
    </div>
  );
}
