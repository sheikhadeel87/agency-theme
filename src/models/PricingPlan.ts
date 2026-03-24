import mongoose from "mongoose";

export interface IPricingPlan {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  periodLabel: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  features: string[];
  footnote: string;
  featured: boolean;
  featuredOnHomepage: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IPricingPlan>(
  {
    name: { type: String, default: "" },
    priceMonthly: { type: Number, default: 0, min: 0, max: 1_000_000 },
    priceAnnual: { type: Number, default: 0, min: 0, max: 1_000_000 },
    periodLabel: { type: String, default: "per month" },
    subtext: { type: String, default: "No credit card required" },
    ctaText: { type: String, default: "Try for free" },
    ctaLink: { type: String, default: "" },
    features: [{ type: String }],
    footnote: { type: String, default: "7-day free trial" },
    featured: { type: Boolean, default: false },
    featuredOnHomepage: { type: Boolean, default: false },
    order: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const PricingPlan =
  mongoose.models.PricingPlan ?? mongoose.model<IPricingPlan>("PricingPlan", schema);
