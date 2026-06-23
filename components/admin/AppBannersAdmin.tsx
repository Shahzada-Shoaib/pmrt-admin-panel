"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminModal } from "@/components/admin/ui/AdminModal";
import { FormField, inputClass } from "@/components/admin/ui/FormField";
import type { AdminAppBannerRow, BannerPlacement } from "@/lib/app-banners-admin";

type AppBannersAdminProps = {
  banners: AdminAppBannerRow[];
};

type BannerFormState = {
  id: string;
  placement: BannerPlacement;
  title: string;
  subtitle: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

function emptyForm(sortOrder: number): BannerFormState {
  return {
    id: "",
    placement: "login",
    title: "",
    subtitle: "",
    image_url: "",
    sort_order: sortOrder,
    is_active: true,
  };
}

export function AppBannersAdmin({ banners }: AppBannersAdminProps) {
  const router = useRouter();
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BannerFormState>(emptyForm(banners.length + 1));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "app-banners");

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
    setForm(emptyForm(banners.length + 1));
    setEditingId(null);
    setModal("create");
    setError(null);
  };

  const startEdit = (banner: AdminAppBannerRow) => {
    setForm({
      id: banner.id,
      placement: banner.placement,
      title: banner.title ?? "",
      subtitle: banner.subtitle ?? "",
      image_url: banner.image_url,
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    setEditingId(banner.id);
    setModal("edit");
    setError(null);
  };

  const save = async () => {
    if (!form.image_url || form.image_url.startsWith("data:")) {
      setError("Upload an image or paste an https:// image URL.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const isNew = modal === "create";
      const response = await fetch(
        isNew ? "/api/admin/app-banners" : `/api/admin/app-banners/${editingId}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save banner.");
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
    if (!window.confirm("Delete this banner?")) return;

    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/app-banners/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not delete banner.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
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
        {saving ? "Saving…" : modal === "edit" ? "Update banner" : "Add banner"}
      </button>
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-8 py-6">
        <div>
          <p className="text-sm font-medium text-[var(--muted)]">Mobile app</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">Banners</h2>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[var(--primary)]/30 transition hover:bg-[var(--primary-dark)]"
        >
          + Add banner
        </button>
      </header>

      <div className="flex-1 p-8">
        {error && !modal ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        {banners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="text-lg font-semibold">No banners yet</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Add login carousel slides and the home banner from here.
            </p>
            <button
              type="button"
              onClick={startCreate}
              className="mt-6 inline-flex rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Add banner
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-slate-50 text-[var(--muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Image</th>
                  <th className="px-6 py-4 font-semibold">Placement</th>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <div
                        aria-hidden="true"
                        className="h-14 w-24 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${banner.image_url})` }}
                      />
                    </td>
                    <td className="px-6 py-4 capitalize text-[var(--muted)]">
                      {banner.placement}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{banner.title || "—"}</p>
                      {banner.subtitle ? (
                        <p className="mt-1 max-w-xs truncate text-xs text-[var(--muted)]">
                          {banner.subtitle}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">{banner.sort_order}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          banner.is_active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {banner.is_active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(banner)}
                        className="font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void remove(banner.id)}
                        className="ml-4 font-semibold text-red-600 hover:text-red-700 disabled:opacity-60"
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
        title={modal === "edit" ? "Edit banner" : "Add banner"}
        description="Use login for carousel slides and home for the home page banner."
        footer={footer}
        size="lg"
      >
        {error ? (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        <div className="grid gap-4">
          <FormField label="Placement">
            <select
              value={form.placement}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  placement: event.target.value as BannerPlacement,
                }))
              }
              className={inputClass}
            >
              <option value="login">Login carousel</option>
              <option value="home">Home banner</option>
            </select>
          </FormField>

          <FormField label="Title" hint="Required for login slides. Optional for home banner.">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className={inputClass}
            />
          </FormField>

          <FormField label="Subtitle">
            <textarea
              value={form.subtitle}
              onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
              className={`${inputClass} min-h-24`}
            />
          </FormField>

          <FormField label="Image URL" hint="Upload image or paste a direct https:// image URL.">
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={uploading || saving}
                onClick={() => document.getElementById("banner-upload")?.click()}
                className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setUploading(true);
                  uploadImage(file)
                    .then((url) => setForm((prev) => ({ ...prev, image_url: url })))
                    .catch((err) =>
                      setError(err instanceof Error ? err.message : "Upload failed."),
                    )
                    .finally(() => setUploading(false));
                }}
              />
            </div>
            <input
              value={form.image_url}
              onChange={(event) => setForm((prev) => ({ ...prev, image_url: event.target.value }))}
              className={inputClass}
              placeholder="https://..."
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Sort order">
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sort_order: Number(event.target.value) || 0 }))
                }
                className={inputClass}
              />
            </FormField>
            <label className="flex items-center gap-3 pt-7 text-sm font-semibold">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, is_active: event.target.checked }))
                }
              />
              Active
            </label>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
