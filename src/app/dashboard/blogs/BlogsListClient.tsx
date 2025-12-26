"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  tags: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

const PAGE_SIZE = 10;

export default function BlogsListClient() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [sortField, setSortField] = useState<"createdAt" | "title" | "slug" | "status">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    async function loadBlogs() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));
        params.set("sortField", sortField);
        params.set("sortOrder", sortOrder);  
        if (search.trim()) {
          params.set("search", search.trim());
        }
        const res = await fetch(`/api/blogs?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load blogs");
        } else {
          setBlogs(data.items || []);
          setTotal(data.total || 0);
          setSelectedIds([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load blogs");
      } finally {
        setLoading(false);
      } 
    }

    loadBlogs();
  }, [page, search, sortField, sortOrder]);
  
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function toggleSort(field: "title" | "slug" | "status" | "createdAt") {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "createdAt" ? "desc" : "asc");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete blog");
      } else {
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} blogs?`)) return;
    setBulkDeleting(true); 
    try {
      const res = await fetch(`/api/blogs/bulk-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete blogs");
      } else {
        setBlogs((prev) => prev.filter((b) => !selectedIds.includes(b.id)));
        setTotal((prev) => Math.max(0, prev - selectedIds.length));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete blogs");
    } finally {
      setBulkDeleting(false);
    }
  }

  function handleSearchSubmit (e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function toggleSelect (id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === blogs.length) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(blogs.map((b) => b.id));
    }
  }

  function renderSortArrow(field: string) {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  }

  return (
    <DashboardShell>
    
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Blogs</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your application blogs.
          </p>
        </div>

        <Link
          href="/dashboard/blogs/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Add Blog
        </Link>
      </div>

      {/* Search + bulk actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex max-w-md flex-1 gap-2"
        >
          <input
            type="text"
            placeholder="Search by title, slug, or status"
            className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button
            type="submit"
            className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-white"
          >
            Search
          </button>
        </form>

        <button
          onClick={handleBulkDelete}
          disabled={selectedIds.length === 0 || bulkDeleting}
          className="rounded-md border border-red-500 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:border-slate-700 disabled:text-slate-500"
        >
          {bulkDeleting
            ? "Deleting..."
            : selectedIds.length === 0
            ? "Delete selected"
            : `Delete selected (${selectedIds.length})`}
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-slate-900 p-4 shadow-sm ring-1 ring-slate-800">
        {loading ? (
          <p className="text-sm text-slate-400">Loading blogs...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : blogs.length === 0 ? (
          <p className="text-sm text-slate-400">No blogs found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-100">
                <thead className="border-b border-slate-700 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400">
                  <tr>
                    <th className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={
                          blogs.length > 0 &&
                          selectedIds.length === blogs.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    
                    <th
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSort("title")}
                    >
                      Title{renderSortArrow("title")}
                    </th>
                    <th
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSort("slug")}
                    >
                      Slug{renderSortArrow("slug")}
                    </th>
                    <th
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSort("status")}
                    >
                      Status{renderSortArrow("status")}
                    </th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {blogs.map((blog) => (
                    <tr key={blog.id}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(blog.id)}
                          onChange={() => toggleSelect(blog.id)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-100">
                          {blog.title}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {blog.slug}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {blog.status}
                      </td>
                      <td className="px-3 py-2 text-right text-sm">
                        <Link
                          href={`/dashboard/blogs/${blog.id}`}
                          className="mr-3 text-blue-400 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          disabled={deletingId === blog.id}
                          className="text-red-400 hover:underline disabled:cursor-not-allowed disabled:text-red-300"
                        >
                          {deletingId === blog.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>
                Page {page} of {totalPages} • {total} blog
                {total === 1 ? "" : "s"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((p) => (p < totalPages ? p + 1 : p))
                  }
                  disabled={page >= totalPages}
                  className="rounded-md border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    
    </DashboardShell>
  );
}
