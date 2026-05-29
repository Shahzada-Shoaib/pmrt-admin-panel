"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CourseContentDto } from "@/lib/courses";

type LessonManagerProps = {
  courseId: string;
  lessons: CourseContentDto[];
};

type LessonFormState = {
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

function emptyLesson(sortOrder: number): LessonFormState {
  return {
    id: "",
    sort_order: sortOrder,
    type: "video",
    title: "",
    description: "",
    duration: "",
    video_url: "",
    material_url: "",
    material_format: "pdf",
  };
}

function fromLesson(lesson: CourseContentDto, index: number): LessonFormState {
  return {
    id: lesson.id,
    sort_order: index + 1,
    type: lesson.type,
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration ?? "",
    video_url: lesson.videoUrl ?? "",
    material_url: lesson.materialUrl ?? "",
    material_format: lesson.materialFormat === "image" ? "image" : "pdf",
  };
}

export function LessonManager({ courseId, lessons }: LessonManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LessonFormState>(emptyLesson(lessons.length + 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";
  const labelClass = "text-sm font-semibold";

  const startNew = () => {
    setEditingId(null);
    setForm(emptyLesson(lessons.length + 1));
    setError(null);
  };

  const startEdit = (lesson: CourseContentDto, index: number) => {
    setEditingId(lesson.id);
    setForm(fromLesson(lesson, index));
    setError(null);
  };

  const uploadFile = async (file: File, folder: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Upload failed.");
    }
    return data.url as string;
  };

  const saveLesson = async () => {
    setSaving(true);
    setError(null);

    if (form.video_url.startsWith("data:") || form.material_url.startsWith("data:")) {
      setError("Use Upload buttons or https:// URLs — not base64 paste.");
      setSaving(false);
      return;
    }

    const payload = {
      id: form.id || undefined,
      sort_order: form.sort_order,
      type: form.type,
      title: form.title,
      description: form.description,
      duration: form.type === "video" ? form.duration || null : null,
      video_url: form.type === "video" ? form.video_url || null : null,
      material_url: form.type === "material" ? form.material_url || null : null,
      material_format: form.type === "material" ? form.material_format : null,
    };

    try {
      const isNew = !editingId;
      const url = isNew
        ? `/api/admin/courses/${courseId}/lessons`
        : `/api/admin/lessons/${editingId}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save lesson.");
      }

      startNew();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete lesson.");
      }
      if (editingId === lessonId) startNew();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Lessons & materials</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Videos and PDF/image guides. Order matters for the mobile playlist.
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          + Add lesson
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {lessons.length > 0 ? (
        <ul className="mt-6 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
          {lessons.map((lesson, index) => (
            <li
              key={lesson.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold">
                  {index + 1}. {lesson.title}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {lesson.type}
                  {lesson.type === "video" && lesson.duration
                    ? ` · ${lesson.duration}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(lesson, index)}
                  className="text-sm font-semibold text-[var(--primary)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removeLesson(lesson.id)}
                  className="text-sm font-semibold text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-[var(--muted)]">No lessons yet. Add your first video below.</p>
      )}

      <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-slate-50/50 p-5">
        <h4 className="font-semibold">{editingId ? "Edit lesson" : "New lesson"}</h4>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Type</label>
            <select
              className={inputClass}
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as "video" | "material",
                }))
              }
            >
              <option value="video">Video</option>
              <option value="material">Material (PDF / image)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Sort order</label>
            <input
              type="number"
              className={inputClass}
              value={form.sort_order}
              onChange={(e) =>
                setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
              }
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Description</label>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          {form.type === "video" ? (
            <>
              <div>
                <label className={labelClass}>Duration</label>
                <input
                  className={inputClass}
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  placeholder="18 min"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Video URL</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                    Upload video
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void uploadFile(file, "videos")
                          .then((url) => setForm((f) => ({ ...f, video_url: url })))
                          .catch((err) =>
                            setError(err instanceof Error ? err.message : "Upload failed."),
                          );
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <input
                  className={inputClass}
                  value={form.video_url}
                  onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelClass}>Format</label>
                <select
                  className={inputClass}
                  value={form.material_format}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      material_format: e.target.value as "image" | "pdf",
                    }))
                  }
                >
                  <option value="pdf">PDF</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Material URL</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                    Upload file
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const format = file.type.includes("pdf") ? "pdf" : "image";
                        void uploadFile(file, "materials")
                          .then((url) =>
                            setForm((f) => ({
                              ...f,
                              material_url: url,
                              material_format: format,
                            })),
                          )
                          .catch((err) =>
                            setError(err instanceof Error ? err.message : "Upload failed."),
                          );
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <input
                  className={inputClass}
                  value={form.material_url}
                  onChange={(e) => setForm((f) => ({ ...f, material_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={saveLesson}
          className="mt-5 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
        >
          {saving ? "Saving…" : editingId ? "Update lesson" : "Add lesson"}
        </button>
      </div>
    </section>
  );
}
