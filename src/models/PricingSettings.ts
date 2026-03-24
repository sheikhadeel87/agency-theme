import mongoose from "mongoose";

export interface IPricingSettings {
  sectionTitle: string;
  sectionDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IPricingSettings>(
  {
    sectionTitle: { type: String, default: "We Offer Great Affordable Premium Prices." },
    sectionDescription: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PricingSettings =
  mongoose.models.PricingSettings ??
  mongoose.model<IPricingSettings>("PricingSettings", schema);
