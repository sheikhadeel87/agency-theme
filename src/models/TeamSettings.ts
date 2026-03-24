import mongoose from "mongoose";

export interface ITeamSettings {
  sectionTitle: string;
  sectionDescription: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamSettingsSchema = new mongoose.Schema<ITeamSettings>(
  {
    sectionTitle: { type: String, default: "Meet With Our Creative Dedicated Team" },
    sectionDescription: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TeamSettings =
  mongoose.models.TeamSettings ??
  mongoose.model<ITeamSettings>("TeamSettings", teamSettingsSchema);
