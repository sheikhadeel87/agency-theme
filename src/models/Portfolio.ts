import mongoose from "mongoose";

const portfolioStatuses = ["Draft", "Published"] as const;
export type PortfolioStatus = (typeof portfolioStatuses)[number];

export interface IPortfolio {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  client: string;
  categories: string[];
  technologyStack: string[];
  imageUrl: string;
  galleryImages: string[];
  projectUrl: string;
  status: PortfolioStatus;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioSchema = new mongoose.Schema<IPortfolio>(
  {
    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    client: { type: String, default: "" },
    categories: { type: [String], default: [] },
    technologyStack: { type: [String], default: [] },
    imageUrl: { type: String, default: "" },
    galleryImages: { type: [String], default: [] },
    projectUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: portfolioStatuses,
      default: "Draft",
    },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Portfolio =
  mongoose.models.Portfolio ??
  mongoose.model<IPortfolio>("Portfolio", portfolioSchema);
