import mongoose from "mongoose";

export interface IAnalyticsEvent {
  name: string;
  createdAt: Date;
}

const analyticsEventSchema = new mongoose.Schema<IAnalyticsEvent>(
  {
    name: { type: String, required: true, maxlength: 64 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

analyticsEventSchema.index({ name: 1, createdAt: -1 });

export const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ??
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", analyticsEventSchema);
