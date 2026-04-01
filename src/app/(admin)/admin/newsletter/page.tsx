import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NewsletterAdminTable } from "@/components/admin/NewsletterAdminTable";

const sendLinkClass =
  "inline-flex h-8 items-center justify-center rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export const dynamic = "force-dynamic";

export default function AdminNewsletterPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Newsletter"
        description="Subscribers from the public footer signup. Search and remove addresses."
      >
        <Link href="/admin/newsletter/send" className={sendLinkClass}>
          Send newsletter
        </Link>
      </AdminPageHeader>
      <NewsletterAdminTable />
    </div>
  );
}
