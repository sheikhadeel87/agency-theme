import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageVisibilityPanel } from "@/components/admin/PageVisibilityPanel";
import { getNavSectionVisibility } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function PageVisibilityPage() {
  const v = await getNavSectionVisibility();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Page visibility"
        description="Show or hide homepage sections and main navigation entries."
      />
      <PageVisibilityPanel
        initial={{
          hero: v.hero,
          whyChooseUs: v.whyChooseUs,
          services: v.services,
          portfolio: v.portfolio,
          team: v.team,
          testimonials: v.testimonials,
          pricing: v.pricing,
          blog: v.blog,
        }}
      />
    </div>
  );
}
