import mongoose from "mongoose";

export interface IWhyChooseUsSettings {
  sectionSubtitle: string;
  sectionTitle: string;
  sectionDescription: string;
  ctaText: string;
  ctaLink: string;
  image1Url: string; // top-left
  image2Url: string; // bottom-left
  image3Url: string; // right
  image1Alt: string;
  image2Alt: string;
  image3Alt: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new mongoose.Schema<IWhyChooseUsSettings>(
  {
    sectionSubtitle: { type: String, default: "Why Choose Us" },
    sectionTitle: { type: String, default: "We Make Our customers happy by giving Best services." },
    sectionDescription: { type: String, default: "" },
    ctaText: { type: String, default: "See How We Work" },
    ctaLink: { type: String, default: "/#how-we-work" },
    image1Url: { type: String, default: "" },
    image2Url: { type: String, default: "" },
    image3Url: { type: String, default: "" },
    image1Alt: { type: String, default: "" },
    image2Alt: { type: String, default: "" },
    image3Alt: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
  },
  { timestamps: true }
);

export const WhyChooseUsSettings =
  mongoose.models.WhyChooseUsSettings ??
  mongoose.model<IWhyChooseUsSettings>("WhyChooseUsSettings", schema);
