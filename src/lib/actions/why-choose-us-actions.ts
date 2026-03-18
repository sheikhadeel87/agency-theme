"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { dbConnect } from "@/lib/db";
import { WhyChooseUsSettings } from "@/models/WhyChooseUsSettings";

export type SaveWhyChooseUsState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

async function saveUploadedImage(file: File, name: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const filename = `${name}-${Date.now()}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", "why-choose-us");
  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, filename), Buffer.from(bytes));
  return `/uploads/why-choose-us/${filename}`;
}

export async function saveWhyChooseUsSettings(
  formData: FormData
): Promise<SaveWhyChooseUsState> {
  try {
    await dbConnect();

    const existing = await WhyChooseUsSettings.findOne().lean();
    const prev = existing as Record<string, unknown> | null;
    const clear1 = formData.get("image1Clear") === "true";
    const clear2 = formData.get("image2Clear") === "true";
    const clear3 = formData.get("image3Clear") === "true";

    let image1Url = clear1 ? "" : str(formData, "image1Url");
    let image2Url = clear2 ? "" : str(formData, "image2Url");
    let image3Url = clear3 ? "" : str(formData, "image3Url");

    const f1 = formData.get("image1");
    const f2 = formData.get("image2");
    const f3 = formData.get("image3");

    if (f1 instanceof File && f1.size > 0) {
      try {
        image1Url = await saveUploadedImage(f1, "top-left");
      } catch (err) {
        console.error("WhyChooseUs image1 upload error:", err);
      }
    } else if (!clear1 && prev?.image1Url) image1Url = String(prev.image1Url);

    if (f2 instanceof File && f2.size > 0) {
      try {
        image2Url = await saveUploadedImage(f2, "bottom-left");
      } catch (err) {
        console.error("WhyChooseUs image2 upload error:", err);
      }
    } else if (!clear2 && prev?.image2Url) image2Url = String(prev.image2Url);

    if (f3 instanceof File && f3.size > 0) {
      try {
        image3Url = await saveUploadedImage(f3, "right");
      } catch (err) {
        console.error("WhyChooseUs image3 upload error:", err);
      }
    } else if (!clear3 && prev?.image3Url) image3Url = String(prev.image3Url);

    const sectionTitle = str(formData, "sectionTitle");
    const payload = {
      sectionSubtitle: str(formData, "sectionSubtitle") || "Why Choose Us",
      sectionTitle: sectionTitle || "We Make Our customers happy by giving Best services.",
      sectionDescription: str(formData, "sectionDescription"),
      ctaText: str(formData, "ctaText") || "See How We Work",
      ctaLink: str(formData, "ctaLink") || "/#how-we-work",
      image1Url,
      image2Url,
      image3Url,
      image1Alt: str(formData, "image1Alt"),
      image2Alt: str(formData, "image2Alt"),
      image3Alt: str(formData, "image3Alt"),
      metaTitle: str(formData, "metaTitle") || sectionTitle,
      metaDescription: str(formData, "metaDescription") || str(formData, "sectionDescription"),
      metaKeywords: str(formData, "metaKeywords"),
    };

    await WhyChooseUsSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
    return { success: true };
  } catch (e) {
    console.error("saveWhyChooseUsSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save Why Choose Us section.",
    };
  }
}
