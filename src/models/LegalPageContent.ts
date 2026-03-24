import mongoose from "mongoose";

export interface ILegalPageContent {
  privacyPolicyHtml: string;
  privacyLastUpdated: string;
  privacyMetaTitle: string;
  privacyMetaDescription: string;
  privacyMetaKeywords: string;
  termsConditionsHtml: string;
  termsLastUpdated: string;
  termsMetaTitle: string;
  termsMetaDescription: string;
  termsMetaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
}

const legalPageContentSchema = new mongoose.Schema<ILegalPageContent>(
  {
    privacyPolicyHtml: { type: String, default: "" },
    privacyLastUpdated: { type: String, default: "" },
    privacyMetaTitle: { type: String, default: "" },
    privacyMetaDescription: { type: String, default: "" },
    privacyMetaKeywords: { type: String, default: "" },
    termsConditionsHtml: { type: String, default: "" },
    termsLastUpdated: { type: String, default: "" },
    termsMetaTitle: { type: String, default: "" },
    termsMetaDescription: { type: String, default: "" },
    termsMetaKeywords: { type: String, default: "" },
  },
  { timestamps: true }
);

export const LegalPageContent =
  mongoose.models.LegalPageContent ??
  mongoose.model<ILegalPageContent>("LegalPageContent", legalPageContentSchema);
