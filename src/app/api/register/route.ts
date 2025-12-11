// src/app/api/register/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { firstName, lastName, phone, email, password } = await req.json();

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !password ||
    password.length < 6
  ) {
    return NextResponse.json(
      { error: "All fields are required and password must be at least 6 characters." },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await User.create({
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
