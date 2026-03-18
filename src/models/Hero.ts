import mongoose from "mongoose";

export interface IHero {
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  badgeText: string;
  phoneText: string;
  createdAt: Date;
  updatedAt: Date;
}

const heroSchema = new mongoose.Schema<IHero>(
  {
    heading: { type: String, default: "" },
    description: { type: String, default: "" },
    ctaText: { type: String, default: "" },
    ctaLink: { type: String, default: "" },
    badgeText: { type: String, default: "" },
    phoneText: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Hero =
  mongoose.models.Hero ?? mongoose.model<IHero>("Hero", heroSchema);
