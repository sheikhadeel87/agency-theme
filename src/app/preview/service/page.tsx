import { ServicePreviewClient } from "@/components/preview/ServicePreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function ServicePreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <ServicePreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
