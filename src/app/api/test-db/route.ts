import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectToDatabase();

    const count = await User.countDocuments();

    return NextResponse.json(
      { message: "Mongo connected", userCount: count },
      { status: 200 }
    );
  } catch (err) {
    console.error("DB error:", err);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}
