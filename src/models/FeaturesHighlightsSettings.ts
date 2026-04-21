import mongoose from "mongoose";
import {
  defaultFeatureHighlightCards,
  FEATURE_HIGHLIGHT_ICON_KEYS,
  FEATURE_HIGHLIGHT_VARIANTS,
} from "@/lib/features-highlights-defaults";

export interface IFeaturesHighlightsSettings {
  items: {
    title: string;
    description: string;
    iconKey: string;
    variant: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    iconKey: {
      type: String,
      default: "lifebuoy",
      enum: [...FEATURE_HIGHLIGHT_ICON_KEYS],
    },
    variant: {
      type: String,
      default: "blue",
      enum: [...FEATURE_HIGHLIGHT_VARIANTS],
    },
  },
  { _id: false }
);

const schema = new mongoose.Schema<IFeaturesHighlightsSettings>(
  {
    items: {
      type: [itemSchema],
      default: () => defaultFeatureHighlightCards(),
    },
  },
  { timestamps: true }
);

export const FeaturesHighlightsSettings =
  mongoose.models.FeaturesHighlightsSettings ??
  mongoose.model<IFeaturesHighlightsSettings>("FeaturesHighlightsSettings", schema);
