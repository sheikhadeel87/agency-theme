"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/db";
import { PricingSettings } from "@/models/PricingSettings";
import { PricingPlan } from "@/models/PricingPlan";
import { PRICING_MAX_AMOUNT } from "@/lib/pricing-display";

export type SavePricingSettingsState = { success?: boolean; error?: string };
export type SavePricingPlanState = { success?: boolean; error?: string };
export type DeletePricingPlanState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

function num(formData: FormData, key: string): number {
  const v = formData.get(key)?.toString()?.trim().replace(/,/g, "") ?? "";
  if (v === "" || /e/i.test(v)) return 0;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > PRICING_MAX_AMOUNT) return 0;
  return Math.round(n * 100) / 100;
}

function intField(formData: FormData, key: string): number {
  const v = formData.get(key)?.toString()?.trim() ?? "";
  if (v === "" || /e/i.test(v)) return 0;
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 999_999);
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key)?.toString() === "true" || formData.get(key)?.toString() === "on";
}

/** Save pricing section settings + SEO (single doc, upsert) */
export async function savePricingSettings(
  formData: FormData
): Promise<SavePricingSettingsState> {
  try {
    await dbConnect();
    const sectionTitle = str(formData, "sectionTitle");
    const payload = {
      sectionTitle: sectionTitle || "We Offer Great Affordable Premium Prices.",
      sectionDescription: str(formData, "sectionDescription"),
      metaTitle: str(formData, "metaTitle") || sectionTitle,
      metaDescription: str(formData, "metaDescription") || str(formData, "sectionDescription"),
      metaKeywords: str(formData, "metaKeywords"),
      isEnabled: bool(formData, "isEnabled"),
    };
    await PricingSettings.findOneAndUpdate({}, { $set: payload }, { upsert: true, new: true });
    try {
      revalidatePath("/admin/pricing");
      revalidatePath("/");
      revalidatePath("/pricing");
    } catch (revalErr) {
      console.warn("revalidatePath after savePricingSettings:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("savePricingSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save pricing section.",
    };
  }
}

/** Parse features from form: newline-separated string -> string[] */
function parseFeatures(formData: FormData): string[] {
  const raw = formData.get("features")?.toString()?.trim() ?? "";
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Save or create a pricing plan */
export async function savePricingPlan(formData: FormData): Promise<SavePricingPlanState> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    const id = str(formData, "_id");
    const features = parseFeatures(formData);

    const payload = {
      name: str(formData, "name") || "Plan",
      priceMonthly: num(formData, "priceMonthly"),
      priceAnnual: num(formData, "priceAnnual"),
      periodLabel: str(formData, "periodLabel") || "per month",
      subtext: str(formData, "subtext") || "No credit card required",
      ctaText: str(formData, "ctaText") || "Try for free",
      ctaLink: str(formData, "ctaLink"),
      features,
      footnote: str(formData, "footnote") || "7-day free trial",
      featured: bool(formData, "featured"),
      featuredOnHomepage: bool(formData, "featuredOnHomepage"),
      order: intField(formData, "order"),
    };

    if (id && isValidObjectId(id)) {
      await PricingPlan.findByIdAndUpdate(id, { $set: payload }, { new: true });
    } else {
      const maxOrder = await PricingPlan.findOne().sort({ order: -1 }).select("order").lean();
      const order = (maxOrder && typeof (maxOrder as { order?: number }).order === "number")
        ? (maxOrder as { order: number }).order + 1
        : 0;
      await PricingPlan.create({ ...payload, order });
    }

    try {
      revalidatePath("/admin/pricing");
      revalidatePath("/");
      revalidatePath("/pricing");
    } catch (revalErr) {
      console.warn("revalidatePath after savePricingPlan:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("savePricingPlan error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save plan.",
    };
  }
}

/** Delete a pricing plan by id */
export async function deletePricingPlan(id: string): Promise<DeletePricingPlanState> {
  try {
    await dbConnect();
    const { isValidObjectId } = await import("mongoose");
    if (!id || !isValidObjectId(id)) return { error: "Invalid plan id." };
    await PricingPlan.findByIdAndDelete(id);
    try {
      revalidatePath("/admin/pricing");
      revalidatePath("/");
      revalidatePath("/pricing");
    } catch (revalErr) {
      console.warn("revalidatePath after deletePricingPlan:", revalErr);
    }
    return { success: true };
  } catch (e) {
    console.error("deletePricingPlan error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to delete plan.",
    };
  }
}
