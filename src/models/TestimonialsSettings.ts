import mongoose from "mongoose";

export interface ITestimonialsSettings {
  sectionTitle: string;
  sectionDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<ITestimonialsSettings>(
  {
    sectionTitle: { type: String, default: "Client's Testimonials" },
    sectionDescription: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TestimonialsSettings =
  mongoose.models.TestimonialsSettings ??
  mongoose.model<ITestimonialsSettings>("TestimonialsSettings", schema);
