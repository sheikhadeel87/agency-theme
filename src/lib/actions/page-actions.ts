"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { Page } from "@/models/Page";

export type SavePageState = { success?: boolean; error?: string };
export type DeletePageState = { success?: boolean; error?: string };

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
    .replace(/^-+|-+$/g, "") || "page";
}

export async function savePage(formData: FormData): Promise<SavePageState> {
  try {
    await dbConnect();

    const id = str(formData, "_id");
    const title = str(formData, "title");
    let slug = str(formData, "slug");
    if (!slug && title) slug = slugify(title);
    if (!slug) slug = `page-${Date.now()}`;

    const isPublished = bool(formData, "is_published");
    const isEnabled = bool(formData, "isEnabled");
    const payload = {
      title: title || "Untitled",
      slug,
      template: str(formData, "template") || "Default",
      content: str(formData, "content"),
      metaTitle: str(formData, "metaTitle") || title,
      metaDescription: str(formData, "metaDescription") || "",
      metaKeywords: str(formData, "metaKeywords") || "",
      status: isPublished ? "published" : "draft",
      isEnabled,
    };

    const { isValidObjectId } = await import("mongoose");
    if (id && isValidObjectId(id)) {
      await Page.findByIdAndUpdate(id, { $set: payload }, { new: true });
      await recordAdminAudit({
        action: "UPDATE_PAGE",
        resource: "page",
        resourceId: id,
        metadata: { title: payload.title, slug },
      });
    } else {
      const created = await Page.create(payload);
      await recordAdminAudit({
        action: "CREATE_PAGE",
        resource: "page",
        resourceId: String(created._id),
        metadata: { title: payload.title, slug },
      });
    }

    try {
      revalidatePath("/admin/pages");
      revalidatePath("/");
      revalidatePath(`/${slug}`);
    } catch (e) {
      console.warn("revalidatePath after savePage:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("savePage error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save page.",
    };
  }
}

export async function deletePage(id: string): Promise<DeletePageState> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    if (!id || !isValidObjectId(id)) return { error: "Invalid page id." };
    const existing = await Page.findById(id).lean();
    const title = existing ? String((existing as { title?: string }).title ?? "") : "";
    const slug = existing ? String((existing as { slug?: string }).slug ?? "") : "";
    await Page.findByIdAndDelete(id);
    try {
      revalidatePath("/admin/pages");
      revalidatePath("/");
    } catch (e) {
      console.warn("revalidatePath after deletePage:", e);
    }
    await recordAdminAudit({
      action: "DELETE_PAGE",
      resource: "page",
      resourceId: id,
      metadata: { title: title || undefined, slug: slug || undefined },
    });
    return { success: true };
  } catch (e) {
    console.error("deletePage error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to delete page.",
    };
  }
}
