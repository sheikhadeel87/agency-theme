import { TestimonialPreviewClient } from "@/components/preview/TestimonialPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function TestimonialPreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <TestimonialPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
