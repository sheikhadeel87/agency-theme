import mongoose from "mongoose";

export interface ITeamMember {
  name: string;
  slug: string;
  role: string;
  bio: string;
  imageUrl: string;
  order: number;
  featuredOnHomepage: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new mongoose.Schema<ITeamMember>(
  {
    name: { type: String, required: true, default: "" },
    slug: { type: String, default: "", index: true },
    role: { type: String, default: "" },
    bio: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
    featuredOnHomepage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const TeamMember =
  mongoose.models.TeamMember ?? mongoose.model<ITeamMember>("TeamMember", teamMemberSchema);
