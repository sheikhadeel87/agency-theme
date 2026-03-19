"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { Service } from "@/models/Service";
import type { ServiceStatus } from "@/models/Service";
import { saveUploadedAdminImage } from "@/lib/upload-image";

export type SaveServiceState = {
  success?: boolean;
  error?: string;
};

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || "service";
}

export async function saveService(formData: FormData): Promise<SaveServiceState> {
  try {
    await dbConnect();

    const id = str(formData, "_id");
    let title = str(formData, "title");
    let slug = str(formData, "slug");
    if (!slug && title) slug = slugify(title);
    if (!slug) slug = `service-${Date.now()}`;

    const status = (formData.get("status")?.toString()?.trim() === "Published"
      ? "Published"
      : "Draft") as ServiceStatus;

    let imageUrl = str(formData, "imageUrl");
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      try {
        imageUrl = await saveUploadedAdminImage(file, {
          storageFolder: "services",
          idPrefix: slug,
        });
      } catch (err) {
        console.error("Service image upload error:", err);
      }
    } else if (id) {
      const existing = await Service.findById(id).lean();
      if (existing && (existing as { imageUrl?: string }).imageUrl) {
        imageUrl = (existing as { imageUrl: string }).imageUrl;
      }
    }

    const payload = {
      title,
      slug,
      description: str(formData, "description"),
      imageUrl,
      status,
      featuredOnHomepage: bool(formData, "featuredOnHomepage"),
      metaTitle: str(formData, "metaTitle") || title,
      metaDescription: str(formData, "metaDescription") || str(formData, "description"),
      metaKeywords: str(formData, "metaKeywords"),
    };

    if (id) {
      await Service.findByIdAndUpdate(id, { $set: payload }, { new: true });
    } else {
      await Service.create(payload);
    }

    try {
      revalidatePath("/");
      revalidatePath("/admin/services");
    } catch (e) {
      console.warn("revalidatePath after saveService:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("saveService error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save service.",
    };
  }
}

export async function deleteService(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    if (!id || !isValidObjectId(id)) return { error: "Invalid service id." };
    await Service.findByIdAndDelete(id);
    return { success: true };
  } catch (e) {
    console.error("deleteService error:", e);
    return { error: e instanceof Error ? e.message : "Failed to delete service." };
  }
}
