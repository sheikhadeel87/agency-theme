import { CmsPagePreviewClient } from "@/components/preview/CmsPagePreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function CmsPagePreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <CmsPagePreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
