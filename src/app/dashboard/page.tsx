"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function DashboardPage() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCount() {
      try {
        const res = await fetch("/api/users/count");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load user count");
        } else {
          setCount(data.count);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load user count");
      } finally {
        setLoading(false);
      }
    }
    loadCount();
  }, []);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-600">
        Quick snapshot of your app.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User count card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Users
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {loading ? "…" : count ?? 0}
            </span>
          </div>
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
          <p className="mt-3 text-xs text-slate-500">
            Number of users currently stored in the database.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
