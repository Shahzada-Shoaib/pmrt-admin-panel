"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  LessonContainerForm,
  type LessonFormState,
} from "@/components/admin/forms/LessonContainerForm";
import { LessonItemForm, type ItemFormState } from "@/components/admin/forms/LessonItemForm";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import type { CourseLessonDto, LessonItemDto } from "@/lib/courses";

type LessonManagerProps = {
  courseId: string;
  lessons: CourseLessonDto[];
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

type ConfirmState =
  | { type: "lesson"; id: string }
  | { type: "item"; id: string }
  | null;

export function LessonManager({ courseId, lessons }: LessonManagerProps) {
  const router = useRouter();

  const [lessonModal, setLessonModal] = useState<"create" | "edit" | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLesson(lessons.length + 1));

  const [itemModal, setItemModal] = useState<"create" | "edit" | null>(null);
  const [activeLessonIdForItem, setActiveLessonIdForItem] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItem(1));

  const [saving, setSaving] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);

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

  const closeLessonModal = () => {
    setLessonModal(null);
    setEditingLessonId(null);
    setError(null);
  };

  const closeItemModal = () => {
    setItemModal(null);
    setEditingItemId(null);
    setActiveLessonIdForItem(null);
    setError(null);
  };

  const startNewLesson = () => {
    setEditingLessonId(null);
    setLessonForm(emptyLesson(lessons.length + 1));
    setLessonModal("create");
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
    setLessonModal("edit");
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
      const isNew = lessonModal === "create";
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

      closeLessonModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeLesson = async (lessonId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete lesson.");
      }
      setConfirm(null);
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
    setItemModal("create");
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
    setItemModal("edit");
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
      const isNew = itemModal === "create";
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

      closeItemModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (itemId: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lesson-items/${itemId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete item.");
      }
      if (editingItemId === itemId) {
        closeItemModal();
      }
      setConfirm(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const activeLessonTitle = lessons.find((l) => l.id === activeLessonIdForItem)?.title;

  const lessonModalFooter = (
    <>
      <button
        type="button"
        disabled={saving}
        onClick={closeLessonModal}
        className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={saveLesson}
        className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
      >
        {saving ? "Saving…" : lessonModal === "edit" ? "Update lesson" : "Add lesson"}
      </button>
    </>
  );

  const itemModalFooter = (
    <>
      <button
        type="button"
        disabled={saving || uploadingMedia}
        onClick={closeItemModal}
        className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={saving || uploadingMedia}
        onClick={saveItem}
        className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
      >
        {saving ? "Saving…" : itemModal === "edit" ? "Update item" : "Add item"}
      </button>
    </>
  );

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

      {error && !lessonModal && !itemModal ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {lessons.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          No lessons yet. Add a lesson, then add videos and materials inside it.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {lessons.map((lesson, lessonIndex) => {
            const videoCount = lesson.items.filter((i) => i.type === "video").length;
            const materialCount = lesson.items.filter((i) => i.type === "material").length;

            return (
              <li
                key={lesson.id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-slate-50/50 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {lessonIndex + 1}. {lesson.title}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {videoCount} video{videoCount === 1 ? "" : "s"} · {materialCount} material
                      {materialCount === 1 ? "" : "s"}
                    </p>
                    {lesson.description ? (
                      <p className="mt-1 text-xs text-[var(--muted)]">{lesson.description}</p>
                    ) : null}
                  </div>
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
                      onClick={() => setConfirm({ type: "lesson", id: lesson.id })}
                      className="text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="px-4 py-3">
                  {lesson.items.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">
                      No videos or materials yet. Click + Item to add content.
                    </p>
                  ) : (
                    <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                      {lesson.items.map((item, itemIndex) => (
                        <li
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 hover:bg-slate-50/80"
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
                              onClick={() => setConfirm({ type: "item", id: item.id })}
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
              </li>
            );
          })}
        </ul>
      )}

      <AdminModal
        open={lessonModal !== null}
        onClose={closeLessonModal}
        title={lessonModal === "edit" ? "Edit lesson" : "New lesson"}
        description="A lesson groups videos and study materials in the mobile app."
        footer={lessonModalFooter}
      >
        {error && lessonModal ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <LessonContainerForm value={lessonForm} onChange={setLessonForm} />
      </AdminModal>

      <AdminModal
        open={itemModal !== null}
        onClose={closeItemModal}
        title={itemModal === "edit" ? "Edit video / material" : "Add video or material"}
        description={
          activeLessonTitle ? `Inside lesson: ${activeLessonTitle}` : undefined
        }
        size="lg"
        footer={itemModalFooter}
      >
        {error && itemModal ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <LessonItemForm
          value={itemForm}
          onChange={setItemForm}
          uploading={uploadingMedia}
          onUploadVideo={(file) => {
            setUploadingMedia(true);
            setError(null);
            void uploadFile(file, "videos")
              .then((url) => setItemForm((f) => ({ ...f, video_url: url })))
              .catch((err) =>
                setError(err instanceof Error ? err.message : "Upload failed."),
              )
              .finally(() => setUploadingMedia(false));
          }}
          onUploadMaterial={(file) => {
            setUploadingMedia(true);
            setError(null);
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
              )
              .finally(() => setUploadingMedia(false));
          }}
        />
      </AdminModal>

      <ConfirmDialog
        open={confirm?.type === "lesson"}
        title="Delete lesson?"
        message="Delete this lesson and all its videos and study materials? This cannot be undone."
        confirmLabel="Delete lesson"
        variant="danger"
        loading={saving}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "lesson") void removeLesson(confirm.id);
        }}
      />

      <ConfirmDialog
        open={confirm?.type === "item"}
        title="Delete item?"
        message="Delete this video or study material?"
        confirmLabel="Delete"
        variant="danger"
        loading={saving}
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm?.type === "item") void removeItem(confirm.id);
        }}
      />
    </section>
  );
}
