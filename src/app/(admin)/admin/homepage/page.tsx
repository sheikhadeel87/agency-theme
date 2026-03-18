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
        <AdminCard
          title="Hero Section"
          description="Manage homepage hero content"
          actionHref="/admin/homepage/hero"
          actionLabel="Edit Hero"
        />
        {sections
          .filter((s) => s.title !== "Hero")
          .map(({ title, description }) => (
            <AdminCard
              key={title}
              title={title}
              description={description}
              actionHref="#"
              actionLabel="Edit"
            />
          ))}
      </div>
    </div>
  );
}
