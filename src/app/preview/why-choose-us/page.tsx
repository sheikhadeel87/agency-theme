import { WhyChooseUsPreviewClient } from "@/components/preview/WhyChooseUsPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function Page() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <WhyChooseUsPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
