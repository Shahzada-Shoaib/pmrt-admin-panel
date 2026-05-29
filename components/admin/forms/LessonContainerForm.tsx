import { FormField, inputClass } from "@/components/admin/ui/FormField";

export type LessonFormState = {
  id: string;
  sort_order: number;
  title: string;
  description: string;
};

type LessonContainerFormProps = {
  value: LessonFormState;
  onChange: (next: LessonFormState) => void;
};

export function LessonContainerForm({ value, onChange }: LessonContainerFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Sort order">
        <input
          type="number"
          className={inputClass}
          value={value.sort_order}
          onChange={(e) => onChange({ ...value, sort_order: Number(e.target.value) })}
        />
      </FormField>
      <FormField label="Lesson title" className="sm:col-span-2">
        <input
          className={inputClass}
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="e.g. Bench setup & opening"
        />
      </FormField>
      <FormField label="Lesson description" className="sm:col-span-2">
        <textarea
          className={`${inputClass} min-h-[88px] resize-y`}
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
          placeholder="Short summary for the mobile app"
        />
      </FormField>
    </div>
  );
}
