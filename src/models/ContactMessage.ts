import mongoose from "mongoose";

export const CONTACT_MESSAGE_STATUSES = ["new", "read", "replied"] as const;
export type ContactMessageStatus = (typeof CONTACT_MESSAGE_STATUSES)[number];

export interface IContactMessage {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: Date;
}

const contactMessageSchema = new mongoose.Schema<IContactMessage>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: CONTACT_MESSAGE_STATUSES,
      default: "new",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

contactMessageSchema.index({ createdAt: -1 });
contactMessageSchema.index({ status: 1, createdAt: -1 });

export const ContactMessage =
  mongoose.models.ContactMessage ??
  mongoose.model<IContactMessage>("ContactMessage", contactMessageSchema);
