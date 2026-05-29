"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminModal } from "@/components/admin/ui/AdminModal";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { FormField, inputClass } from "@/components/admin/ui/FormField";
import type { AdminStudyMaterialRow } from "@/lib/study-materials-admin";

const MATERIAL_ACCEPT =
  "application/pdf,image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml,image/heic,image/heif,image/avif";

type StudyMaterialFormState = {
  id: string;
  title: string;
  material_url: string;
  material_format: "pdf" | "image";
  sort_order: number;
  is_published: boolean;
};

type StudyMaterialsAdminProps = {
  materials: AdminStudyMaterialRow[];
};

function emptyForm(sortOrder: number): StudyMaterialFormState {
  return {
    id: "",
    title: "",
    material_url: "",
    material_format: "pdf",
    sort_order: sortOrder,
    is_published: false,
  };
}

export function StudyMaterialsAdmin({ materials }: StudyMaterialsAdminProps) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudyMaterialFormState>(emptyForm(materials.length + 1));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "free-materials");
    const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error ?? "Upload failed.");
    }
    return data.url as string;
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setError(null);
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm(materials.length + 1));
    setModal("create");
    setError(null);
  };

  const startEdit = (material: AdminStudyMaterialRow, index: number) => {
    setEditingId(material.id);
    setForm({
      id: material.id,
      title: material.title,
      material_url: material.material_url,
      material_format: material.material_format === "image" ? "image" : "pdf",
      sort_order: index + 1,
      is_published: material.is_published,
    });
    setModal("edit");
    setError(null);
  };

  const save = async () => {
    if (form.material_url.startsWith("data:")) {
      setError("Use Upload or an https:// URL — not base64 paste.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      id: form.id || undefined,
      title: form.title,
      material_url: form.material_url,
      material_format: form.material_format,
      sort_order: form.sort_order,
      is_published: form.is_published,
    };

    try {
      const isNew = modal === "create";
      const url = isNew ? "/api/admin/study-materials" : `/api/admin/study-materials/${editingId}`;
      const method = isNew ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save material.");
      }

      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/study-materials/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete material.");
      }
      setDeleteId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const modalFooter = (
    <>
      <button
        type="button"
        disabled={saving || uploading}
        onClick={closeModal}
        className="rounded-xl border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="button"
        disabled={saving || uploading}
        onClick={save}
        className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--primary-dark)] disabled:opacity-60"
      >
        {saving ? "Saving…" : modal === "edit" ? "Update material" : "Add material"}
      </button>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Content</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Free Study Material</h2>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--primary)]/30 transition hover:bg-[var(--primary-dark)]"
        >
          + Add material
        </button>
      </header>

      <div className="flex-1 p-8">
      {error && !modal ? (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      {materials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
          <p className="text-lg font-semibold">No study materials yet</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Add PDFs or images for the mobile Free Study Material screen.
          </p>
          <button
            type="button"
            onClick={startCreate}
            className="mt-6 inline-flex rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Add material
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-slate-50 text-[var(--muted)]">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Format</th>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {materials.map((material, index) => (
                <tr
                  key={material.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold">{material.title}</p>
                    <p className="text-xs text-[var(--muted)]">{material.id}</p>
                  </td>
                  <td className="px-6 py-4 uppercase text-[var(--muted)]">
                    {material.material_format}
                  </td>
                  <td className="px-6 py-4">{material.sort_order}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        material.is_published
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {material.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(material, index)}
                      className="mr-3 font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(material.id)}
                      className="font-semibold text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      <AdminModal
        open={modal !== null}
        onClose={closeModal}
        title={modal === "edit" ? "Edit study material" : "New study material"}
        description="Shown on the mobile Free Study Material screen when published."
        size="lg"
        footer={modalFooter}
      >
        {error && modal ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" className="sm:col-span-2">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>
          <FormField label="Format">
            <select
              className={inputClass}
              value={form.material_format}
              onChange={(e) =>
                setForm({
                  ...form,
                  material_format: e.target.value as "pdf" | "image",
                })
              }
            >
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
            </select>
          </FormField>
          <FormField label="Sort order">
            <input
              type="number"
              className={inputClass}
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </FormField>
          <FormField label="Published" className="sm:col-span-2">
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              />
              Visible in mobile app
            </label>
          </FormField>
          <FormField
            label="Material URL"
            className="sm:col-span-2"
            hint="PDF or common image formats (max 15 MB) via upload, or paste a URL."
          >
            <label className="mb-2 inline-flex cursor-pointer rounded-lg border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
              {uploading ? "Uploading…" : "Upload file"}
              <input
                type="file"
                accept={MATERIAL_ACCEPT}
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const format = file.type.includes("pdf") ? "pdf" : "image";
                  setUploading(true);
                  setError(null);
                  void uploadFile(file)
                    .then((url) =>
                      setForm((f) => ({
                        ...f,
                        material_url: url,
                        material_format: format,
                      })),
                    )
                    .catch((err) =>
                      setError(err instanceof Error ? err.message : "Upload failed."),
                    )
                    .finally(() => setUploading(false));
                  e.target.value = "";
                }}
              />
            </label>
            <input
              className={inputClass}
              value={form.material_url}
              onChange={(e) => setForm({ ...form, material_url: e.target.value })}
              placeholder="https://..."
            />
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete study material?"
        message="Remove this item from the mobile app? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={saving}
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) void remove(deleteId);
        }}
      />
    </div>
  );
}
