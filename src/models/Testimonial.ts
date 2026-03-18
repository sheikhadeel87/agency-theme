import mongoose from "mongoose";

export interface ITestimonial {
  quote: string;
  authorName: string;
  designation: string;
  brandName: string;
  imageUrl: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<ITestimonial>(
  {
    quote: { type: String, default: "" },
    authorName: { type: String, default: "" },
    designation: { type: String, default: "" },
    brandName: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Testimonial =
  mongoose.models.Testimonial ?? mongoose.model<ITestimonial>("Testimonial", schema);
