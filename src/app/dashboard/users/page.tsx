"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

type UserItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role?: string;
};

const PAGE_SIZE = 10;

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [sortField, setSortField] = useState<"createdAt" | "firstName" | "lastName" | "email">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    async function loadUsers() {
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

        const res = await fetch(`/api/users?${params.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load users");
        } else {
          setUsers(data.users);
          setTotal(data.total);
          setSelectedIds([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [page, search, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function toggleSort(field: "firstName" | "lastName" | "email" | "createdAt") {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "createdAt" ? "desc" : "asc");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user");
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected user(s)?`)) return;

    setBulkDeleting(true);
    try {
      const res = await fetch("/api/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete users");
      } else {
        setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        setTotal((prev) => Math.max(0, prev - selectedIds.length));
        setSelectedIds([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete users");
    } finally {
      setBulkDeleting(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
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
          <h1 className="text-2xl font-semibold text-slate-50">Users</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your application users.
          </p>
        </div>
        <Link
          href="/dashboard/users/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Add user
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
            placeholder="Search by name, email, or phone"
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
          <p className="text-sm text-slate-400">Loading users...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-400">No users found.</p>
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
                          users.length > 0 &&
                          selectedIds.length === users.length
                        }
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2">Avatar</th>
                    <th
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSort("firstName")}
                    >
                      Name{renderSortArrow("firstName")}
                    </th>
                    <th
                      className="cursor-pointer px-3 py-2"
                      onClick={() => toggleSort("email")}
                    >
                      Email{renderSortArrow("email")}
                    </th>
                    <th className="px-3 py-2">Phone</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(user.id)}
                          onChange={() => toggleSelect(user.id)}
                        />
                      </td>
                      <td className="px-3 py-2">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.firstName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-slate-200">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-slate-100">
                          {user.firstName} {user.lastName}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {user.email}
                      </td>
                      <td className="px-3 py-2 text-slate-300">
                        {user.phone}
                      </td>
                      <td className="px-3 py-2 text-xs uppercase tracking-wide text-slate-300">
                        {user.role || "user"}
                      </td>
                      <td className="px-3 py-2 text-right text-sm">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="mr-3 text-blue-400 hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="text-red-400 hover:underline disabled:cursor-not-allowed disabled:text-red-300"
                        >
                          {deletingId === user.id
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
                Page {page} of {totalPages} • {total} user
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
