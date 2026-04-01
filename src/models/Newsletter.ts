import mongoose from "mongoose";
import { normalizeNewsletterEmail } from "@/lib/newsletter-email";

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
      validate: {
        validator: (v: string) => normalizeNewsletterEmail(v) !== null,
        message: "Invalid email",
      },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

newsletterSchema.index({ email: 1 }, { unique: true });
newsletterSchema.index({ createdAt: -1 });

export const Newsletter =
  mongoose.models.Newsletter ?? mongoose.model<INewsletter>("Newsletter", newsletterSchema);
