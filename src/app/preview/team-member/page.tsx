import { TeamMemberPreviewClient } from "@/components/preview/TeamMemberPreviewClient";
import { loadPreviewShell } from "../_lib/load-preview-shell";

export const dynamic = "force-dynamic";

export default async function TeamMemberPreviewPage() {
  const { siteSettings, dynamicPages } = await loadPreviewShell();
  return <TeamMemberPreviewClient siteSettings={siteSettings} dynamicPages={dynamicPages} />;
}
