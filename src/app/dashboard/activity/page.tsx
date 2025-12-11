"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

type ActivityItem = {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  actor: { name: string; email: string } | null;
  target: { name: string; email: string } | null;
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/activity?limit=50");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load activity");
        } else {
          setLogs(data);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load activity");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold text-slate-50">
        Activity log
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Recent actions taken on users.
      </p>

      <div className="mt-6 rounded-2xl bg-slate-900 p-4 shadow-sm ring-1 ring-slate-800">
        {loading ? (
          <p className="text-sm text-slate-400">Loading activity...</p>
        ) : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-400">No activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-100">
              <thead className="border-b border-slate-700 bg-slate-900/60 text-xs font-semibold uppercase text-slate-400">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Action</th>
                  <th className="px-3 py-2">Actor</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-3 py-2 text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-xs uppercase tracking-wide text-slate-300">
                      {log.action}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-200">
                      {log.actor ? (
                        <>
                          {log.actor.name}
                          <div className="text-xs text-slate-400">
                            {log.actor.email}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500">System</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-200">
                      {log.target ? (
                        <>
                          {log.target.name}
                          <div className="text-xs text-slate-400">
                            {log.target.email}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-slate-200">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
