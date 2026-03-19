import mongoose from "mongoose";

const serviceStatuses = ["Draft", "Published"] as const;
export type ServiceStatus = (typeof serviceStatuses)[number];

export interface IService {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: ServiceStatus;
  /** Shown on homepage (max 3; newest first; others fill from latest published) */
  featuredOnHomepage: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>(
  {
    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: serviceStatuses,
      default: "Draft",
    },
    featuredOnHomepage: { type: Boolean, default: false },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Service =
  mongoose.models.Service ?? mongoose.model<IService>("Service", serviceSchema);
