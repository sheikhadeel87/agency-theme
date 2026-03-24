import { HeroPreviewClient } from "@/components/preview/HeroPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function HeroPreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <HeroPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
