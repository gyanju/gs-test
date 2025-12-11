import mongoose, { Schema, models, model } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
    }, // e.g. "user_created", "user_updated", "user_deleted"
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    actorUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const ActivityLog =
  models.ActivityLog || model("ActivityLog", ActivityLogSchema);
