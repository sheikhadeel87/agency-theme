import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContactForm } from "@/components/admin/ContactForm";
import { getSiteSettings } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function ContactAdminPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact & Map"
        description="Set the map embed URL and contact details shown on the Contact Us section."
      />
      <div className="rounded-xl border border-border bg-card p-6 ring-1 ring-foreground/10">
        <ContactForm initialData={settings} />
      </div>
    </div>
  );
}
