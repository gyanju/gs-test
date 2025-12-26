"use client";
import { useParams, redirect } from "next/navigation";
import BlogFormClient from "../shared/BlogFormClient";
import { DashboardShell } from "@/components/dashboard/DashboardShell";



export default async function EditBlogPage() {
  

  const params = useParams();
  const id = params?.id as string;
  console.log("Editing blog with ID:", id);

  

  return (
    <DashboardShell>
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Blog</h1>
      <p className="mt-1 text-sm text-slate-600">Update post details.</p>
      <div className="mt-6">        
          <BlogFormClient mode="edit" id={id} />
      </div>
    </div>
    </DashboardShell>
  );
}
