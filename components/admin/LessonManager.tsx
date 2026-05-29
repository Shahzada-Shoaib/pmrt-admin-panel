"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CourseLessonDto, LessonItemDto } from "@/lib/courses";

type LessonManagerProps = {
  courseId: string;
  lessons: CourseLessonDto[];
};

type LessonFormState = {
  id: string;
  sort_order: number;
  title: string;
  description: string;
};

type ItemFormState = {
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
    title: "",
    description: "",
  };
}

function emptyItem(sortOrder: number): ItemFormState {
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

export function LessonManager({ courseId, lessons }: LessonManagerProps) {
  const router = useRouter();
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(
    lessons[0]?.id ?? null,
  );
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLesson(lessons.length + 1));
  const [showLessonForm, setShowLessonForm] = useState(false);

  const [activeLessonIdForItem, setActiveLessonIdForItem] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItem(1));
  const [showItemForm, setShowItemForm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";
  const labelClass = "text-sm font-semibold";

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

  const startNewLesson = () => {
    setEditingLessonId(null);
    setLessonForm(emptyLesson(lessons.length + 1));
    setShowLessonForm(true);
    setError(null);
  };

  const startEditLesson = (lesson: CourseLessonDto, index: number) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      id: lesson.id,
      sort_order: index + 1,
      title: lesson.title,
      description: lesson.description,
    });
    setShowLessonForm(true);
    setError(null);
  };

  const saveLesson = async () => {
    setSaving(true);
    setError(null);

    const payload = {
      id: lessonForm.id || undefined,
      sort_order: lessonForm.sort_order,
      title: lessonForm.title,
      description: lessonForm.description,
    };

    try {
      const isNew = !editingLessonId;
      const url = isNew
        ? `/api/admin/courses/${courseId}/lessons`
        : `/api/admin/lessons/${editingLessonId}`;
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

      setShowLessonForm(false);
      setEditingLessonId(null);
      if (isNew && data.id) {
        setExpandedLessonId(data.id);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson and all its videos/materials?")) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete lesson.");
      }
      if (expandedLessonId === lessonId) setExpandedLessonId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const startNewItem = (lesson: CourseLessonDto) => {
    setActiveLessonIdForItem(lesson.id);
    setEditingItemId(null);
    setItemForm(emptyItem(lesson.items.length + 1));
    setShowItemForm(true);
    setExpandedLessonId(lesson.id);
    setError(null);
  };

  const startEditItem = (lessonId: string, item: LessonItemDto, index: number) => {
    setActiveLessonIdForItem(lessonId);
    setEditingItemId(item.id);
    setItemForm({
      id: item.id,
      sort_order: index + 1,
      type: item.type,
      title: item.title,
      description: item.description,
      duration: item.duration ?? "",
      video_url: item.videoUrl ?? "",
      material_url: item.materialUrl ?? "",
      material_format: item.materialFormat === "image" ? "image" : "pdf",
    });
    setShowItemForm(true);
    setExpandedLessonId(lessonId);
    setError(null);
  };

  const saveItem = async () => {
    if (!activeLessonIdForItem) return;

    if (itemForm.video_url.startsWith("data:") || itemForm.material_url.startsWith("data:")) {
      setError("Use Upload buttons or https:// URLs — not base64 paste.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      id: itemForm.id || undefined,
      sort_order: itemForm.sort_order,
      type: itemForm.type,
      title: itemForm.title,
      description: itemForm.description,
      duration: itemForm.type === "video" ? itemForm.duration || null : null,
      video_url: itemForm.type === "video" ? itemForm.video_url || null : null,
      material_url: itemForm.type === "material" ? itemForm.material_url || null : null,
      material_format: itemForm.type === "material" ? itemForm.material_format : null,
    };

    try {
      const isNew = !editingItemId;
      const url = isNew
        ? `/api/admin/lessons/${activeLessonIdForItem}/items`
        : `/api/admin/lesson-items/${editingItemId}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save item.");
      }

      setShowItemForm(false);
      setEditingItemId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!confirm("Delete this video/material?")) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lesson-items/${itemId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete item.");
      }
      if (editingItemId === itemId) {
        setShowItemForm(false);
        setEditingItemId(null);
      }
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
          <h3 className="text-lg font-semibold">Lessons</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Each lesson groups multiple videos and study materials. Order matters in the mobile app.
          </p>
        </div>
        <button
          type="button"
          onClick={startNewLesson}
          className="rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          + Add lesson
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {lessons.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          No lessons yet. Add a lesson, then add videos and materials inside it.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {lessons.map((lesson, lessonIndex) => {
            const expanded = expandedLessonId === lesson.id;
            const videoCount = lesson.items.filter((i) => i.type === "video").length;
            const materialCount = lesson.items.filter((i) => i.type === "material").length;

            return (
              <li
                key={lesson.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setExpandedLessonId(expanded ? null : lesson.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="font-semibold">
                      {lessonIndex + 1}. {lesson.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {videoCount} video{videoCount === 1 ? "" : "s"} · {materialCount} material
                      {materialCount === 1 ? "" : "s"}
                      {lesson.description ? ` · ${lesson.description.slice(0, 60)}` : ""}
                    </p>
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startNewItem(lesson)}
                      className="text-sm font-semibold text-[var(--primary)]"
                    >
                      + Item
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditLesson(lesson, lessonIndex)}
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
                </div>

                {expanded ? (
                  <div className="border-t border-[var(--border)] bg-slate-50/60 px-4 py-3">
                    {lesson.items.length === 0 ? (
                      <p className="text-sm text-[var(--muted)]">
                        No videos or materials in this lesson yet.
                      </p>
                    ) : (
                      <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-white">
                        {lesson.items.map((item, itemIndex) => (
                          <li
                            key={item.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">
                                {itemIndex + 1}. {item.title}
                              </p>
                              <p className="text-xs text-[var(--muted)]">
                                {item.type}
                                {item.type === "video" && item.duration
                                  ? ` · ${item.duration}`
                                  : ""}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEditItem(lesson.id, item, itemIndex)}
                                className="text-xs font-semibold text-[var(--primary)]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-xs font-semibold text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      {showLessonForm ? (
        <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-slate-50/50 p-5">
          <h4 className="font-semibold">{editingLessonId ? "Edit lesson" : "New lesson"}</h4>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={lessonForm.sort_order}
                onChange={(e) =>
                  setLessonForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Lesson title</label>
              <input
                className={inputClass}
                value={lessonForm.title}
                onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Lesson description</label>
              <textarea
                className={`${inputClass} min-h-[80px]`}
                value={lessonForm.description}
                onChange={(e) => setLessonForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={saveLesson}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
            >
              {saving ? "Saving…" : editingLessonId ? "Update lesson" : "Add lesson"}
            </button>
            <button
              type="button"
              onClick={() => setShowLessonForm(false)}
              className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showItemForm && activeLessonIdForItem ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--primary)]/40 bg-teal-50/30 p-5">
          <h4 className="font-semibold">
            {editingItemId ? "Edit video / material" : "Add video or material"}
          </h4>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Inside lesson: {lessons.find((l) => l.id === activeLessonIdForItem)?.title}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Type</label>
              <select
                className={inputClass}
                value={itemForm.type}
                onChange={(e) =>
                  setItemForm((f) => ({
                    ...f,
                    type: e.target.value as "video" | "material",
                  }))
                }
              >
                <option value="video">Video</option>
                <option value="material">Study material (PDF / image)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Sort order</label>
              <input
                type="number"
                className={inputClass}
                value={itemForm.sort_order}
                onChange={(e) =>
                  setItemForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Title</label>
              <input
                className={inputClass}
                value={itemForm.title}
                onChange={(e) => setItemForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} min-h-[72px]`}
                value={itemForm.description}
                onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {itemForm.type === "video" ? (
              <>
                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    className={inputClass}
                    value={itemForm.duration}
                    onChange={(e) => setItemForm((f) => ({ ...f, duration: e.target.value }))}
                    placeholder="18 min"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Video URL</label>
                  <label className="mt-1 inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                    Upload video
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void uploadFile(file, "videos")
                          .then((url) => setItemForm((f) => ({ ...f, video_url: url })))
                          .catch((err) =>
                            setError(err instanceof Error ? err.message : "Upload failed."),
                          );
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <input
                    className={inputClass}
                    value={itemForm.video_url}
                    onChange={(e) => setItemForm((f) => ({ ...f, video_url: e.target.value }))}
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
                    value={itemForm.material_format}
                    onChange={(e) =>
                      setItemForm((f) => ({
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
                  <label className="mt-1 inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
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
                            setItemForm((f) => ({
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
                  <input
                    className={inputClass}
                    value={itemForm.material_url}
                    onChange={(e) => setItemForm((f) => ({ ...f, material_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={saveItem}
              className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
            >
              {saving ? "Saving…" : editingItemId ? "Update item" : "Add item"}
            </button>
            <button
              type="button"
              onClick={() => setShowItemForm(false)}
              className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
