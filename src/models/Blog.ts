import mongoose from "mongoose";

export interface IBlog {
  title: string;
  slug: string;
  description: string;
  content: string;
  author: string;
  imageUrl: string;
  is_featured: boolean;
  is_published: boolean;
  publishedAt: Date | null;
  // SEO
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new mongoose.Schema<IBlog>(
  {
    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    description: { type: String, default: "" },
    content: { type: String, default: "" },
    author: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    is_featured: { type: Boolean, default: false },
    is_published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    ogImage: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Blog =
  mongoose.models.Blog ?? mongoose.model<IBlog>("Blog", blogSchema);
