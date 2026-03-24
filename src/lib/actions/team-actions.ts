"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { TeamSettings } from "@/models/TeamSettings";
import { TeamMember } from "@/models/TeamMember";
import { saveUploadedAdminImage } from "@/lib/upload-image";

export type SaveTeamSettingsState = { success?: boolean; error?: string };
export type SaveTeamMemberState = { success?: boolean; error?: string };
export type DeleteTeamMemberState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
}

/** Rich text — do not trim (preserves intentional HTML/spacing). */
function htmlField(formData: FormData, key: string): string {
  return formData.get(key)?.toString() ?? "";
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "") || "member"
  );
}

/** Ensure slug is unique among team members (excluding optional Mongo id). */
async function uniqueTeamSlug(base: string, excludeId?: string): Promise<string> {
  const { isValidObjectId } = await import("mongoose");
  const slug = (base || "member").toLowerCase().trim();
  let candidate = slug;
  for (let n = 0; n < 500; n += 1) {
    const q: Record<string, unknown> = { slug: candidate };
    if (excludeId && isValidObjectId(excludeId)) {
      q._id = { $ne: excludeId };
    }
    const exists = await TeamMember.findOne(q).select("_id").lean();
    if (!exists) return candidate;
    candidate = `${slug}-${n + 2}`;
  }
  return `${slug}-${Date.now()}`;
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
      isEnabled: bool(formData, "isEnabled"),
    };
    await TeamSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
    try {
      revalidatePath("/");
      revalidatePath("/admin/team");
    } catch (e) {
      console.warn("revalidatePath after saveTeamSettings:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("saveTeamSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save team section.",
    };
  }
}

/**
 * Save a team member (create or update).
 * `bioFromClient` is passed separately so HTML is not lost when FormData is serialized for the server action.
 */
export async function saveTeamMember(
  formData: FormData,
  bioFromClient?: string
): Promise<SaveTeamMemberState> {
  try {
    await dbConnect();
    const id = str(formData, "_id");
    const name = str(formData, "name");
    let imageUrl = str(formData, "imageUrl");
    const file = formData.get("image");

    let existing: {
      imageUrl?: string;
      slug?: string;
    } | null = null;
    if (id) {
      const doc = await TeamMember.findById(id).lean();
      if (doc) existing = doc as { imageUrl?: string; slug?: string };
    }

    if (file instanceof File && file.size > 0) {
      try {
        const filePrefix = name || "member";
        const safePrefix = filePrefix.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "") || "member";
        imageUrl = await saveUploadedAdminImage(file, {
          storageFolder: "team",
          idPrefix: safePrefix,
        });
      } catch (err) {
        console.error("Team member image upload error:", err);
      }
    } else if (existing?.imageUrl) {
      imageUrl = existing.imageUrl;
    }

    const order = parseInt(formData.get("order")?.toString() ?? "0", 10) || 0;
    let slugInput = str(formData, "slug");
    if (!slugInput && existing?.slug?.trim()) slugInput = existing.slug.trim();
    const slugBase = slugInput ? slugify(slugInput) : slugify(name);
    const slug = await uniqueTeamSlug(slugBase || "member", id || undefined);

    const bio =
      typeof bioFromClient === "string"
        ? bioFromClient
        : htmlField(formData, "bio");

    const payload = {
      name,
      slug,
      role: str(formData, "role"),
      bio,
      imageUrl,
      order,
      featuredOnHomepage: bool(formData, "featuredOnHomepage"),
    };
    if (id) {
      await TeamMember.findByIdAndUpdate(id, { $set: payload }, { new: true });
    } else {
      await TeamMember.create(payload);
    }
    try {
      revalidatePath("/");
      revalidatePath("/admin/team");
      revalidatePath(`/team/${encodeURIComponent(slug)}`);
    } catch (revalErr) {
      console.warn("revalidatePath after saveTeamMember:", revalErr);
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
    try {
      revalidatePath("/");
      revalidatePath("/admin/team");
    } catch (revalErr) {
      console.warn("revalidatePath after deleteTeamMember:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("deleteTeamMember error:", e);
    return { error: e instanceof Error ? e.message : "Failed to delete member." };
  }
}
