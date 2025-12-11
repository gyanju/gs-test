// src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated (no token)" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userId = decoded.userId as string | undefined;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid token payload (no userId)" },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("GET /api/me error:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
