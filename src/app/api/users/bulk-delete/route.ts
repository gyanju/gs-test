import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
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

    const users = await User.find({ _id: { $in: ids } })
      .select("firstName lastName email")
      .lean();

    await User.deleteMany({ _id: { $in: ids } });

    for (const u of users) {
      await logActivity({
        action: "user_deleted",
        targetUserId: u._id.toString(),
        actorUserId: (auth.user as any)._id.toString(),
        description: `User ${u.firstName} ${u.lastName} (${u.email}) deleted via bulk delete`,
      });
    }

    return NextResponse.json(
      { message: "Users deleted", deletedCount: ids.length },
      { status: 200 }
    );
  } catch (err) {
    console.error("POST /api/users/bulk-delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete users" },
      { status: 500 }
    );
  }
}
