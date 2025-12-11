import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { User } from "@/models/User";

export async function getCurrentUserFromRequest(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;

  try {
    const payload = await verifyToken(token);
    const userId = payload.userId as string | undefined;
    if (!userId) return null;

    const user = await User.findById(userId).lean();
    if (!user) return null;

    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin(req: NextRequest) {
  const user = await getCurrentUserFromRequest(req);
  if (!user) {
    return { ok: false, status: 401 as const, message: "Not authenticated" };
  }

  if (user.role !== "admin") {
    return { ok: false, status: 403 as const, message: "Admin only" };
  }

  return { ok: true, user };
}
