import { ActivityLog } from "@/models/ActivityLog";
import { connectToDatabase } from "./mongodb";

export async function logActivity(options: {
  action: string;
  targetUserId?: string;
  actorUserId?: string;
  description: string;
}) {
  const { action, targetUserId, actorUserId, description } = options;

  try {
    await connectToDatabase();
    await ActivityLog.create({
      action,
      targetUser: targetUserId || undefined,
      actorUser: actorUserId || undefined,
      description,
    });
  } catch (err) {
    console.error("Error logging activity:", err);
  }
}
