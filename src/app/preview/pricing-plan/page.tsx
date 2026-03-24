import { PricingPlanPreviewClient } from "@/components/preview/PricingPlanPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function PricingPlanPreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <PricingPlanPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
