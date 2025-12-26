"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "create" | "edit";

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  status: "draft" | "published";
  tagsText: string; // comma separated in UI
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  authorName: string;
};

const empty: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  status: "draft",
  tagsText: "",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  authorName: "Admin",
};

export default function BlogFormClient({ mode, id }: { mode: Mode; id?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<BlogForm>(empty);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tags = useMemo(
    () => form.tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    [form.tagsText]
  );

  useEffect(() => {
    if (mode !== "edit" || !id) return;

    (async () => {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/blogs/${id}`, { credentials: "include", cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load blog");
      } else {
        const b = data.blog;
        setForm({
          title: b.title || "",
          slug: b.slug || "",
          excerpt: b.excerpt || "",
          content: b.content || "",
          coverImageUrl: b.coverImageUrl || "",
          status: b.status || "draft",
          tagsText: (b.tags || []).join(", "),
          metaTitle: b.metaTitle || "",
          metaDescription: b.metaDescription || "",
          canonicalUrl: b.canonicalUrl || "",
          authorName: b.authorName || "Admin",
        });
      }

      setLoading(false);
    })();
  }, [mode, id]);

  async function submit() {
    setSaving(true);
    setError(null);

    const payload = {
      ...form,
      tags,
    };

    const endpoint = mode === "create" ? "/api/blogs" : `/api/blogs/${id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(endpoint, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error || "Save failed");
      setSaving(false);
      return;
    }

    router.replace("/dashboard/blogs");
    router.refresh();
  }

  if (loading) return <div className="text-sm text-slate-600">Loading...</div>;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Slug (optional)</label>
          <input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="leave blank to auto-generate"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Content</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={12}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-slate-300"
          />
          <p className="mt-1 text-xs text-slate-500">Store markdown or HTML, your choice.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Cover Image URL</label>
            <input
              value={form.coverImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Tags (comma separated)</label>
          <input
            value={form.tagsText}
            onChange={(e) => setForm((f) => ({ ...f, tagsText: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Meta Title</label>
            <input
              value={form.metaTitle}
              onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Canonical URL</label>
            <input
              value={form.canonicalUrl}
              onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Meta Description</label>
          <textarea
            value={form.metaDescription}
            onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
            rows={3}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Author Name</label>
          <input
            value={form.authorName}
            onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={submit}
            disabled={saving}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : mode === "create" ? "Create Blog" : "Update Blog"}
          </button>

          <button
            onClick={() => router.replace("/dashboard/blogs")}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
