import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { getHomepageSections } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function HomepagePage() {
  const sections = await getHomepageSections();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage"
        description="Manage edit hero text, CTA buttons, and main section content."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map(({ title, description, actionHref, actionLabel }) => (
          <AdminCard
            key={title}
            title={title}
            description={description}
            actionHref={actionHref}
            actionLabel={actionLabel ?? "Edit"}
          />
        ))}
      </div>
    </div>
  );
}
