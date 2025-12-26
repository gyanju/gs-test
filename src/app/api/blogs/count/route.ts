import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Blog } from "@/models/Blog";

export async function GET() {
  try {
    await connectToDatabase();
    const count = await Blog.countDocuments();
    console.log(count);
    return NextResponse.json({ count: count }, { status: 200 });
  } catch (err) {
    console.error("GET /api/blogs/count error:", err);
    return NextResponse.json(
      { error: "Failed to get blog count" },
      { status: 500 }
    );
  }
}
