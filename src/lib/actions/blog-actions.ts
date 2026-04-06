"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { Blog } from "@/models/Blog";
import { saveUploadedAdminImage } from "@/lib/upload-image";

export type SaveBlogState = {
  success?: boolean;
  error?: string;
};

export type DeleteBlogState = {
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
    .replace(/^-+|-+$/g, "") || "post";
}

export async function saveBlog(formData: FormData): Promise<SaveBlogState> {
  try {
    await dbConnect();

    const id = str(formData, "_id");
    const is_published = bool(formData, "is_published");
    const is_featured = bool(formData, "is_featured");
    const title = str(formData, "title");
    let slug = str(formData, "slug");
    if (!slug && title) slug = slugify(title);
    if (!slug) slug = `post-${Date.now()}`;

    let imageUrl = str(formData, "imageUrl");
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) {
      try {
        imageUrl = await saveUploadedAdminImage(file, {
          storageFolder: "blog",
          idPrefix: slug,
        });
      } catch (err) {
        console.error("Image upload error:", err);
        return {
          error:
            err instanceof Error
              ? `Image upload failed: ${err.message}`
              : "Image upload failed. Check Cloudinary env vars or try a smaller image.",
        };
      }
    } else if (id) {
      const existing = await Blog.findById(id).lean();
      if (existing && (existing as { imageUrl?: string }).imageUrl) {
        imageUrl = (existing as { imageUrl: string }).imageUrl;
      }
    }

    const base = {
      title,
      slug,
      description: str(formData, "description"),
      content: str(formData, "content"),
      author: str(formData, "author"),
      imageUrl,
      is_featured,
      is_published,
      metaTitle: str(formData, "metaTitle") || title,
      metaDescription: str(formData, "metaDescription") || str(formData, "description"),
      metaKeywords: str(formData, "metaKeywords"),
      ogImage: str(formData, "ogImage") || imageUrl,
    };

    if (id) {
      const existing = await Blog.findById(id).lean();
      const wasPublished = existing && (existing as { is_published?: boolean }).is_published;
      const publishedAt = is_published
        ? (wasPublished ? (existing as { publishedAt?: Date }).publishedAt ?? new Date() : new Date())
        : null;
      await Blog.findByIdAndUpdate(id, { $set: { ...base, publishedAt } }, { new: true });
      await recordAdminAudit({
        action: "UPDATE_BLOG",
        resource: "blog",
        resourceId: id,
        metadata: { title: base.title, slug: base.slug },
      });
    } else {
      const created = await Blog.create({
        ...base,
        publishedAt: is_published ? new Date() : null,
      });
      await recordAdminAudit({
        action: "CREATE_BLOG",
        resource: "blog",
        resourceId: String(created._id),
        metadata: { title: base.title, slug: base.slug },
      });
    }

    try {
      revalidatePath("/");
      revalidatePath("/blog");
    } catch (revalErr) {
      console.warn("revalidatePath after saveBlog:", revalErr);
    }

    return { success: true };
  } catch (e) {
    console.error("saveBlog error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save post.",
    };
  }
}

export async function deleteBlog(id: string): Promise<DeleteBlogState> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    if (!id || !isValidObjectId(id)) {
      return { error: "Invalid post id." };
    }
    const existing = await Blog.findById(id).lean();
    const title = existing ? String((existing as { title?: string }).title ?? "") : "";
    const slug = existing ? String((existing as { slug?: string }).slug ?? "") : "";
    await Blog.findByIdAndDelete(id);
    try {
      revalidatePath("/");
      revalidatePath("/blog");
      revalidatePath("/admin/blog");
    } catch (revalErr) {
      console.warn("revalidatePath after deleteBlog:", revalErr);
    }
    await recordAdminAudit({
      action: "DELETE_BLOG",
      resource: "blog",
      resourceId: id,
      metadata: { title: title || undefined, slug: slug || undefined },
    });
    return { success: true };
  } catch (e) {
    console.error("deleteBlog error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to delete post.",
    };
  }
}
