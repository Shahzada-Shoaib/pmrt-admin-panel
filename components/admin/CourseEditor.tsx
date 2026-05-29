"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LessonManager } from "@/components/admin/LessonManager";
import { AdminModal } from "@/components/admin/ui/AdminModal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, inputClass, labelClass } from "@/components/admin/ui/FormField";
import type { CourseDto } from "@/lib/courses";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type CourseEditorProps = {
  mode: "create" | "edit";
  courseId?: string;
  initial?: CourseDto & { isPublished?: boolean; sortOrder?: number };
  /** When true, only course details card (lessons rendered separately on edit page). */
  detailsOnly?: boolean;
};

const levels = ["Beginner", "Intermediate", "Advanced"];

export function CourseEditor({ mode, courseId, initial, detailsOnly = false }: CourseEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [id, setId] = useState(initial?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [instructor, setInstructor] = useState(initial?.instructor ?? "PMRT Faculty");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [durationLabel, setDurationLabel] = useState(initial?.duration ?? "0h");
  const [level, setLevel] = useState(initial?.level ?? "Beginner");
  const [objectivesText, setObjectivesText] = useState(
    (initial?.objectives ?? []).join("\n"),
  );
  const [isPublished, setIsPublished] = useState(initial?.isPublished ?? false);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(false);

  const buildPayload = () => ({
    id: slugify(id.trim() || title.trim()),
    title: title.trim(),
    instructor: instructor.trim(),
    description: description.trim(),
    thumbnail: thumbnail.trim(),
    duration_label: durationLabel.trim(),
    level,
    objectives: objectivesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    is_published: isPublished,
    sort_order: sortOrder,
  });

  const uploadThumbnail = async (file: File) => {
    setUploadingThumbnail(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "thumbnails");

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Upload failed.");
      }
      setThumbnail(data.url);
      setMessage("Thumbnail uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMessage(null);

    if (thumbnail.trim().startsWith("data:")) {
      setError(
        "Thumbnail cannot be a pasted base64 string. Use Upload image or an https:// URL.",
      );
      setSaving(false);
      return;
    }

    try {
      const payload = buildPayload();
      const url =
        mode === "create" ? "/api/admin/courses" : `/api/admin/courses/${courseId}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save course.");
      }

      if (mode === "create") {
        router.push(`/admin/courses/${encodeURIComponent(data.id)}`);
        router.refresh();
        return;
      }

      setMessage("Course saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== "edit" || !courseId) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete.");
      }
      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setSaving(false);
      setConfirmDeleteCourse(false);
    }
  };

  const thumbnailPreview =
    thumbnail && !thumbnail.startsWith("data:") ? thumbnail : null;

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Course details</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Basic info shown in the mobile app course list and overview.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {mode === "create" ? (
            <FormField
              label="Course ID (slug)"
              className="sm:col-span-2"
              hint="Auto-generated from title. Use lowercase letters, numbers, and hyphens only."
            >
              <input
                className={inputClass}
                value={id}
                onChange={(e) => setId(slugify(e.target.value))}
                placeholder="professional-android-repair"
              />
            </FormField>
          ) : null}

          <FormField label="Title" className="sm:col-span-2">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => {
                const nextTitle = e.target.value;
                setTitle(nextTitle);
                if (mode === "create") {
                  setId(slugify(nextTitle));
                }
              }}
              placeholder="Professional Android Repair Program"
            />
          </FormField>

          <FormField label="Instructor">
            <input
              className={inputClass}
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </FormField>

          <FormField label="Level">
            <select
              className={inputClass}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Duration label">
            <input
              className={inputClass}
              value={durationLabel}
              onChange={(e) => setDurationLabel(e.target.value)}
              placeholder="8h 30m"
            />
          </FormField>

          <FormField label="Sort order">
            <input
              type="number"
              className={inputClass}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </FormField>

          <div className="sm:col-span-2">
            <span className={labelClass}>Course thumbnail</span>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="h-24 w-36 rounded-xl border border-[var(--border)] object-cover"
                />
              ) : (
                <div className="flex h-24 w-36 items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-slate-50 text-xs text-[var(--muted)]">
                  No image
                </div>
              )}
              <button
                type="button"
                onClick={() => setThumbnailModalOpen(true)}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Change thumbnail
              </button>
            </div>
            {thumbnail.startsWith("data:") ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Current value is base64. Open Change thumbnail to fix.
              </p>
            ) : null}
          </div>

          <FormField label="Description" className="sm:col-span-2">
            <textarea
              className={`${inputClass} min-h-[120px] resize-y`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>

          <FormField
            label="Learning outcomes (one per line)"
            className="sm:col-span-2"
          >
            <textarea
              className={`${inputClass} min-h-[100px] resize-y`}
              value={objectivesText}
              onChange={(e) => setObjectivesText(e.target.value)}
            />
          </FormField>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
              />
              <span className={labelClass}>Published (visible in mobile app)</span>
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--primary)]/30 hover:bg-[var(--primary-dark)] disabled:opacity-60"
          >
            {saving ? "Saving…" : mode === "create" ? "Create course" : "Save changes"}
          </button>
          <Link
            href="/admin/courses"
            className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            Cancel
          </Link>
          {mode === "edit" ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirmDeleteCourse(true)}
              className="ml-auto rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              Delete course
            </button>
          ) : null}
        </div>
      </section>

      {mode === "edit" && courseId && initial && !detailsOnly ? (
        <LessonManager courseId={courseId} lessons={initial.lessons} />
      ) : null}

      <AdminModal
        open={thumbnailModalOpen}
        onClose={() => setThumbnailModalOpen(false)}
        title="Course thumbnail"
        description="Upload an image or paste a public https:// link. Do not paste base64."
        footer={
          <button
            type="button"
            onClick={() => setThumbnailModalOpen(false)}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)]"
          >
            Done
          </button>
        }
      >
        {thumbnailPreview ? (
          <img
            src={thumbnailPreview}
            alt="Thumbnail preview"
            className="mb-4 h-40 w-full max-w-sm rounded-xl border border-[var(--border)] object-cover"
          />
        ) : null}
        <label className="mb-4 inline-flex cursor-pointer items-center rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50">
          {uploadingThumbnail ? "Uploading…" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploadingThumbnail}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadThumbnail(file);
              e.target.value = "";
            }}
          />
        </label>
        <FormField label="Image URL" hint="Optional if you uploaded above.">
          <input
            className={inputClass}
            value={thumbnail.startsWith("data:") ? "" : thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            placeholder="https://..."
          />
        </FormField>
      </AdminModal>

      <ConfirmDialog
        open={confirmDeleteCourse}
        title="Delete course?"
        message="Delete this course and all lessons? This cannot be undone."
        confirmLabel="Delete course"
        variant="danger"
        loading={saving}
        onCancel={() => setConfirmDeleteCourse(false)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
