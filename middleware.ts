// src/app/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";  // Assuming this function verifies the JWT token

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const role = req.cookies.get("user_role")?.value;  // Get role cookie

  // No token -> redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify token (assuming the token includes user information)
    await verifyToken(token);

    // If the route is for an admin page and the user is not an admin, redirect them to profile or another page
    if (req.nextUrl.pathname.startsWith("/dashboard") && role !== "admin") {
      return NextResponse.redirect(new URL("/profile", req.url));  // Redirect to profile if user is not admin
    }

    return NextResponse.next();  // Allow request to continue

  } catch (err) {
    console.error("Middleware token verify error:", err);
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("auth_token");  // Clear invalid auth token
    res.cookies.delete("user_role");   // Clear invalid user role
    return res;
  }
}

// Apply this middleware to protect dashboard and other pages
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/profile"],  // Adjust this if you want to protect other routes
};
