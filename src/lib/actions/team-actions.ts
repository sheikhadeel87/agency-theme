"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { dbConnect } from "@/lib/db";
import { TeamSettings } from "@/models/TeamSettings";
import { TeamMember } from "@/models/TeamMember";

export type SaveTeamSettingsState = { success?: boolean; error?: string };
export type SaveTeamMemberState = { success?: boolean; error?: string };
export type DeleteTeamMemberState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

async function saveUploadedImage(file: File, prefix: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? ext : "jpg";
  const name = `${prefix}-${Date.now()}.${safeExt}`;
  const dir = path.join(process.cwd(), "public", "uploads", "team");
  await mkdir(dir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, name), Buffer.from(bytes));
  return `/uploads/team/${name}`;
}

/** Save team section settings + SEO (single doc, upsert) */
export async function saveTeamSettings(
  formData: FormData
): Promise<SaveTeamSettingsState> {
  try {
    await dbConnect();
    const sectionTitle = str(formData, "sectionTitle");
    const payload = {
      sectionTitle: sectionTitle || "Meet With Our Creative Dedicated Team",
      sectionDescription: str(formData, "sectionDescription"),
      metaTitle: str(formData, "metaTitle") || sectionTitle,
      metaDescription: str(formData, "metaDescription") || str(formData, "sectionDescription"),
      metaKeywords: str(formData, "metaKeywords"),
    };
    await TeamSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
    return { success: true };
  } catch (e) {
    console.error("saveTeamSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save team section.",
    };
  }
}

/** Save a team member (create or update) */
export async function saveTeamMember(formData: FormData): Promise<SaveTeamMemberState> {
  try {
    await dbConnect();
    const id = str(formData, "_id");
    let imageUrl = str(formData, "imageUrl");
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      try {
        const name = str(formData, "name") || "member";
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") || "member";
        imageUrl = await saveUploadedImage(file, slug);
      } catch (err) {
        console.error("Team member image upload error:", err);
      }
    } else if (id) {
      const existing = await TeamMember.findById(id).lean();
      if (existing && (existing as { imageUrl?: string }).imageUrl) {
        imageUrl = (existing as { imageUrl: string }).imageUrl;
      }
    }
    const order = parseInt(formData.get("order")?.toString() ?? "0", 10) || 0;
    const payload = {
      name: str(formData, "name"),
      role: str(formData, "role"),
      imageUrl,
      order,
    };
    if (id) {
      await TeamMember.findByIdAndUpdate(id, { $set: payload }, { new: true });
    } else {
      await TeamMember.create(payload);
    }
    return { success: true };
  } catch (e) {
    console.error("saveTeamMember error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save team member.",
    };
  }
}

/** Delete a team member */
export async function deleteTeamMember(id: string): Promise<DeleteTeamMemberState> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    if (!id || !isValidObjectId(id)) return { error: "Invalid member id." };
    await TeamMember.findByIdAndDelete(id);
    return { success: true };
  } catch (e) {
    console.error("deleteTeamMember error:", e);
    return { error: e instanceof Error ? e.message : "Failed to delete member." };
  }
}
