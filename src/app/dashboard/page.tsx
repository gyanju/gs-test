// src/app/dashboard/page.tsx
import { cookies } from 'next/headers'; // Import cookies from next/headers
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = (await cookieStore).get("auth_token");  // Get the auth_token cookie
  const role = (await cookieStore).get("user_role");   // Get the user_role cookie

  // Check if token or role is missing, or role is not admin, redirect to login
  /*if (!token || role?.value !== "admin") {
    return (
      <div>
        You are not authorized to view this page. Please log in as an admin.
      </div>
    );
  }*/
  if (!token) redirect("/login");
  if (role?.value !== "admin") redirect("/profile");

  // Fetch user count from your API or database
  const baseUrl = process.env.APP_URL || "http://localhost:3000";

  let count = 0;
  let error: string | null = null;

  try {
    const res = await fetch(`${baseUrl}/api/users/count`, {
      cache: "no-store",
      // if later you protect the count endpoint with auth, forward cookies like this:
      // headers: { cookie: cookieStore.toString() },
    });

    const data = await res.json();
    if (!res.ok) error = data.error || "Failed to load user count";
    else count = data.count ?? 0;
  } catch {
    error = "Failed to load user count";
  }

  return (
    <DashboardShell>
      <h1 className="text-2xl font-semibold text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-600">Quick snapshot of your app.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Users
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-slate-900">
              {count}
            </span>
          </div>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <p className="mt-3 text-xs text-slate-500">
            Number of users currently stored in the database.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}