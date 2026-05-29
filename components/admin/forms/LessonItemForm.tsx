import { FormField, inputClass } from "@/components/admin/ui/FormField";

export type ItemFormState = {
  id: string;
  sort_order: number;
  type: "video" | "material";
  title: string;
  description: string;
  duration: string;
  video_url: string;
  material_url: string;
  material_format: "image" | "pdf";
};

type LessonItemFormProps = {
  value: ItemFormState;
  onChange: (next: ItemFormState) => void;
  uploading?: boolean;
  onUploadVideo: (file: File) => void;
  onUploadMaterial: (file: File) => void;
};

export function LessonItemForm({
  value,
  onChange,
  uploading = false,
  onUploadVideo,
  onUploadMaterial,
}: LessonItemFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Details</p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FormField label="Type">
            <select
              className={inputClass}
              value={value.type}
              onChange={(e) =>
                onChange({
                  ...value,
                  type: e.target.value as "video" | "material",
                })
              }
            >
              <option value="video">Video</option>
              <option value="material">Study material (PDF / image)</option>
            </select>
          </FormField>
          <FormField label="Sort order">
            <input
              type="number"
              className={inputClass}
              value={value.sort_order}
              onChange={(e) => onChange({ ...value, sort_order: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Title" className="sm:col-span-2">
            <input
              className={inputClass}
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
            />
          </FormField>
          <FormField label="Description" className="sm:col-span-2">
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              value={value.description}
              onChange={(e) => onChange({ ...value, description: e.target.value })}
            />
          </FormField>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Media</p>
        {value.type === "video" ? (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <FormField label="Duration">
              <input
                className={inputClass}
                value={value.duration}
                onChange={(e) => onChange({ ...value, duration: e.target.value })}
                placeholder="18 min"
              />
            </FormField>
            <FormField
              label="Video URL"
              className="sm:col-span-2"
              hint="MP4/WebM upload (max 15 MB) or paste a direct video URL. YouTube watch links are not supported in the app yet."
            >
              <label className="mb-2 inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                {uploading ? "Uploading…" : "Upload video"}
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadVideo(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <input
                className={inputClass}
                value={value.video_url}
                onChange={(e) => onChange({ ...value, video_url: e.target.value })}
                placeholder="https://..."
              />
            </FormField>
          </div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <FormField label="Format" hint="PDF or image via upload or URL.">
              <select
                className={inputClass}
                value={value.material_format}
                onChange={(e) =>
                  onChange({
                    ...value,
                    material_format: e.target.value as "image" | "pdf",
                  })
                }
              >
                <option value="pdf">PDF</option>
                <option value="image">Image</option>
              </select>
            </FormField>
            <FormField label="Material URL" className="sm:col-span-2">
              <label className="mb-2 inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                {uploading ? "Uploading…" : "Upload file"}
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadMaterial(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <input
                className={inputClass}
                value={value.material_url}
                onChange={(e) => onChange({ ...value, material_url: e.target.value })}
                placeholder="https://..."
              />
            </FormField>
          </div>
        )}
      </div>
    </div>
  );
}
