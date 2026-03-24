import { PortfolioPreviewClient } from "@/components/preview/PortfolioPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function PortfolioPreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <PortfolioPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
