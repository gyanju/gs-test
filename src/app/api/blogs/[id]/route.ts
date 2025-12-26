import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";
import { logActivity } from "@/lib/activity";

function getIdFromRequest(req: NextRequest) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  const id = getIdFromRequest(req);

  try {
    await connectToDatabase();

    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    const b = await Blog.findById(id).lean();

    if (!b) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({
      blog: {
        id: b._id.toString(),
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt || "",
        content: b.content || "",
        coverImageUrl: b.coverImageUrl || "",
        status: b.status,
        tags: b.tags || [],
        metaTitle: b.metaTitle || "",
        metaDescription: b.metaDescription || "",
        canonicalUrl: b.canonicalUrl || "",
        authorName: b.authorName || "",
        publishedAt: b.publishedAt || null,
        createdAt: b.createdAt || null,
        updatedAt: b.updatedAt || null,
      },
    });
  } catch (err: any) {
    console.error("GET /api/blogs/[id] error:", err);
    if (err?.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const id = getIdFromRequest(req);

  try {
    await connectToDatabase();

    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { title, excerpt, content, coverImageUrl, status, tags, metaTitle, metaDescription, canonicalUrl, authorName, publishedAt } = body;

    if (!title || !content || !metaTitle || !metaDescription) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    let slug = (body.slug || "").trim() || slugify(title);
  if (!slug) slug = slugify(title);

  // ensure unique slug
  let uniqueSlug = slug;
  let i = 1;
  while (await Blog.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${i++}`;
  }

    const blog = await Blog.findByIdAndUpdate(
      id,
      {
        title,
        slug: uniqueSlug,
        excerpt,
        content,
        coverImageUrl,
        status,
        tags,
        metaTitle,
        metaDescription,
        canonicalUrl,
        authorName,
        publishedAt
      },
      { new: true }
    ).select("title slug excerpt content coverImageUrl status tags metaTitle metaDescription canonicalUrl authorName publishedAt createdAt updatedAt");

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    await logActivity({
      action: "blog_updated",
      targetUserId: blog._id.toString(),
      actorUserId: (auth.user as any)._id.toString(),
      description: `Blog ${blog.title} (${blog.slug}) updated`,
    });

    return NextResponse.json(
      {
        id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt || "",
        content: blog.content || "",
        coverImageUrl: blog.coverImageUrl || "",
        status: blog.status,
        tags: blog.tags || [],
        metaTitle: blog.metaTitle || "",
        metaDescription: blog.metaDescription || "",
        canonicalUrl: blog.canonicalUrl || "",
        authorName: blog.authorName || "",
        publishedAt: blog.publishedAt || null,
        createdAt: blog.createdAt || null,
        updatedAt: blog.updatedAt || null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PUT /api/blogs/[id] error:", err);
    if (err?.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = getIdFromRequest(req);

  try {
    await connectToDatabase();

    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    await logActivity({
      action: "blog_deleted",
      targetUserId: blog._id.toString(),
      actorUserId: (auth.user as any)._id.toString(),
      description: `Blog ${blog.title} (${blog.slug}) deleted`,
    });

    return NextResponse.json({ message: "Blog deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/blogs/[id] error:", err);
    if (err?.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}