import mongoose from "mongoose";

export interface ITeamMember {
  name: string;
  role: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new mongoose.Schema<ITeamMember>(
  {
    name: { type: String, required: true, default: "" },
    role: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const TeamMember =
  mongoose.models.TeamMember ?? mongoose.model<ITeamMember>("TeamMember", teamMemberSchema);
