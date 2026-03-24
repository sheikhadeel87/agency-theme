import mongoose from "mongoose";

export interface IPage {
  title: string;
  slug: string;
  template: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  status: "draft" | "published";
  /** When false, page is hidden from the live site (nav + direct URL). */
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pageSchema = new mongoose.Schema<IPage>(
  {
    title: { type: String, default: "" },
    slug: { type: String, default: "", unique: true },
    template: { type: String, default: "Default" },
    content: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Page =
  mongoose.models.Page ?? mongoose.model<IPage>("Page", pageSchema);
