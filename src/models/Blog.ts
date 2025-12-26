import mongoose, { Schema, models, model } from "mongoose";

export type BlogStatus = "draft" | "published";

const BlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },

    excerpt: { type: String, default: "", trim: true },
    content: { type: String, default: "" }, // markdown or html

    coverImageUrl: { type: String, default: "", trim: true },

    status: { type: String, enum: ["draft", "published"], default: "draft" },

    tags: { type: [String], default: [] },

    metaTitle: { type: String, default: "", trim: true },
    metaDescription: { type: String, default: "", trim: true },
    canonicalUrl: { type: String, default: "", trim: true },

    authorId: { type: String, default: "" },
    authorName: { type: String, default: "" },

    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Blog = models.Blog || model("Blog", BlogSchema);
