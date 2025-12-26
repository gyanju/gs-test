import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return NextResponse.json({ error: admin.message }, { status: admin.status });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 50);
  const skip = (page - 1) * limit;

  await connectToDatabase();

  const filter: any = {};
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { excerpt: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
    ];
  }

  const [items, total] = await Promise.all([
    Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);

  return NextResponse.json({
    items: items.map((b: any) => ({
      id: b._id.toString(),
      title: b.title,
      slug: b.slug,
      status: b.status,
      tags: b.tags || [],
      publishedAt: b.publishedAt || null,
      updatedAt: b.updatedAt || null,
      createdAt: b.createdAt || null,
    })),
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin.ok) return NextResponse.json({ error: admin.message }, { status: admin.status });

  const body = await req.json();
  const title = (body.title || "").trim();
  const excerpt = (body.excerpt || "").trim();
  const content = body.content || "";
  const coverImageUrl = (body.coverImageUrl || "").trim();
  const status = body.status === "published" ? "published" : "draft";
  const tags = Array.isArray(body.tags) ? body.tags.map((t: string) => String(t).trim()).filter(Boolean) : [];

  const metaTitle = (body.metaTitle || "").trim();
  const metaDescription = (body.metaDescription || "").trim();
  const canonicalUrl = (body.canonicalUrl || "").trim();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  await connectToDatabase();

  let slug = (body.slug || "").trim() || slugify(title);
  if (!slug) slug = slugify(title);

  // ensure unique slug
  let uniqueSlug = slug;
  let i = 1;
  while (await Blog.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${i++}`;
  }

  const now = new Date();
  const publishedAt = status === "published" ? now : null;

  const doc = await Blog.create({
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
    authorId: admin.user._id.toString(),
    authorName: String(body.authorName || "Admin"),
    publishedAt,
  });

  return NextResponse.json({ id: doc._id.toString() }, { status: 201 });
}
