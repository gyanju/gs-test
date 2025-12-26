import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "No ids provided" },
        { status: 400 }
      );
    }

    const blogs = await Blog.find({ _id: { $in: ids } })
      .select("title slug")
      .lean();

    await Blog.deleteMany({ _id: { $in: ids } });
    for (const u of blogs) {
      await logActivity({
        action: "blog_deleted",
        targetUserId: u._id.toString(),
        actorUserId: (auth.user as any)._id.toString(),
        description: `Blog ${u.title} (${u.slug}) deleted via bulk delete`,
      });
    }

    return NextResponse.json(
      { message: "Blogs deleted", deletedCount: ids.length },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/blogs/bulk-delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete blogs" },
      { status: 500 }
    );
  }
}
