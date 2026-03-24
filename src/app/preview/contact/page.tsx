import { ContactPreviewClient } from "@/components/preview/ContactPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function ContactPreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <ContactPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
