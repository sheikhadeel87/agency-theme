import { BlogPreviewClient } from "@/components/preview/BlogPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function BlogPreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <BlogPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
