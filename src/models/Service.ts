import mongoose from "mongoose";

const serviceStatuses = ["Draft", "Published"] as const;
export type ServiceStatus = (typeof serviceStatuses)[number];

export interface IService {
  title: string;
  description: string;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new mongoose.Schema<IService>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: serviceStatuses,
      default: "Draft",
    },
  },
  { timestamps: true }
);

export const Service =
  mongoose.models.Service ?? mongoose.model<IService>("Service", serviceSchema);
