import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FeaturesHighlightsForm } from "@/components/admin/FeaturesHighlightsForm";
import { getFeaturesHighlightsSettings } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function FeaturesHighlightsAdminPage() {
  const settings = await getFeaturesHighlightsSettings();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support"
        description="Edit the three homepage cards in the Support section (/#support). Visibility is controlled under Page visibility and Site Settings."
      />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <FeaturesHighlightsForm initialData={settings} />
      </div>
    </div>
  );
}
