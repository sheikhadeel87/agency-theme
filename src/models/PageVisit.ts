import mongoose from "mongoose";

export interface IPageVisit {
  path: string;
  country: string;
  device: string;
  /** Coarse bucket from document.referrer (client). */
  source: string;
  createdAt: Date;
}

const pageVisitSchema = new mongoose.Schema<IPageVisit>(
  {
    path: { type: String, required: true, maxlength: 500 },
    country: { type: String, default: "Unknown" },
    device: { type: String, default: "unknown" },
    source: { type: String, default: "direct" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

pageVisitSchema.index({ createdAt: -1 });
pageVisitSchema.index({ path: 1 });
pageVisitSchema.index({ source: 1 });

export const PageVisit =
  mongoose.models.PageVisit ?? mongoose.model<IPageVisit>("PageVisit", pageVisitSchema);
