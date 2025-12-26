import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BlogFormClient from "../shared/BlogFormClient";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const c = cookies();
  const token = (await c).get("auth_token");  // Get the auth_token cookie
  const role = (await c).get("user_role");   // Get the user_role cookie

  if (!token) redirect("/login");
  if (role?.value !== "admin") redirect("/profile");

  return (
    <DashboardShell>
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Add Blog</h1>
      <p className="mt-1 text-sm text-slate-600">Create a new post.</p>
      <div className="mt-6">        
          <BlogFormClient mode="create" />
      </div>
    </div>
    </DashboardShell>
  );
}
