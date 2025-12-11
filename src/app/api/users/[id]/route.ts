import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireAdmin } from "@/lib/admin";
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

    const user = await User.findById(id)
      .select("firstName lastName email phone avatarUrl role createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GET /api/users/[id] error:", err);
    if (err?.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to fetch user" },
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
    const { firstName, lastName, phone, email, avatarUrl, role } = body;

    if (!firstName || !lastName || !phone || !email) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        phone,
        email,
        avatarUrl: avatarUrl || "",
        role: role === "admin" ? "admin" : "user",
      },
      { new: true }
    ).select("firstName lastName email phone avatarUrl role createdAt");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logActivity({
      action: "user_updated",
      targetUserId: user._id.toString(),
      actorUserId: (auth.user as any)._id.toString(),
      description: `User ${firstName} ${lastName} (${email}) updated`,
    });

    return NextResponse.json(
      {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        createdAt: user.createdAt,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PUT /api/users/[id] error:", err);
    if (err?.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update user" },
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

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await logActivity({
      action: "user_deleted",
      targetUserId: user._id.toString(),
      actorUserId: (auth.user as any)._id.toString(),
      description: `User ${user.firstName} ${user.lastName} (${user.email}) deleted`,
    });

    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  } catch (err: any) {
    console.error("DELETE /api/users/[id] error:", err);
    if (err?.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
