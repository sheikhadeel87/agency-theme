import mongoose from "mongoose";

export interface INewsletter {
  email: string;
  createdAt: Date;
}

const newsletterSchema = new mongoose.Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

newsletterSchema.index({ email: 1 }, { unique: true });
newsletterSchema.index({ createdAt: -1 });

export const Newsletter =
  mongoose.models.Newsletter ?? mongoose.model<INewsletter>("Newsletter", newsletterSchema);
