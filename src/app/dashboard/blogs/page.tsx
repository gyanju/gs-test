import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BlogsListClient from "./BlogsListClient";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const c = cookies();
  const token = (await c).get("auth_token");  // Get the auth_token cookie
  const role = (await c).get("user_role");   // Get the user_role cookie

  if (!token) redirect("/login");
  if (role?.value !== "admin") redirect("/profile");

  return <BlogsListClient />;
}
