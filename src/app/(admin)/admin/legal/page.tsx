import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard } from "@/components/admin/AdminCard";
import { getLegalSections } from "@/lib/admin-data";

export default function LegalPage() {
  const sections = getLegalSections();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Legal"
        description="Manage Terms & Conditions, Privacy Policy, and other legal content."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {sections.map(({ title, description, actionHref }) => (
          <AdminCard
            key={title}
            title={title}
            description={description}
            actionHref={actionHref}
            actionLabel="Edit"
          />
        ))}
      </div>
    </div>
  );
}
