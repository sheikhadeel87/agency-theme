"use server";

import { revalidatePath } from "next/cache";
import { recordAdminAudit } from "@/lib/audit-log";
import { setHomepageSectionLiveEnabled } from "@/lib/actions/site-settings-actions";
import { dbConnect } from "@/lib/db";
import { Hero } from "@/models/Hero";
import { WhyChooseUsSettings } from "@/models/WhyChooseUsSettings";
import { TeamSettings } from "@/models/TeamSettings";
import { TestimonialsSettings } from "@/models/TestimonialsSettings";
import { PricingSettings } from "@/models/PricingSettings";

export type LiveSectionId =
  | "hero"
  | "whyChooseUs"
  | "services"
  | "portfolio"
  | "team"
  | "testimonials"
  | "pricing"
  | "blog";

export type SetLiveSectionVisibilityState = { success?: boolean; error?: string };

function revalidateAfterDocToggle(section: LiveSectionId) {
  revalidatePath("/");
  revalidatePath("/admin/page-visibility");
  if (section === "hero") revalidatePath("/admin/homepage");
  if (section === "whyChooseUs") revalidatePath("/admin/why-choose-us");
  if (section === "team") revalidatePath("/admin/team");
  if (section === "testimonials") revalidatePath("/admin/testimonials");
  if (section === "pricing") revalidatePath("/admin/pricing");
}

export async function setLiveSectionVisibility(
  section: LiveSectionId,
  enabled: boolean
): Promise<SetLiveSectionVisibilityState> {
  if (section === "services" || section === "portfolio" || section === "blog") {
    return setHomepageSectionLiveEnabled(section, enabled);
  }

  try {
    await dbConnect();
    switch (section) {
      case "hero":
        await Hero.findOneAndUpdate({}, { $set: { isEnabled: enabled } }, { upsert: true, new: true });
        break;
      case "whyChooseUs":
        await WhyChooseUsSettings.findOneAndUpdate(
          {},
          { $set: { isEnabled: enabled } },
          { upsert: true, new: true }
        );
        break;
      case "team":
        await TeamSettings.findOneAndUpdate(
          {},
          { $set: { isEnabled: enabled } },
          { upsert: true, new: true }
        );
        break;
      case "testimonials":
        await TestimonialsSettings.findOneAndUpdate(
          {},
          { $set: { isEnabled: enabled } },
          { upsert: true, new: true }
        );
        break;
      case "pricing":
        await PricingSettings.findOneAndUpdate(
          {},
          { $set: { isEnabled: enabled } },
          { upsert: true, new: true }
        );
        break;
      default:
        return { error: "Unknown section." };
    }
    try {
      revalidateAfterDocToggle(section);
    } catch (e) {
      console.warn("revalidatePath after setLiveSectionVisibility:", e);
    }
    await recordAdminAudit({
      action: "UPDATE_PAGE_VISIBILITY",
      resource: "page-visibility",
      resourceId: section,
      metadata: { enabled },
    });
    return { success: true };
  } catch (e) {
    console.error("setLiveSectionVisibility error:", e);
    return {
      error: e instanceof Error ? e.message : "Failed to update section visibility.",
    };
  }
}
