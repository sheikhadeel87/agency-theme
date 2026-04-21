import { FeaturesHighlightsPreviewClient } from "@/components/preview/SectionSettingsPreviewClients";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <FeaturesHighlightsPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
