import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/admin";
import { logActivity } from "@/lib/activity";

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
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const search = searchParams.get("search") ?? "";

    const sortField = searchParams.get("sortField") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const allowedSortFields = ["firstName", "lastName", "email", "createdAt"];
    const sort: Record<string, 1 | -1> = {};

    if (allowedSortFields.includes(sortField)) {
      sort[sortField] = sortOrder;
    } else {
      sort["createdAt"] = -1;
    }

    const query =
      search.trim().length > 0
        ? {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { phone: { $regex: search, $options: "i" } },
            ],
          }
        : {};

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("firstName lastName email phone avatarUrl role createdAt")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const mapped = users.map((u: any) => ({
      id: u._id.toString(),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      avatarUrl: u.avatarUrl,
      role: u.role,
      createdAt: u.createdAt,
    }));

    return NextResponse.json(
      {
        users: mapped,
        total,
        page,
        limit,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/users error:", err);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

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

    const body = await req.json();
    const { firstName, lastName, phone, email, password, avatarUrl, role } =
      body;

    if (!firstName || !lastName || !phone || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
      avatarUrl: avatarUrl || "",
      role: role === "admin" ? "admin" : "user",
    });

    await logActivity({
      action: "user_created",
      targetUserId: user._id.toString(),
      actorUserId: (auth.user as any)._id.toString(),
      description: `User ${firstName} ${lastName} (${email}) created`,
    });

    return NextResponse.json(
      {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/users error:", err);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
