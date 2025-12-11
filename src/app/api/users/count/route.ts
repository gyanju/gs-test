import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();
    const count = await User.countDocuments();
    return NextResponse.json({ count }, { status: 200 });
  } catch (err) {
    console.error("GET /api/users/count error:", err);
    return NextResponse.json(
      { error: "Failed to get user count" },
      { status: 500 }
    );
  }
}
