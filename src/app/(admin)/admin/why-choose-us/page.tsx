import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { WhyChooseUsForm } from "@/components/admin/WhyChooseUsForm";
import { getWhyChooseUsSettings } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function WhyChooseUsAdminPage() {
  const settings = await getWhyChooseUsSettings();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Why Choose Us"
        description="Section content, images, and SEO for the Why Choose Us block."
      />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <WhyChooseUsForm initialData={settings} />
      </div>
    </div>
  );
}
