import { SiteSettingsPreviewClient } from "@/components/preview/SiteSettingsPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <SiteSettingsPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
