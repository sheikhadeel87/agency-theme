import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewsletterAdminTable } from "@/components/admin/NewsletterAdminTable";

export const dynamic = "force-dynamic";

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter"
        description="Subscribers from the public footer signup. Search, paginate, or remove addresses."
      />
      <NewsletterAdminTable />
    </div>
  );
}
