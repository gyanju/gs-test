import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { addHoursToDate, generateResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    console.log("[forgot-password] Incoming email:", email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log("[forgot-password] No user found for that email. Returning generic success.");
      return NextResponse.json(
        { message: "If that email exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    console.log("[forgot-password] User found:", user._id.toString());

    const token = generateResetToken();
    const expiry = addHoursToDate(1);

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    console.log("[forgot-password] Generated reset URL:", resetUrl);

    try {
      await sendPasswordResetEmail(email, resetUrl);
      console.log("[forgot-password] sendPasswordResetEmail completed");
    } catch (err) {
      console.error("[forgot-password] Error calling sendPasswordResetEmail:", err);
      // Still return generic success on purpose
    }

    return NextResponse.json(
      { message: "If that email exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
