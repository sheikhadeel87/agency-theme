"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { dbConnect } from "@/lib/db";
import { FeaturesHighlightsSettings } from "@/models/FeaturesHighlightsSettings";
import { normalizeFeatureHighlightCards } from "@/lib/features-highlights-defaults";
import { validateMaxLength } from "@/lib/section-title-description-limits";

export type SaveFeaturesHighlightsState = { success?: boolean; error?: string };

function str(formData: FormData, key: string): string {
  return formData.get(key)?.toString()?.trim() ?? "";
}

export async function saveFeaturesHighlightsSettings(
  formData: FormData
): Promise<SaveFeaturesHighlightsState> {
  try {
    await dbConnect();
    const raw: unknown[] = [];
    for (let i = 0; i < 3; i++) {
      const title = str(formData, `item_${i}_title`);
      const description = str(formData, `item_${i}_description`);
      const cardN = i + 1;
      const titleErr = validateMaxLength(`Support card ${cardN} title`, title);
      if (titleErr) return { error: titleErr };
      const descErr = validateMaxLength(`Support card ${cardN} description`, description);
      if (descErr) return { error: descErr };
      raw.push({
        title,
        description,
        iconKey: str(formData, `item_${i}_iconKey`),
        variant: str(formData, `item_${i}_variant`),
      });
    }
    const items = normalizeFeatureHighlightCards(raw);

    await FeaturesHighlightsSettings.findOneAndUpdate(
      {},
      { $set: { items } },
      { upsert: true, new: true }
    );

    await recordAdminAudit({
      action: "UPDATE_FEATURES_HIGHLIGHTS_SECTION",
      resource: "features-highlights-settings",
      metadata: { titles: items.map((c) => c.title) },
    });
    try {
      revalidatePath("/");
      revalidatePath("/admin/features-highlights");
      revalidatePath("/preview/site-settings");
    } catch (e) {
      console.warn("revalidatePath after saveFeaturesHighlightsSettings:", e);
    }
    return { success: true };
  } catch (e) {
    console.error("saveFeaturesHighlightsSettings error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to save support section.",
    };
  }
}
