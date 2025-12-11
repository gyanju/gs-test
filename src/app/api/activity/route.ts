import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.message },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);

    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actorUser", "firstName lastName email")
      .populate("targetUser", "firstName lastName email")
      .lean();

    const mapped = logs.map((log: any) => ({
      id: log._id.toString(),
      action: log.action,
      description: log.description,
      createdAt: log.createdAt,
      actor: log.actorUser
        ? {
            name: `${log.actorUser.firstName} ${log.actorUser.lastName}`,
            email: log.actorUser.email,
          }
        : null,
      target: log.targetUser
        ? {
            name: `${log.targetUser.firstName} ${log.targetUser.lastName}`,
            email: log.targetUser.email,
          }
        : null,
    }));

    return NextResponse.json(mapped, { status: 200 });
  } catch (err) {
    console.error("GET /api/activity error:", err);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
