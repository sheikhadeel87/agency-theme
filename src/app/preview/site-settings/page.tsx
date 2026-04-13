import { SiteSettingsPreviewClient } from "@/components/preview/SiteSettingsPreviewClient";
import { getHomepageViewBundle } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getHomepageViewBundle();
  return <SiteSettingsPreviewClient {...data} />;
}
